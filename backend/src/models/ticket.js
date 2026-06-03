// Support Ticket Model
const pool = require('../config/database');

const getAllTickets = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT st.*, e.name as employee_name, e.email as employee_email 
       FROM support_tickets st
       JOIN employees e ON st.employee_id = e.id
       ORDER BY st.created_at DESC`
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getTicketById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT st.*, e.name as employee_name, e.email as employee_email 
       FROM support_tickets st
       JOIN employees e ON st.employee_id = e.id
       WHERE st.id = ?`,
      [id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

const getTicketsByEmployee = async (employeeId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM support_tickets WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getTicketsByStatus = async (status) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT st.*, e.name as employee_name, e.email as employee_email 
       FROM support_tickets st
       JOIN employees e ON st.employee_id = e.id
       WHERE st.status = ?
       ORDER BY st.created_at DESC`,
      [status]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const createTicket = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO support_tickets (employee_id, subject, description, status) VALUES (?, ?, ?, ?)',
      [data.employee_id, data.subject, data.description, data.status || 'OPEN']
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateTicket = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE support_tickets SET ${fields} WHERE id = ?`,
      values
    );
    return await getTicketById(id);
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  getTicketsByEmployee,
  getTicketsByStatus,
  createTicket,
  updateTicket
};
