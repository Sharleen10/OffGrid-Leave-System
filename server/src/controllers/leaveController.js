const supabase = require('../config/database');
const LeaveCalculator = require('../services/leaveCalculator');
const EmailService = require('../services/emailService');
const ActivityLogger = require('../services/activityLogger');

class LeaveController {
  static async submitRequest(req, res) {
    try {
      const { leave_type, start_date, end_date, days_requested, reason, attachment_url, attachment_name } = req.body;
      const internId = req.user.id;
      
      const balance = await LeaveCalculator.getUserLeaveBalance(internId);
      if (days_requested > balance[leave_type].current) {
        return res.status(400).json({ error: 'Insufficient leave balance' });
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('supervisor_id')
        .eq('id', internId)
        .single();
      
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([{
          intern_id: internId,
          leave_type,
          start_date,
          end_date,
          days_requested,
          reason,
          status: 'pending',
          attachment_url: attachment_url || null,
          attachment_name: attachment_name || null,
        }])
        .select()
        .single();
      
      if (error) throw error;

      ActivityLogger.log(
        internId,
        req.user.profile.full_name,
        'leave_submitted',
        `${req.user.profile.full_name} submitted a ${leave_type} leave request`,
        internId
      );
      
      if (profile?.supervisor_id) {
        try {
          const { data: supervisor } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', profile.supervisor_id)
            .single();
          
          if (supervisor) {
            await EmailService.notifySupervisor(
              req.user.profile.full_name,
              supervisor.email,
              data
            );
          }
        } catch (emailError) {
          console.error('Supervisor email failed (non-blocking):', emailError);
        }
      }
      
      res.status(201).json(data);
    } catch (error) {
      console.error('Submit request error:', error);
      res.status(500).json({ error: 'Failed to submit leave request', details: error.message });
    }
  }
  
  static async getMyRequests(req, res) {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('intern_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get my requests error:', error);
      res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
  }
  
  static async getMyBalance(req, res) {
    try {
      const balance = await LeaveCalculator.getUserLeaveBalance(req.user.id);
      res.json(balance);
    } catch (error) {
      console.error('Get my balance error:', error);
      res.status(500).json({ error: 'Failed to calculate leave balance' });
    }
  }
  
  static async getTeamRequests(req, res) {
    try {
      if (req.user.role === 'intern') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          intern:intern_id (
            id,
            full_name,
            email,
            department
          )
        `)
        .order('created_at', { ascending: false });
      
      if (req.user.role === 'supervisor') {
        const { data: team } = await supabase
          .from('profiles')
          .select('id')
          .eq('supervisor_id', req.user.id);
        
        const teamIds = team.map(m => m.id);
        query = query.in('intern_id', teamIds);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get team requests error:', error);
      res.status(500).json({ error: 'Failed to fetch team requests' });
    }
  }

  static async getDashboardSummary(req, res) {
    try {
      if (req.user.role === 'intern') {
        return res.status(403).json({ error: 'Access denied' });
      }

      let teamIds = [];
      if (req.user.role === 'supervisor') {
        const { data: team } = await supabase
          .from('profiles')
          .select('id')
          .eq('supervisor_id', req.user.id);
        teamIds = team.map(m => m.id);
      } else {
        const { data: allInterns } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'intern');
        teamIds = allInterns.map(m => m.id);
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: allRequests, error } = await supabase
        .from('leave_requests')
        .select('id, status, created_at, reviewed_at')
        .in('intern_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000']);

      if (error) throw error;

      const pending = allRequests.filter(r => r.status === 'pending').length;
      const approvedThisMonth = allRequests.filter(r => 
        r.status === 'approved' && r.reviewed_at && new Date(r.reviewed_at) >= startOfMonth
      ).length;
      const rejectedThisMonth = allRequests.filter(r => 
        r.status === 'rejected' && r.reviewed_at && new Date(r.reviewed_at) >= startOfMonth
      ).length;

      res.json({
        pending,
        approvedThisMonth,
        rejectedThisMonth,
        assignedInterns: teamIds.length,
      });
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary', details: error.message });
    }
  }

  static async getRequestDetail(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          intern:intern_id (
            id,
            full_name,
            email,
            department,
            supervisor_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (req.user.role === 'supervisor' && data.intern.supervisor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(data);
    } catch (error) {
      console.error('Get request detail error:', error);
      res.status(500).json({ error: 'Failed to fetch request detail', details: error.message });
    }
  }
  
  static async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;
      
      const { data: request, error: fetchError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          intern:intern_id (
            id,
            email,
            full_name
          )
        `)
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status, comments, reviewed_at: new Date(), reviewed_by: req.user.id })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      ActivityLogger.log(
        req.user.id,
        req.user.profile.full_name,
        status === 'approved' ? 'leave_approved' : 'leave_rejected',
        `${request.intern.full_name}'s leave was ${status}`,
        request.intern.id
      );
      
