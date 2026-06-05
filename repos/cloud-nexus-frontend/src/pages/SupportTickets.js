import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getAll();
      setTickets(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load support tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ticketAPI.create(formData);
      setFormData({ employee_id: '', subject: '', description: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      setError('Failed to create support ticket');
      console.error(err);
    }
  };

  const filteredTickets = filterStatus
    ? tickets.filter(ticket => ticket.status === filterStatus)
    : tickets;

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': '#e74c3c',
      'IN_PROGRESS': '#f39c12',
      'RESOLVED': '#27ae60',
      'CLOSED': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="support-page">
      <div className="page-header">
        <h1>Support Tickets</h1>
        <p>HR support requests and issue tracking</p>
      </div>

      {loading && <div className="loading">Loading support tickets...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && (
        <div className="support-container">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Ticket'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="number"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ticket subject..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your issue..."
                />
              </div>
              <button type="submit" className="btn-submit">Submit Ticket</button>
            </form>
          )}

          <div className="filter-section">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="no-data">No support tickets found</div>
          ) : (
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id}</td>
                      <td><strong>{ticket.employee_name}</strong></td>
                      <td>{ticket.subject}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(ticket.status) }}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
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

export default SupportTickets;
