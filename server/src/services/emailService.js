const resend = require('../config/email');

class EmailService {
  static async sendEmail(to, subject, html) {
    try {
      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw error to prevent breaking the flow
      return null;
    }
  }
  
  static async notifySupervisor(internName, supervisorEmail, leaveRequest) {
    const subject = `New Leave Request from ${internName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Leave Request Submitted</h2>
        <p><strong>Intern:</strong> ${internName}</p>
        <p><strong>Leave Type:</strong> ${leaveRequest.leave_type}</p>
        <p><strong>Duration:</strong> ${new Date(leaveRequest.start_date).toLocaleDateString()} - ${new Date(leaveRequest.end_date).toLocaleDateString()}</p>
        <p><strong>Days Requested:</strong> ${leaveRequest.days_requested}</p>
        <p><strong>Reason:</strong> ${leaveRequest.reason}</p>
        <p>Please log in to the system to approve or reject this request.</p>
        <a href="${process.env.FRONTEND_URL}/supervisor" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a>
      </div>
    `;
    
    return this.sendEmail(supervisorEmail, subject, html);
  }
  
  static async notifyIntern(internEmail, internName, leaveRequest, status, comments) {
    const subject = `Leave Request ${status} - ${leaveRequest.leave_type}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your Leave Request Has Been ${status}</h2>
        <p><strong>Intern:</strong> ${internName}</p>
        <p><strong>Leave Type:</strong> ${leaveRequest.leave_type}</p>
        <p><strong>Duration:</strong> ${new Date(leaveRequest.start_date).toLocaleDateString()} - ${new Date(leaveRequest.end_date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        ${comments ? `<p><strong>Supervisor Comments:</strong> ${comments}</p>` : ''}
        <p>You can view all your leave requests in the dashboard.</p>
      </div>
    `;
    
    return this.sendEmail(internEmail, subject, html);
  }

  static async notifyBalanceAdjustment(internEmail, internName, leaveType, valueChanged, reason, modifierName) {
    const subject = `Leave Balance Adjusted - ${leaveType}`;
    const sign = valueChanged > 0 ? '+' : '';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your Leave Balance Has Been Adjusted</h2>
        <p>Dear ${internName},</p>
        <p><strong>Leave Type:</strong> ${leaveType}</p>
        <p><strong>Adjustment:</strong> ${sign}${valueChanged} days</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Adjusted By:</strong> ${modifierName}</p>
        <p>You can view your updated balance in the dashboard.</p>
      </div>
    `;
    
    return this.sendEmail(internEmail, subject, html);
  }
}

module.exports = EmailService;