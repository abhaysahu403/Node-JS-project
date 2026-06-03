# Cloud Nexus HR Management Platform

A production-ready, cloud-native three-tier HR Management System demonstrating modern software architecture, containerization, and DevOps practices.

## 🎯 Project Overview

Cloud Nexus HR Platform is a comprehensive Human Resources Management solution built with modern technologies and cloud-native principles. It showcases:

- **Frontend**: React-based responsive dashboard UI
- **Backend**: Node.js/Express REST API with async operations
- **Database**: MySQL with proper schema design
- **Infrastructure**: Docker containerization & Docker Compose orchestration
- **CI/CD**: GitHub Actions automation pipeline
- **Cloud**: AWS ECS Fargate deployment ready

## ✨ Key Features

### Employee Management
- Employee directory with search functionality
- Department and designation management
- Employee profiles and contact details
- Employment status tracking

### Recruitment Management
- Job posting creation and management
- Applicant tracking system
- Application status pipeline (Pending → Shortlisted → Interview → Offer → Accepted)
- Resume management

### Leave Management
- Leave request submission
- Leave status tracking (Pending, Approved, Rejected)
- Employee leave history

### HR Service Requests
- Support ticket system
- Status tracking (Open, In Progress, Resolved, Closed)
- Issue categorization

### Dashboard & Analytics
- Real-time HR metrics
- Employee count statistics
- Open positions tracking
- Pending requests overview
- Team information

### Company Services
- Recruitment Services
- Payroll Support
- HR Consulting
- Employee Onboarding
- Workforce Analytics
- Compliance Management

## 📁 Project Structure

```
cloud-nexus-hr/
├── frontend/                    # React Application
├── backend/                     # Node.js Express API
├── database/                    # MySQL Scripts
├── docs/                        # Documentation
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
├── docker-compose.yml           # Local Development
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cloud-nexus-hr.git
   cd cloud-nexus-hr
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api

## 📊 API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin)

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Admin)

### Applications
- `GET /api/applications` - List all applications
- `POST /api/applications` - Submit application

### Leave Requests
- `GET /api/leave-requests` - List all leave requests
- `POST /api/leave-requests` - Create leave request

### Support Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create ticket

## 🗄️ Database Schema

Includes tables for:
- employees
- jobs
- applicants
- applications
- leave_requests
- support_tickets
- users (JWT authentication ready)

## 🐳 Docker Architecture

Three-tier architecture with automatic networking:
- Frontend (React) → Port 3000
- Backend (Express) → Port 5000
- MySQL Database → Port 3306

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Docker Setup Guide](./docs/DOCKER.md)
- [ECS Deployment Guide](./docs/ECS_DEPLOYMENT.md)

## 🔄 CI/CD Pipeline

GitHub Actions with:
- Automated build & test
- Docker image build & push to ECR
- AWS ECS Fargate deployment
- Security scanning (Trivy)
- Code quality analysis (SonarCloud)

## 🛠️ Technology Stack

- Frontend: React 18.2
- Backend: Node.js/Express
- Database: MySQL 8.0
- Containerization: Docker
- Cloud: AWS (ECR, ECS Fargate, RDS)
- CI/CD: GitHub Actions

## 📝 License

MIT License
- Docker-ready for GitHub Actions deployment

## Run locally

1. Install Node.js 20 or later
2. Run:

```bash
npm install
npm start
```

3. Open `http://localhost:3000`

## Docker

Build and run with Docker:

```bash
docker build -t cloud-nexus-welcome .
docker run -p 3000:3000 cloud-nexus-welcome
```

## GitHub Actions

A workflow is included to build and push a Docker image automatically when code is pushed to `main`.
