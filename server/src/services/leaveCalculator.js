const supabase = require('../config/database');

class LeaveCalculator {
  static async calculateAccruedDays(startDate, currentDate, leaveType) {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    
    // Calculate months difference
    const monthsDiff = (current.getFullYear() - start.getFullYear()) * 12 +
      (current.getMonth() - start.getMonth());
    
    if (leaveType === 'annual') {
      // 2.08 days per month for annual leave
      return Math.max(0, monthsDiff * 2.08);
    } else {
      // Default annual quotas for other leave types
      const quotas = {
        sick: 30, // 30 days per year
        study: 12, // 12 days per year
        family: 5, // 5 days per year
      };
      
      // Calculate years difference
      const yearsDiff = current.getFullYear() - start.getFullYear();
      return quotas[leaveType] * Math.max(0, yearsDiff);
    }
  }
  
  static async getUserLeaveBalance(userId) {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('employment_start_date')
      .eq('id', userId)
      .single();
    
    if (!profile) throw new Error('User not found');
    
    // Get all adjustments
    const { data: adjustments } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('intern_id', userId)
      .order('created_at', { ascending: true });
    
    // Get all approved leave requests
    const { data: approvedLeaves } = await supabase
      .from('leave_requests')
      .select('leave_type, days_requested')
      .eq('intern_id', userId)
      .eq('status', 'approved');
    
    const leaveTypes = ['annual', 'sick', 'study', 'family'];
    const balance = {};
    
    for (const type of leaveTypes) {
      // Calculate accrued days
      const accrued = await this.calculateAccruedDays(
        profile.employment_start_date,
        new Date(),
        type
      );
      
      // Calculate adjustments
      const typeAdjustments = adjustments
        .filter(a => a.leave_type === type)
        .reduce((sum, a) => sum + a.value_changed, 0);
      
      // Calculate taken days
      const taken = approvedLeaves
        .filter(l => l.leave_type === type)
        .reduce((sum, l) => sum + l.days_requested, 0);
      
      const current = accrued + typeAdjustments - taken;
      
      // Get latest adjustment note
      const latestAdjustment = adjustments
        .filter(a => a.leave_type === type)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      balance[type] = {
        accrued: Math.max(0, accrued),
        adjustments: typeAdjustments,
        taken: taken,
        current: Math.max(0, current),
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