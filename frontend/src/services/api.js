import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Employee API
export const employeeAPI = {
  getAll: (search) => apiClient.get('/employees', { params: { search } }),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`)
};

// Job API
export const jobAPI = {
  getAll: (openOnly) => apiClient.get('/jobs', { params: { openOnly } }),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post('/jobs', data),
  update: (id, data) => apiClient.put(`/jobs/${id}`, data),
  delete: (id) => apiClient.delete(`/jobs/${id}`)
};

// Application API
export const applicationAPI = {
  getAll: () => apiClient.get('/applications'),
  getById: (id) => apiClient.get(`/applications/${id}`),
  getByJob: (jobId) => apiClient.get(`/applications/job/${jobId}`),
  getByApplicant: (applicantId) => apiClient.get(`/applications/applicant/${applicantId}`),
  create: (data) => apiClient.post('/applications', data),
  updateStatus: (id, status) => apiClient.put(`/applications/${id}`, { status })
};

// Leave Request API
export const leaveAPI = {
  getAll: () => apiClient.get('/leave-requests'),
  getById: (id) => apiClient.get(`/leave-requests/${id}`),
  getByEmployee: (employeeId) => apiClient.get(`/leave-requests/employee/${employeeId}`),
  create: (data) => apiClient.post('/leave-requests', data),
  updateStatus: (id, status) => apiClient.put(`/leave-requests/${id}`, { status })
};

// Support Ticket API
export const ticketAPI = {
  getAll: (status) => apiClient.get('/tickets', { params: { status } }),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  getByEmployee: (employeeId) => apiClient.get(`/tickets/employee/${employeeId}`),
  create: (data) => apiClient.post('/tickets', data),
  updateStatus: (id, status) => apiClient.put(`/tickets/${id}`, { status })
};

export default apiClient;
