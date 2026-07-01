const supabase = require('../config/database');

class LeaveCalculator {
  static async getQuotas() {
    try {
      const { data } = await supabase
        .from('system_config')
        .select('config_key, config_value')
        .in('config_key', [
          'annual_leave_allocation',
          'sick_leave_allocation',
          'study_leave_allocation',
          'family_leave_allocation'
        ]);

      const config = {};
      (data || []).forEach(row => { config[row.config_key] = row.config_value; });

      return {
        annual: parseFloat(config.annual_leave_allocation) || 25,
        sick: config.sick_leave_allocation?.toLowerCase() === 'unlimited'
          ? null  // null means unlimited
          : (parseFloat(config.sick_leave_allocation) || 30),
        study: parseFloat(config.study_leave_allocation) || 12,
        family: parseFloat(config.family_leave_allocation) || 5,
      };
    } catch (error) {
      // Fallback to defaults if system_config is unavailable
      return { annual: 25, sick: 30, study: 12, family: 5 };
    }
  }

  static getMonthsDiff(startDate, currentDate) {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    return (current.getFullYear() - start.getFullYear()) * 12 +
      (current.getMonth() - start.getMonth());
  }

  static getYearsDiff(startDate, currentDate) {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    return current.getFullYear() - start.getFullYear();
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

    const startDate = profile.employment_start_date;
    const now = new Date();

    // Annual: accrues monthly (e.g. 25 days/year = 2.08 days/month)
    const monthsWorked = Math.max(0, this.getMonthsDiff(startDate, now));
    const monthlyRate = quotas.annual / 12;
    const annualAccrued = Math.round(monthsWorked * monthlyRate * 100) / 100;

    // Sick, Study, Family: allocated per year of service
    const yearsWorked = Math.max(0, this.getYearsDiff(startDate, now));

    const leaveTypes = ['annual', 'sick', 'study', 'family'];
    const balance = {};

    for (const type of leaveTypes) {
      let accrued;

      if (type === 'annual') {
        accrued = annualAccrued;
      } else if (quotas[type] === null) {
        // Unlimited (e.g. unlimited sick leave)
        accrued = 999;
      } else {
        // Other leave types: allocated based on full years worked
        // First year gets the full allocation from day 1
        accrued = Math.max(quotas[type], quotas[type] * (yearsWorked + 1));
      }

      const typeAdjustments = (adjustments || [])
        .filter(a => a.leave_type === type)
        .reduce((sum, a) => sum + parseFloat(a.value_changed), 0);

      const taken = (approvedLeaves || [])
        .filter(l => l.leave_type === type)
        .reduce((sum, l) => sum + parseFloat(l.days_requested), 0);

      const current = accrued + typeAdjustments - taken;

      const latestAdjustment = (adjustments || [])
        .filter(a => a.leave_type === type)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      balance[type] = {
        accrued: Math.round(Math.max(0, accrued) * 100) / 100,
        adjustments: Math.round(typeAdjustments * 100) / 100,
        taken: Math.round(taken * 100) / 100,
        current: type === 'sick' && quotas[type] === null
          ? 999  // display as very large number for unlimited
          : Math.round(Math.max(0, current) * 100) / 100,
        adjustmentNotes: latestAdjustment?.reason || null,
        isUnlimited: type === 'sick' && quotas[type] === null,
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