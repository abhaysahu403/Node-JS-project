// Leave Request Model
const pool = require('../config/database');

const getAllLeaveRequests = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT lr.*, e.name as employee_name, e.email as employee_email 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       ORDER BY lr.created_at DESC`
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getLeaveRequestById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT lr.*, e.name as employee_name, e.email as employee_email 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.id = ?`,
      [id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

const getLeaveRequestsByEmployee = async (employeeId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY start_date DESC',
      [employeeId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const createLeaveRequest = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [data.employee_id, data.start_date, data.end_date, data.reason, data.status || 'PENDING']
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateLeaveRequest = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE leave_requests SET ${fields} WHERE id = ?`,
      values
    );
    return await getLeaveRequestById(id);
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllLeaveRequests,
  getLeaveRequestById,
  getLeaveRequestsByEmployee,
  createLeaveRequest,
  updateLeaveRequest
};
