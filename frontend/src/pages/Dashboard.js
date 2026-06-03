import React, { useState, useEffect } from 'react';
import { employeeAPI, jobAPI, leaveAPI, ticketAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeJobs: 0,
    pendingLeaves: 0,
    openTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, jobsRes, leavesRes, ticketsRes] = await Promise.all([
          employeeAPI.getAll(),
          jobAPI.getAll(true),
          leaveAPI.getAll(),
          ticketAPI.getAll()
        ]);

        setStats({
          totalEmployees: employeesRes.data.count || 0,
          activeJobs: jobsRes.data.count || 0,
          pendingLeaves: leavesRes.data.data?.filter(l => l.status === 'PENDING').length || 0,
          openTickets: ticketsRes.data.data?.filter(t => t.status === 'OPEN').length || 0
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="dashboard"><p>Loading dashboard...</p></div>;
  if (error) return <div className="dashboard error"><p>{error}</p></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HR Dashboard</h1>
        <p>Welcome to Cloud Nexus HR Management Platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p className="stat-number">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Active Job Openings</h3>
            <p className="stat-number">{stats.activeJobs}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Pending Leave Requests</h3>
            <p className="stat-number">{stats.pendingLeaves}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>Open Support Tickets</h3>
            <p className="stat-number">{stats.openTickets}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Services Offered</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Recruitment Services</h3>
              <p>Post job openings, manage applications, and hire top talent</p>
            </div>
            <div className="service-card">
              <h3>Payroll Support</h3>
              <p>Manage salary structures, deductions, and payroll processing</p>
            </div>
            <div className="service-card">
              <h3>HR Consulting</h3>
              <p>Expert guidance on HR policies and compliance</p>
            </div>
            <div className="service-card">
              <h3>Employee Onboarding</h3>
              <p>Streamlined onboarding process for new employees</p>
            </div>
            <div className="service-card">
              <h3>Workforce Analytics</h3>
              <p>Data-driven insights for workforce planning</p>
            </div>
            <div className="service-card">
              <h3>Compliance Management</h3>
              <p>Ensure adherence to labor laws and regulations</p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Our HR Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">👔</div>
              <h3>Priya Sharma</h3>
              <p className="role">HR Manager</p>
              <p className="skills">Team Leadership, Recruitment, Employee Relations</p>
              <p className="contact">priya@cloudnexus.com</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">👩‍💼</div>
              <h3>Divya Krishnan</h3>
              <p className="role">Recruitment Specialist</p>
              <p className="skills">Talent Acquisition, Interview Screening, Onboarding</p>
              <p className="contact">divya@cloudnexus.com</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">💼</div>
              <h3>Neha Singh</h3>
              <p className="role">HR Consultant</p>
              <p className="skills">Policy Development, Compliance, Training</p>
              <p className="contact">neha@cloudnexus.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
