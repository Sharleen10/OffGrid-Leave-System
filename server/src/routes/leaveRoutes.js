const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const LeaveController = require('../controllers/leaveController');

const router = express.Router();

router.use(verifyToken);

// Intern routes
router.post('/request', LeaveController.submitRequest);
router.get('/my-requests', LeaveController.getMyRequests);
router.get('/my-balance', LeaveController.getMyBalance);
router.put('/request/:id/cancel', LeaveController.cancelRequest);
router.post('/upload-attachment', LeaveController.uploadAttachment);

// Supervisor/Admin routes
router.get('/team-requests', requireRole(['supervisor', 'admin']), LeaveController.getTeamRequests);
router.get('/dashboard-summary', requireRole(['supervisor', 'admin']), LeaveController.getDashboardSummary);
router.get('/request/:id/detail', requireRole(['supervisor', 'admin']), LeaveController.getRequestDetail);
router.put('/request/:id', requireRole(['supervisor', 'admin']), LeaveController.updateRequestStatus);
router.post('/adjust-balance', requireRole(['supervisor', 'admin']), LeaveController.adjustBalance);
router.get('/team-summary', requireRole(['supervisor', 'admin']), LeaveController.exportTeamSummary);
router.get('/recent-activity', requireRole(['supervisor', 'admin']), LeaveController.getRecentActivity);
router.get('/team-balances', requireRole(['supervisor', 'admin']), LeaveController.getTeamBalances);
router.get('/reports', requireRole(['supervisor', 'admin']), LeaveController.getReportsData);

// Admin-only routes
router.get('/admin/all-requests', requireRole(['admin']), LeaveController.getAllLeaveRequests);
router.put('/admin/request/:id/override', requireRole(['admin']), LeaveController.adminOverrideStatus);
router.get('/admin/calendar', requireRole(['admin']), LeaveController.getCompanyCalendar);
router.get('/admin/reports', requireRole(['admin']), LeaveController.getAdminReportsData);

module.exports = router;