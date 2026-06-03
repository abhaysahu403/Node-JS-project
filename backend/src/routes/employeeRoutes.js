// Employee Routes
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);

// Protected routes (HR Admin only)
router.post('/', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), employeeController.createEmployee);
router.put('/:id', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), employeeController.updateEmployee);
router.delete('/:id', verifyToken, verifyRole(['ADMIN']), employeeController.deleteEmployee);

module.exports = router;
