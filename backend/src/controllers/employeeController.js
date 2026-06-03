// Employee Controller
const employeeModel = require('../models/employee');

const getEmployees = async (req, res, next) => {
  try {
    const search = req.query.search;
    let employees;
    
    if (search) {
      employees = await employeeModel.searchEmployees(search);
    } else {
      employees = await employeeModel.getAllEmployees();
    }
    
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeModel.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation, phone, joining_date } = req.body;
    
    if (!name || !email || !department || !designation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const employee = await employeeModel.createEmployee(req.body);
    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeModel.updateEmployee(req.params.id, req.body);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await employeeModel.deleteEmployee(req.params.id);
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
