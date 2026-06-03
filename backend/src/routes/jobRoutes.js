// Job Routes
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (HR Admin only)
router.post('/', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), jobController.createJob);
router.put('/:id', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), jobController.updateJob);
router.delete('/:id', verifyToken, verifyRole(['ADMIN']), jobController.deleteJob);

module.exports = router;
