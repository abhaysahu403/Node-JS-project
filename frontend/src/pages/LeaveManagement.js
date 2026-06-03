import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getAll();
      setLeaves(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.create(formData);
      setFormData({ employee_id: '', start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      setError('Failed to submit leave request');
      console.error(err);
    }
  };

  const filteredLeaves = filterStatus
    ? leaves.filter(leave => leave.status === filterStatus)
    : leaves;

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f39c12',
      'APPROVED': '#27ae60',
      'REJECTED': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="leave-page">
      <div className="page-header">
        <h1>Leave Requests</h1>
        <p>Manage employee leave and absences</p>
      </div>

      {loading && <div className="loading">Loading leave requests...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && (
        <div className="leave-container">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Request Leave'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="leave-form">
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="number"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                />
              </div>
              <button type="submit" className="btn-submit">Submit Request</button>
            </form>
          )}

          <div className="filter-section">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="no-data">No leave requests found</div>
          ) : (
            <div className="leaves-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td><strong>{leave.employee_name}</strong></td>
                      <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                      <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                      <td>{leave.reason || '-'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(leave.status) }}
                        >
                          {leave.status}
                        </span>
                      </td>
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

export default LeaveManagement;
