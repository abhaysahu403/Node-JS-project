// Leave Request Routes
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/', leaveController.getLeaveRequests);
router.get('/:id', leaveController.getLeaveRequestById);
router.get('/employee/:employeeId', leaveController.getLeaveRequestsByEmployee);

// Create leave request
router.post('/', leaveController.createLeaveRequest);

// Update leave request status (HR Admin only)
router.put('/:id', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), leaveController.updateLeaveRequest);

module.exports = router;
