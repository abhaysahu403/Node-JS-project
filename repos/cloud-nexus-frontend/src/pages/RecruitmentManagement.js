import React, { useState, useEffect } from 'react';
import { applicationAPI, jobAPI } from '../services/api';

const RecruitmentManagement = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appsRes, jobsRes] = await Promise.all([
          applicationAPI.getAll(),
          jobAPI.getAll()
        ]);
        setApplications(appsRes.data.data || []);
        setJobs(jobsRes.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load recruitment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredApplications = filterStatus
    ? applications.filter(app => app.status === filterStatus)
    : applications;

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f39c12',
      'SHORTLISTED': '#3498db',
      'INTERVIEW': '#9b59b6',
      'OFFER': '#27ae60',
      'REJECTED': '#e74c3c',
      'ACCEPTED': '#16a085'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="recruitment-page">
      <div className="page-header">
        <h1>Recruitment Management</h1>
        <p>Manage job applications and candidate pipeline</p>
      </div>

      {loading && <div className="loading">Loading recruitment data...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && (
        <div className="recruitment-container">
          <div className="stats-row">
            <div className="stat-box">
              <h4>Total Applications</h4>
              <p className="stat-value">{applications.length}</p>
            </div>
            <div className="stat-box">
              <h4>Active Positions</h4>
              <p className="stat-value">{jobs.length}</p>
            </div>
            <div className="stat-box">
              <h4>Shortlisted</h4>
              <p className="stat-value">{applications.filter(a => a.status === 'SHORTLISTED').length}</p>
            </div>
            <div className="stat-box">
              <h4>Offers Extended</h4>
              <p className="stat-value">{applications.filter(a => a.status === 'OFFER').length}</p>
            </div>
          </div>

          <div className="filter-section">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="no-data">No applications found</div>
          ) : (
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Applied For</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td><strong>{app.applicant_name}</strong></td>
                      <td>{app.applicant_email}</td>
                      <td>{app.job_title}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(app.status) }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruitmentManagement;
