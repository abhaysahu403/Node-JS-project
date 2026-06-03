// Main Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const employeeRoutes = require('./src/routes/employeeRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/tickets', ticketRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Cloud Nexus HR Management Platform API',
    version: '1.0.0',
    endpoints: {
      employees: '/api/employees',
      jobs: '/api/jobs',
      applications: '/api/applications',
      leave_requests: '/api/leave-requests',
      tickets: '/api/tickets',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Cloud Nexus HR API Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST || 'mysql'}`);
});

module.exports = app;
