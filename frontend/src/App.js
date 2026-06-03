import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './styles/App.css';
import './styles/dashboard.css';
import './styles/employees.css';
import './styles/jobs.css';
import './styles/applications.css';

// Pages
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import JobPostings from './pages/JobPostings';
import RecruitmentManagement from './pages/RecruitmentManagement';
import LeaveManagement from './pages/LeaveManagement';
import SupportTickets from './pages/SupportTickets';

function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              <span className="logo-icon">🏢</span>
              Cloud Nexus HR
            </Link>
            <button className="menu-toggle" onClick={() => setNavOpen(!navOpen)}>
              ☰
            </button>
            <ul className={`nav-menu ${navOpen ? 'active' : ''}`}>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={() => setNavOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/employees" className="nav-link" onClick={() => setNavOpen(false)}>
                  Employee Directory
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/jobs" className="nav-link" onClick={() => setNavOpen(false)}>
                  Job Postings
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/recruitment" className="nav-link" onClick={() => setNavOpen(false)}>
                  Recruitment
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/leaves" className="nav-link" onClick={() => setNavOpen(false)}>
                  Leave Requests
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/support" className="nav-link" onClick={() => setNavOpen(false)}>
                  Support Tickets
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/jobs" element={<JobPostings />} />
            <Route path="/recruitment" element={<RecruitmentManagement />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route path="/support" element={<SupportTickets />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2026 Cloud Nexus HR Platform. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
