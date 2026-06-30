const supabase = require('../config/database');

class LeaveCalculator {
  static async getQuotas() {
    const { data } = await supabase
      .from('system_config')
      .select('config_key, config_value')
      .in('config_key', ['annual_leave_allocation', 'sick_leave_allocation', 'study_leave_allocation', 'family_leave_allocation']);

    const config = {};
    (data || []).forEach(row => { config[row.config_key] = row.config_value; });

    return {
      annual: parseFloat(config.annual_leave_allocation) || 15,
      sick: config.sick_leave_allocation === 'Unlimited' ? Infinity : (parseFloat(config.sick_leave_allocation) || 30),
      study: parseFloat(config.study_leave_allocation) || 12,
      family: parseFloat(config.family_leave_allocation) || 5,
    };
  }

  static async calculateAccruedDays(startDate, currentDate, leaveType, quotas) {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    
    const monthsDiff = (current.getFullYear() - start.getFullYear()) * 12 +
      (current.getMonth() - start.getMonth());
    
    if (leaveType === 'annual') {
      const monthlyRate = quotas.annual / 12;
      return Math.max(0, monthsDiff * monthlyRate);
    } else {
      const yearsDiff = current.getFullYear() - start.getFullYear();
      const quota = quotas[leaveType];
      if (quota === Infinity) return 999; // effectively unlimited, displayed separately
      return quota * Math.max(0, yearsDiff);
    }
  }
  
  static async getUserLeaveBalance(userId) {
    const quotas = await this.getQuotas();

    const { data: profile } = await supabase
      .from('profiles')
      .select('employment_start_date')
      .eq('id', userId)
      .single();
    
    if (!profile) throw new Error('User not found');
    
    const { data: adjustments } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('intern_id', userId)
      .order('created_at', { ascending: true });
    
    const { data: approvedLeaves } = await supabase
      .from('leave_requests')
      .select('leave_type, days_requested')
      .eq('intern_id', userId)
      .eq('status', 'approved');
    
    const leaveTypes = ['annual', 'sick', 'study', 'family'];
    const balance = {};
    
    for (const type of leaveTypes) {
      const accrued = await this.calculateAccruedDays(
        profile.employment_start_date,
        new Date(),
        type,
        quotas
      );
      
      const typeAdjustments = adjustments
        .filter(a => a.leave_type === type)
        .reduce((sum, a) => sum + a.value_changed, 0);
      
      const taken = approvedLeaves
        .filter(l => l.leave_type === type)
        .reduce((sum, l) => sum + l.days_requested, 0);
      
      const current = accrued + typeAdjustments - taken;
      
      const latestAdjustment = adjustments
        .filter(a => a.leave_type === type)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      balance[type] = {
        accrued: Math.round(Math.max(0, accrued) * 100) / 100,
        adjustments: Math.round(typeAdjustments * 100) / 100,
        taken: Math.round(taken * 100) / 100,
        current: Math.round(Math.max(0, current) * 100) / 100,
        adjustmentNotes: latestAdjustment?.reason || null,
      };
    }
    
    return balance;
  }
  
  static async logAdjustment(internId, supervisorId, leaveType, valueChanged, reason) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        intern_id: internId,
        modifier_id: supervisorId,
        leave_type: leaveType,
        value_changed: valueChanged,
        reason: reason,
      }]);
    
    if (error) throw error;
    return data;
  }
}

module.exports = LeaveCalculator;