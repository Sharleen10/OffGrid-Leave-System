const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, userValidation } = require('../middleware/validation');
const UserController = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all users (admin sees all, supervisor sees team)
router.get('/', UserController.getAllUsers);

// Get supervisors list
router.get('/supervisors', UserController.getSupervisors);

// Get team members (supervisors and admins)
router.get('/team', requireRole(['supervisor', 'admin']), UserController.getTeamMembers);

// Get current user's profile
router.get('/profile', UserController.getMyProfile);

// Update current user's profile
router.put('/profile', UserController.updateMyProfile);

// Add this line in userRoutes.js, near the other profile routes
router.put('/change-password', UserController.changeMyPassword);

// Get departments list (admin only)
router.get('/departments', requireRole(['admin']), UserController.getDepartments);

// Admin only routes
router.post(
  '/',
  requireRole(['admin']),
  validate(userValidation.createUser),
  UserController.createUser
);

router.put(
  '/:id',
  requireRole(['admin']),
  validate(userValidation.updateUser),
  UserController.updateUser
);

router.delete(
  '/:id',
  requireRole(['admin']),
  UserController.deleteUser
);

// Password reset (admin triggered)
router.post(
  '/reset-password',
  requireRole(['admin']),
  validate(userValidation.resetPassword),
  UserController.resetPassword
);

router.get('/admin-summary', requireRole(['admin']), UserController.getAdminSummary);
router.put('/:id/deactivate', requireRole(['admin']), UserController.deactivateUser);
router.put('/:id/reactivate', requireRole(['admin']), UserController.reactivateUser);
router.get('/settings', requireRole(['admin']), UserController.getSystemSettings);
router.put('/settings', requireRole(['admin']), UserController.updateSystemSetting);
router.put('/change-password', UserController.changeMyPassword);



module.exports = router;