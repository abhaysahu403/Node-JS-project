// Applicant Model
const pool = require('../config/database');

const getAllApplicants = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM applicants ORDER BY created_at DESC');
    return rows;
  } finally {
    connection.release();
  }
};

const getApplicantById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM applicants WHERE id = ?', [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

const createApplicant = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO applicants (name, email, phone, resume_url) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.phone, data.resume_url]
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateApplicant = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE applicants SET ${fields} WHERE id = ?`,
      values
    );
    return await getApplicantById(id);
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllApplicants,
  getApplicantById,
  createApplicant,
  updateApplicant
};
