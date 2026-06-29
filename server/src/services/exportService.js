const XLSX = require('xlsx');
const supabase = require('../config/database');
const LeaveCalculator = require('./leaveCalculator');

class ExportService {
  static async exportTeamLeaveSummary(supervisorId) {
    try {
      // Get team members
      const { data: team, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          department,
          employment_start_date,
          leave_requests (
            id,
            leave_type,
            days_requested,
            status,
            start_date,
            end_date,
            created_at
          ),
          audit_logs (
            id,
            leave_type,
            value_changed,
            reason,
            created_at
          )
        `)
        .eq('role', 'intern')
        .eq('supervisor_id', supervisorId);
      
      if (error) throw error;
      
      const exportData = [];
      
      for (const member of team) {
        const balance = await LeaveCalculator.getUserLeaveBalance(member.id);
        
        // Get leave requests by type
        const requestsByType = {
          annual: { approved: 0, pending: 0, rejected: 0, total: 0 },
          sick: { approved: 0, pending: 0, rejected: 0, total: 0 },
          study: { approved: 0, pending: 0, rejected: 0, total: 0 },
          family: { approved: 0, pending: 0, rejected: 0, total: 0 },
        };
        
        member.leave_requests?.forEach(request => {
          if (requestsByType[request.leave_type]) {
            requestsByType[request.leave_type][request.status]++;
            requestsByType[request.leave_type].total++;
          }
        });
        
        // Get recent adjustments
        const recentAdjustments = member.audit_logs
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        exportData.push({
          'Name': member.full_name,
          'Email': member.email,
          'Department': member.department || 'N/A',
          'Employment Start': new Date(member.employment_start_date).toLocaleDateString(),
          
          // Current Balances
          'Annual Leave Balance': balance.annual.current.toFixed(2),
          'Sick Leave Balance': balance.sick.current.toFixed(2),
          'Study Leave Balance': balance.study.current.toFixed(2),
          'Family Leave Balance': balance.family.current.toFixed(2),
          
          // Annual Leave Details
          'Annual - Accrued': balance.annual.accrued.toFixed(2),
          'Annual - Adjustments': balance.annual.adjustments.toFixed(2),
          'Annual - Taken': balance.annual.taken.toFixed(2),
          
          // Sick Leave Details
          'Sick - Total Quota': balance.sick.accrued.toFixed(2),
          'Sick - Adjustments': balance.sick.adjustments.toFixed(2),
          'Sick - Taken': balance.sick.taken.toFixed(2),
          
          // Request Statistics
          'Total Leave Requests': member.leave_requests?.length || 0,
          'Approved Requests': member.leave_requests?.filter(r => r.status === 'approved').length || 0,
          'Pending Requests': member.leave_requests?.filter(r => r.status === 'pending').length || 0,
          'Rejected Requests': member.leave_requests?.filter(r => r.status === 'rejected').length || 0,
          
          // Requests by Type
          'Annual Requests': requestsByType.annual.total,
          'Annual Approved': requestsByType.annual.approved,
          'Sick Requests': requestsByType.sick.total,
          'Sick Approved': requestsByType.sick.approved,
          'Study Requests': requestsByType.study.total,
          'Study Approved': requestsByType.study.approved,
          'Family Requests': requestsByType.family.total,
          'Family Approved': requestsByType.family.approved,
          
          // Recent Adjustments (first 5)
          'Recent Adjustments': recentAdjustments?.map(a => 
            `${a.leave_type}: ${a.value_changed > 0 ? '+' : ''}${a.value_changed} days (${new Date(a.created_at).toLocaleDateString()})`
          ).join('; ') || 'None',
        });
      }
      
      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Main summary sheet
      const summarySheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Team Summary');
      
      // Department summary
      const deptSummary = this.generateDepartmentSummary(exportData);
      const deptSheet = XLSX.utils.json_to_sheet(deptSummary);
      XLSX.utils.book_append_sheet(workbook, deptSheet, 'Department Summary');
      
      // Leave usage trends
      const trendsData = await this.generateLeaveTrends(supervisorId);
      const trendsSheet = XLSX.utils.json_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Leave Trends');
      
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
  
  static generateDepartmentSummary(exportData) {
    const deptMap = new Map();
    
    exportData.forEach(record => {
      const dept = record['Department'];
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          Department: dept,
          'Total Employees': 0,
          'Total Annual Balance': 0,
          'Total Sick Balance': 0,
          'Total Study Balance': 0,
          'Total Family Balance': 0,
          'Total Requests': 0,
          'Total Approved': 0,
        });
      }
      
      const deptData = deptMap.get(dept);
      deptData['Total Employees']++;
      deptData['Total Annual Balance'] += parseFloat(record['Annual Leave Balance']);
      deptData['Total Sick Balance'] += parseFloat(record['Sick Leave Balance']);
      deptData['Total Study Balance'] += parseFloat(record['Study Leave Balance']);
      deptData['Total Family Balance'] += parseFloat(record['Family Leave Balance']);
      deptData['Total Requests'] += record['Total Leave Requests'];
      deptData['Total Approved'] += record['Approved Requests'];
    });
    
    const summary = Array.from(deptMap.values()).map(dept => ({
      ...dept,
      'Average Annual Balance': (dept['Total Annual Balance'] / dept['Total Employees']).toFixed(2),
      'Average Sick Balance': (dept['Total Sick Balance'] / dept['Total Employees']).toFixed(2),
      'Approval Rate': ((dept['Total Approved'] / dept['Total Requests']) * 100).toFixed(1) + '%',
    }));
    
    return summary;
  }
  
  static async generateLeaveTrends(supervisorId) {
    // Get last 6 months of leave requests
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: requests, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        intern:intern_id (
          full_name,
          department
        )
      `)
      .eq('intern.supervisor_id', supervisorId)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    const monthlyData = {};
    const leaveTypes = ['annual', 'sick', 'study', 'family'];
    
    requests?.forEach(request => {
      const month = new Date(request.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          Month: month,
          Annual: 0,
          Sick: 0,
          Study: 0,
          Family: 0,
          Total: 0,
        };
      }
      
      monthlyData[month][request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)] += request.days_requested;
      monthlyData[month].Total += request.days_requested;
    });
    
    return Object.values(monthlyData);
  }
  
  static async exportAuditLogs(internId, supervisorId) {
    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          modifier:modifier_id (
            full_name,
            email
          ),
          intern:intern_id (
            full_name,
            email
          )
        `)
        .eq('intern_id', internId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const exportData = logs.map(log => ({
        'Date': new Date(log.created_at).toLocaleString(),
        'Intern Name': log.intern?.full_name,
        'Intern Email': log.intern?.email,
        'Modified By': log.modifier?.full_name,
        'Modified By Email': log.modifier?.email,
        'Leave Type': log.leave_type,
        'Value Changed': log.value_changed > 0 ? `+${log.value_changed}` : log.value_changed.toString(),
        'Reason': log.reason,
      }));
      
      const sheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Audit Logs');
      
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      console.error('Export audit logs error:', error);
      throw error;
    }
  }
}

module.exports = ExportService;