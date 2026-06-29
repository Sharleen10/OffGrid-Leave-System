const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    console.log('🔍 Validation failed:', JSON.stringify(errors.array()));
    res.status(400).json({ errors: errors.array() });
  };
};

const leaveValidation = {
  submitRequest: [
    body('leave_type')
      .isIn(['annual', 'sick', 'study', 'family'])
      .withMessage('Invalid leave type'),
    body('start_date')
      .isISO8601()
      .withMessage('Invalid start date')
      .custom((value, { req }) => {
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    body('end_date')
      .isISO8601()
      .withMessage('Invalid end date')
      .custom((value, { req }) => {
        const endDate = new Date(value);
        const startDate = new Date(req.body.start_date);
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          throw new Error('Leave request cannot exceed 30 days');
        }
        return true;
      }),
    body('days_requested')
      .isFloat({ min: 0.5, max: 30 })
      .withMessage('Days requested must be between 0.5 and 30'),
    body('reason')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Reason must be between 5 and 500 characters'),
  ],
  
  updateStatus: [
    param('id').isUUID().withMessage('Invalid request ID'),
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be approved or rejected'),
    body('comments')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comments cannot exceed 500 characters'),
  ],
  
  adjustBalance: [
    body('intern_id').isUUID().withMessage('Invalid intern ID'),
    body('leave_type')
      .isIn(['annual', 'sick', 'study', 'family'])
      .withMessage('Invalid leave type'),
    body('value')
      .isFloat()
      .withMessage('Value must be a number'),
    body('reason')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
  ],
};

const userValidation = {
  createUser: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('role')
      .isIn(['admin', 'supervisor', 'intern'])
      .withMessage('Invalid role'),
    body('department')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department name too long'),
    body('employment_start_date')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Invalid employment start date'),
    body('supervisor_id')
      .optional({ checkFalsy: true })
      .isUUID()
      .withMessage('Invalid supervisor ID'),
  ],
  
  updateUser: [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('full_name')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2, max: 100 }),
    body('department')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }),
    body('employment_start_date')
      .optional({ checkFalsy: true })
      .isISO8601(),
    body('supervisor_id')
      .optional({ checkFalsy: true })
      .isUUID(),
  ],
  
  resetPassword: [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
};

const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  
  dateRange: [
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date')
      .custom((value, { req }) => {
        if (req.query.start_date && value) {
          const start = new Date(req.query.start_date);
          const end = new Date(value);
          if (end < start) {
            throw new Error('End date must be after start date');
          }
        }
        return true;
      }),
  ],
};

module.exports = {
  validate,
  leaveValidation,
  userValidation,
  queryValidation,
};