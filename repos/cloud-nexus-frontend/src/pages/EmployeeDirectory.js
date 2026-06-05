import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeAPI.getAll(searchTerm);
        setEmployees(response.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getDepartmentColor = (dept) => {
    const colors = {
      'Engineering': '#3498db',
      'HR': '#e74c3c',
      'Sales': '#f39c12',
      'Marketing': '#9b59b6',
      'Finance': '#27ae60',
      'Operations': '#16a085'
    };
    return colors[dept] || '#95a5a6';
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Directory</h1>
        <p>Browse and manage company employees</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search employees by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <div className="loading">Loading employees...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && employees.length === 0 && !error && (
        <div className="no-data">No employees found</div>
      )}

      {!loading && employees.length > 0 && (
        <div className="employees-container">
          <div className="employees-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="department-badge" style={{ backgroundColor: getDepartmentColor(emp.department) }}>
                        {emp.department}
                      </span>
                    </td>
                    <td>{emp.designation}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>
                      <span className={`status-badge status-${emp.status.toLowerCase()}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{emp.joining_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="result-count">Total: {employees.length} employees</div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
