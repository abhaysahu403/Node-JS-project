// Employee Model
const pool = require('../config/database');

const getAllEmployees = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM employees ORDER BY name');
    return rows;
  } finally {
    connection.release();
  }
};

const getEmployeeById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

const createEmployee = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO employees (name, email, department, designation, phone, joining_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.email, data.department, data.designation, data.phone, data.joining_date, data.status || 'ACTIVE']
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateEmployee = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE employees SET ${fields} WHERE id = ?`,
      values
    );
    return await getEmployeeById(id);
  } finally {
    connection.release();
  }
};

const deleteEmployee = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM employees WHERE id = ?', [id]);
    return true;
  } finally {
    connection.release();
  }
};

const searchEmployees = async (query) => {
  const connection = await pool.getConnection();
  try {
    const searchQuery = `%${query}%`;
    const [rows] = await connection.query(
      'SELECT * FROM employees WHERE name LIKE ? OR email LIKE ? OR department LIKE ?',
      [searchQuery, searchQuery, searchQuery]
    );
    return rows;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees
};
