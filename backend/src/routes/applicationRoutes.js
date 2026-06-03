// Application Routes
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplicationById);
router.get('/job/:jobId', applicationController.getApplicationsByJob);
router.get('/applicant/:applicantId', applicationController.getApplicationsByApplicant);

// Create application
router.post('/', applicationController.createApplication);

// Update application status (HR Admin only)
router.put('/:id', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), applicationController.updateApplicationStatus);

module.exports = router;
