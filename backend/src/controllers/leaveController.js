// Leave Request Controller
const leaveModel = require('../models/leaveRequest');

const getLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await leaveModel.getAllLeaveRequests();
    res.json({
      success: true,
      data: leaves,
      count: leaves.length
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequestById = async (req, res, next) => {
  try {
    const leave = await leaveModel.getLeaveRequestById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequestsByEmployee = async (req, res, next) => {
  try {
    const leaves = await leaveModel.getLeaveRequestsByEmployee(req.params.employeeId);
    res.json({
      success: true,
      data: leaves,
      count: leaves.length
    });
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const { employee_id, start_date, end_date, reason } = req.body;
    
    if (!employee_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    const leave = await leaveModel.createLeaveRequest(req.body);
    res.status(201).json({
      success: true,
      data: leave,
      message: 'Leave request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const leave = await leaveModel.updateLeaveRequest(req.params.id, { status });
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json({
      success: true,
      data: leave,
      message: 'Leave request updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveRequests,
  getLeaveRequestById,
  getLeaveRequestsByEmployee,
  createLeaveRequest,
  updateLeaveRequest
};
