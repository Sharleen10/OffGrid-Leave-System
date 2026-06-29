const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const EmailService = require('../services/emailService');
const supabase = require('../config/database');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Test email endpoint (admin only)
router.post('/test', requireRole(['admin']), async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Test Email</h2>
        <p>${message}</p>
        <p>This is a test email from the Leave Tracking System.</p>
      </div>
    `;
    
    await EmailService.sendEmail(email, subject || 'Test Email', html);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Send reminder to team (supervisor/admin)
router.post('/reminder', requireRole(['supervisor', 'admin']), async (req, res) => {
  try {
    const { message, leaveType } = req.body;
    
    // Get team members
    let query = supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'intern');
    
    if (req.user.role === 'supervisor') {
      query = query.eq('supervisor_id', req.user.id);
    }
    
    const { data: team, error } = await query;
    
    if (error) throw error;
    
    // Send emails in parallel
    const emailPromises = team.map(member => {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Leave Balance Reminder</h2>
          <p>Dear ${member.full_name},</p>
          <p>${message}</p>
          ${leaveType ? `<p>Please ensure you have sufficient ${leaveType} leave balance before planning time off.</p>` : ''}
          <p>You can check your balance and submit requests through the dashboard.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated message from the Leave Tracking System.</p>
        </div>
      `;
      
      return EmailService.sendEmail(member.email, 'Leave Balance Reminder', html);
    });
    
    await Promise.all(emailPromises);
    
    res.json({ message: `Reminder sent to ${team.length} team members` });
  } catch (error) {
    console.error('Reminder email error:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

// Get email logs (admin only)
router.get('/logs', requireRole(['admin']), async (req, res) => {
  try {
    // Note: You would need to create an email_logs table to track sent emails
    // This is a placeholder for future implementation
    res.json({ message: 'Email logs feature coming soon' });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

module.exports = router;