      try {
        await EmailService.notifyIntern(
          request.intern.email,
          request.intern.full_name,
          request,
          status,
          comments
        );
      } catch (emailError) {
        console.error('Intern email failed (non-blocking):', emailError);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({ error: 'Failed to update request status', details: error.message });
    }
  }

  static async cancelRequest(req, res) {
    try {
      const { id } = req.params;

      const { data: request, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*, intern:intern_id(full_name)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (request.intern_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only cancel your own requests' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending requests can be cancelled' });
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      ActivityLogger.log(
        req.user.id,
        request.intern.full_name,
        'leave_cancelled',
        `${request.intern.full_name} cancelled a leave request`,
        req.user.id
      );

      res.json(data);
    } catch (error) {
      console.error('Cancel request error:', error);
      res.status(500).json({ error: 'Failed to cancel request', details: error.message });
    }
  }
  
  static async adjustBalance(req, res) {
    try {
      const { intern_id, leave_type, value, reason } = req.body;
      
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Reason is required for balance adjustment' });
      }
      
      await LeaveCalculator.logAdjustment(
        intern_id,
        req.user.id,
        leave_type,
        value,
        reason
      );

      const { data: intern } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', intern_id)
        .single();

      ActivityLogger.log(
        req.user.id,
        req.user.profile.full_name,
        'balance_adjusted',
        `${intern?.full_name || 'An intern'}'s ${leave_type} balance was adjusted by ${value > 0 ? '+' : ''}${value} days`,
        intern_id
      );
      
      try {
        if (intern) {
          await EmailService.notifyBalanceAdjustment(
            intern.email,
            intern.full_name,
            leave_type,
            value,
            reason,
            req.user.profile.full_name
          );
        }
      } catch (emailError) {
        console.error('Adjustment email failed (non-blocking):', emailError);
      }
      
      res.json({ success: true, message: 'Balance adjusted successfully' });
    } catch (error) {
      console.error('Adjust balance error:', error);
      res.status(500).json({ error: 'Failed to adjust balance', details: error.message });
    }
  }

  static async getRecentActivity(req, res) {
    try {
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (req.user.role === 'supervisor') {
        const { data: team } = await supabase
          .from('profiles')
          .select('id')
          .eq('supervisor_id', req.user.id);
        const teamIds = team.map(m => m.id);
        query = query.in('related_intern_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000']);
      }

      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity', details: error.message });
    }
  }

  static async getTeamBalances(req, res) {
    try {
      if (req.user.role === 'intern') {
        return res.status(403).json({ error: 'Access denied' });
      }

      let query = supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('role', 'intern');

      if (req.user.role === 'supervisor') {
        query = query.eq('supervisor_id', req.user.id);
      }

      const { data: interns, error } = await query;
      if (error) throw error;

      const results = await Promise.all(
        interns.map(async (intern) => {
          const balance = await LeaveCalculator.getUserLeaveBalance(intern.id);
          const totalAllocated = balance.annual.accrued + balance.annual.adjustments;
          const used = balance.annual.taken;
          const remaining = balance.annual.current;

          return {
            id: intern.id,
            full_name: intern.full_name,
            email: intern.email,
            department: intern.department,
            leave_balance: totalAllocated.toFixed(2),
            used: used.toFixed(2),
            remaining: remaining.toFixed(2),
          };
        })
      );

      res.json(results);
    } catch (error) {
      console.error('Get team balances error:', error);
      res.status(500).json({ error: 'Failed to fetch team balances', details: error.message });
    }
  }

  static async getReportsData(req, res) {
    try {
      if (req.user.role === 'intern') {
        return res.status(403).json({ error: 'Access denied' });
      }

      let teamIds = [];
      if (req.user.role === 'supervisor') {
        const { data: team } = await supabase
          .from('profiles')
          .select('id')
          .eq('supervisor_id', req.user.id);
        teamIds = team.map(m => m.id);
      } else {
        const { data: allInterns } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'intern');
        teamIds = allInterns.map(m => m.id);
      }

      if (teamIds.length === 0) {
        return res.json({ byMonth: [], byStatus: [], byType: [], interns: [] });
      }

      const { data: requests, error } = await supabase
        .from('leave_requests')
        .select(`
          id, leave_type, status, days_requested, created_at,
          intern:intern_id ( id, full_name )
        `)
        .in('intern_id', teamIds)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const monthMap = {};
      requests.forEach(r => {
        const month = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const byMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      const pending = requests.filter(r => r.status === 'pending').length;
      const byStatus = [
        { name: 'Approved', value: approved },
        { name: 'Rejected', value: rejected },
        { name: 'Pending', value: pending },
      ];

      const typeMap = {};
      requests.forEach(r => {
        typeMap[r.leave_type] = (typeMap[r.leave_type] || 0) + 1;
      });
      const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

      const internsMap = {};
      requests.forEach(r => {
        if (r.intern) internsMap[r.intern.id] = r.intern.full_name;
      });
      const interns = Object.entries(internsMap).map(([id, full_name]) => ({ id, full_name }));

      const raw = requests.map(r => ({
        id: r.id,
        leave_type: r.leave_type,
        status: r.status,
        days_requested: r.days_requested,
        created_at: r.created_at,
        intern_id: r.intern?.id,
        intern_name: r.intern?.full_name,
      }));

      res.json({ byMonth, byStatus, byType, interns, raw });
    } catch (error) {
      console.error('Get reports data error:', error);
      res.status(500).json({ error: 'Failed to fetch reports data', details: error.message });
    }
  }

  static async uploadAttachment(req, res) {
    try {
      const multer = require('multer');
      const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single('file');

      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message || 'File upload failed' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file provided' });
        }

        const internId = req.user.id;
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${internId}/${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from('leave-attachments')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Storage upload error:', error);
          return res.status(500).json({ error: 'Failed to upload file', details: error.message });
        }

        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('leave-attachments')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        if (urlError) {
          console.error('Signed URL error:', urlError);
          return res.status(500).json({ error: 'Failed to generate file URL' });
        }

        res.json({
          attachment_url: signedUrlData.signedUrl,
          attachment_name: req.file.originalname,
        });
      });
    } catch (error) {
      console.error('Upload attachment error:', error);
      res.status(500).json({ error: 'Failed to upload attachment', details: error.message });
    }
  }

  // Admin: get ALL leave requests across the company
  static async getAllLeaveRequests(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { status } = req.query;

      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          intern:intern_id (
            id, full_name, email, department, supervisor_id
          )
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;
      if (error) throw error;

      // Manually attach supervisor info (avoids fragile self-referencing embed)
      const supervisorIds = [...new Set(requests.map(r => r.intern?.supervisor_id).filter(Boolean))];
      
      let supervisorsMap = {};
      if (supervisorIds.length > 0) {
        const { data: supervisors } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', supervisorIds);
        
        supervisorsMap = (supervisors || []).reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      const enrichedData = requests.map(r => ({
        ...r,
        intern: r.intern ? {
          ...r.intern,
          supervisor: r.intern.supervisor_id ? supervisorsMap[r.intern.supervisor_id] : null,
        } : null,
      }));

      res.json(enrichedData);
    } catch (error) {
      console.error('Get all leave requests error:', error);
      res.status(500).json({ error: 'Failed to fetch leave requests', details: error.message });
    }
  }
  // Admin: override a request's status regardless of supervisor
  static async adminOverrideStatus(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { id } = req.params;
      const { status, comments } = req.body;

      const { data: request, error: fetchError } = await supabase
        .from('leave_requests')
        .select(`*, intern:intern_id ( id, email, full_name )`)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status, comments, reviewed_at: new Date(), reviewed_by: req.user.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      ActivityLogger.log(
        req.user.id,
        req.user.profile.full_name,
        status === 'approved' ? 'leave_approved' : 'leave_rejected',
        `${request.intern.full_name}'s leave was ${status} by admin override`,
        request.intern.id
      );

      try {
        await EmailService.notifyIntern(
          request.intern.email,
          request.intern.full_name,
          request,
          status,
          comments
        );
      } catch (emailError) {
        console.error('Intern email failed (non-blocking):', emailError);
      }

      res.json(data);
    } catch (error) {
      console.error('Admin override error:', error);
      res.status(500).json({ error: 'Failed to override request', details: error.message });
    }
  }

  // Admin: company-wide calendar data
  static async getCompanyCalendar(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          id, leave_type, status, start_date, end_date,
          intern:intern_id ( id, full_name, department )
        `)
        .in('status', ['approved', 'pending']);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get company calendar error:', error);
      res.status(500).json({ error: 'Failed to fetch calendar data', details: error.message });
    }
  }

  // Admin: company-wide reports
  static async getAdminReportsData(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: requests, error } = await supabase
        .from('leave_requests')
        .select(`
          id, leave_type, status, days_requested, created_at,
          intern:intern_id ( id, full_name, department )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const monthMap = {};
      requests.forEach(r => {
        const month = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const byMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      const pending = requests.filter(r => r.status === 'pending').length;
      const byStatus = [
        { name: 'Approved', value: approved },
        { name: 'Rejected', value: rejected },
        { name: 'Pending', value: pending },
      ];

      const typeMap = {};
      requests.forEach(r => {
        typeMap[r.leave_type] = (typeMap[r.leave_type] || 0) + 1;
      });
      const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

      const internsMap = {};
      requests.forEach(r => {
        if (r.intern) internsMap[r.intern.id] = r.intern.full_name;
      });
      const interns = Object.entries(internsMap).map(([id, full_name]) => ({ id, full_name }));

      const raw = requests.map(r => ({
        id: r.id,
        leave_type: r.leave_type,
        status: r.status,
        days_requested: r.days_requested,
        created_at: r.created_at,
        intern_id: r.intern?.id,
        intern_name: r.intern?.full_name,
        department: r.intern?.department,
      }));

      res.json({ byMonth, byStatus, byType, interns, raw });
    } catch (error) {
      console.error('Get admin reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
    }
  }
  
  static async exportTeamSummary(req, res) {
    try {
      const XLSX = require('xlsx');
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          department,
          employment_start_date,
          leave_requests (status, leave_type, days_requested),
          audit_logs!audit_logs_intern_id_fkey (leave_type, value_changed, reason, created_at)
        `);
      
      if (req.user.role === 'supervisor') {
        query = query.eq('supervisor_id', req.user.id);
      }
      
      const { data: team, error } = await query;
      if (error) throw error;
      
      const exportData = [];
      for (const member of team) {
        const balance = await LeaveCalculator.getUserLeaveBalance(member.id);
        
        exportData.push({
          'Name': member.full_name,
          'Email': member.email,
          'Department': member.department,
          'Employment Start': member.employment_start_date,
          'Annual Leave Balance': balance.annual.current.toFixed(2),
          'Sick Leave Balance': balance.sick.current.toFixed(2),
          'Study Leave Balance': balance.study.current.toFixed(2),
          'Family Leave Balance': balance.family.current.toFixed(2),
          'Total Leave Requests': member.leave_requests?.length || 0,
          'Approved Leaves': member.leave_requests?.filter(l => l.status === 'approved').length || 0,
        });
      }
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Team Leave Summary');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=team-leave-summary.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  static async getAdminNotifications(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const notifications = [];

      // New pending leave requests (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentRequests } = await supabase
        .from('leave_requests')
        .select('id, leave_type, created_at, intern:intern_id(full_name)')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      (recentRequests || []).forEach(r => {
        notifications.push({
          id: `request-${r.id}`,
          type: 'leave_request',
          message: `${r.intern?.full_name || 'Someone'} submitted a ${r.leave_type} leave request`,
          created_at: r.created_at,
          icon: '📝',
        });
      });

      // Overdue approvals (pending > 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: overdueRequests } = await supabase
        .from('leave_requests')
        .select('id, leave_type, created_at, intern:intern_id(full_name)')
        .eq('status', 'pending')
        .lte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(10);

      (overdueRequests || []).forEach(r => {
        notifications.push({
          id: `overdue-${r.id}`,
          type: 'overdue',
          message: `${r.intern?.full_name || 'A'}'s ${r.leave_type} leave request is overdue for approval`,
          created_at: r.created_at,
          icon: '⏰',
        });
      });

      // Recently created/updated accounts (last 7 days)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      (recentUsers || []).forEach(u => {
        notifications.push({
          id: `user-${u.id}`,
          type: 'user_created',
          message: `${u.role === 'supervisor' ? 'Supervisor' : u.role === 'admin' ? 'Admin' : 'Intern'} account created for ${u.full_name}`,
          created_at: u.created_at,
          icon: u.role === 'supervisor' ? '👨‍💼' : '👤',
        });
      });

      // Sort all by most recent first
      notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json(notifications.slice(0, 30));
    } catch (error) {
      console.error('Get admin notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
    }
  }
}

module.exports = LeaveController;