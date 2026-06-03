// Job Controller
const jobModel = require('../models/job');

const getJobs = async (req, res, next) => {
  try {
    const openOnly = req.query.openOnly === 'true';
    let jobs;
    
    if (openOnly) {
      jobs = await jobModel.getOpenJobs();
    } else {
      jobs = await jobModel.getAllJobs();
    }
    
    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobModel.getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, department, location, description } = req.body;
    
    if (!title || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const job = await jobModel.createJob(req.body);
    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobModel.updateJob(req.params.id, req.body);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      success: true,
      data: job,
      message: 'Job updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobModel.deleteJob(req.params.id);
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
