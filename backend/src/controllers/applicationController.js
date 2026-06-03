// Application Controller
const applicationModel = require('../models/application');
const applicantModel = require('../models/applicant');

const getApplications = async (req, res, next) => {
  try {
    const applications = await applicationModel.getAllApplications();
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationModel.getApplicationById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationsByJob = async (req, res, next) => {
  try {
    const applications = await applicationModel.getApplicationsByJob(req.params.jobId);
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationsByApplicant = async (req, res, next) => {
  try {
    const applications = await applicationModel.getApplicationsByApplicant(req.params.applicantId);
    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { applicant_id, job_id } = req.body;
    
    if (!applicant_id || !job_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const application = await applicationModel.createApplication(req.body);
    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const application = await applicationModel.updateApplication(req.params.id, { status });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({
      success: true,
      data: application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  getApplicationsByJob,
  getApplicationsByApplicant,
  createApplication,
  updateApplicationStatus
};
