// Job Model
const pool = require('../config/database');

const getAllJobs = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return rows;
  } finally {
    connection.release();
  }
};

const getJobById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM jobs WHERE id = ?', [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

const getOpenJobs = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM jobs WHERE status = 'OPEN' ORDER BY created_at DESC"
    );
    return rows;
  } finally {
    connection.release();
  }
};

const createJob = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO jobs (title, department, location, description, status) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.department, data.location, data.description, data.status || 'OPEN']
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateJob = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE jobs SET ${fields} WHERE id = ?`,
      values
    );
    return await getJobById(id);
  } finally {
    connection.release();
  }
};

const deleteJob = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM jobs WHERE id = ?', [id]);
    return true;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  getOpenJobs,
  createJob,
  updateJob,
  deleteJob
};
