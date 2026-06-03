// Application Model
const pool = require('../config/database');

const getAllApplications = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT a.*, ap.name as applicant_name, ap.email as applicant_email, j.title as job_title 
       FROM applications a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN jobs j ON a.job_id = j.id
       ORDER BY a.created_at DESC`
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getApplicationById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT a.*, ap.name as applicant_name, ap.email as applicant_email, j.title as job_title 
       FROM applications a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

const getApplicationsByJob = async (jobId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT a.*, ap.name as applicant_name, ap.email as applicant_email 
       FROM applications a
       JOIN applicants ap ON a.applicant_id = ap.id
       WHERE a.job_id = ?
       ORDER BY a.created_at DESC`,
      [jobId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const getApplicationsByApplicant = async (applicantId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT a.*, j.title as job_title 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.applicant_id = ?
       ORDER BY a.created_at DESC`,
      [applicantId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

const createApplication = async (data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO applications (applicant_id, job_id, status) VALUES (?, ?, ?)',
      [data.applicant_id, data.job_id, data.status || 'PENDING']
    );
    return { id: result.insertId, ...data };
  } finally {
    connection.release();
  }
};

const updateApplication = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    
    await connection.query(
      `UPDATE applications SET ${fields} WHERE id = ?`,
      values
    );
    return await getApplicationById(id);
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  getApplicationsByJob,
  getApplicationsByApplicant,
  createApplication,
  updateApplication
};
