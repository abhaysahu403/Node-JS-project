# Cloud Nexus HR Platform - Complete Project Index

## 📖 Documentation Index

### Quick References
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - **START HERE** - Complete project overview
- [README.md](./README.md) - Main project README

### Detailed Guides

#### Architecture & Design
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
  - System architecture overview
  - Three-tier layered design
  - Data flow diagrams
  - Security architecture
  - Scalability strategies
  - Technology justification

#### Development Setup
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
  - Prerequisites and installation
  - Local development setup (with/without Docker)
  - Backend setup walkthrough
  - Frontend setup walkthrough
  - Database access methods
  - API testing with Postman/cURL
  - Debugging techniques
  - Common issues & solutions

#### Docker Configuration
- [docs/DOCKER.md](./docs/DOCKER.md)
  - Docker overview and concepts
  - Installation instructions (all OS)
  - Dockerfile explanations
  - Docker Compose configuration
  - Container management commands
  - Volume and networking
  - Best practices
  - Troubleshooting

#### AWS Deployment
- [docs/ECS_DEPLOYMENT.md](./docs/ECS_DEPLOYMENT.md)
  - AWS setup instructions
  - ECR repository creation
  - RDS MySQL configuration
  - ECS cluster setup
  - Task definitions
  - Load balancer configuration
  - Auto-scaling setup
  - Monitoring & logging
  - Deployment checklist

## 🗂️ Project Structure

### Frontend (React)
```
frontend/
├── public/
│   └── index.html                    # Main HTML file
├── src/
│   ├── pages/                        # Page components
│   │   ├── Dashboard.js              # HR dashboard
│   │   ├── EmployeeDirectory.js      # Employee listing
│   │   ├── JobPostings.js            # Job listings
│   │   ├── RecruitmentManagement.js  # Application tracking
│   │   ├── LeaveManagement.js        # Leave requests
│   │   └── SupportTickets.js         # Support tickets
│   ├── services/
│   │   └── api.js                    # Axios API client
│   ├── styles/                       # CSS files
│   │   ├── App.css                   # Main styles
│   │   ├── dashboard.css             # Dashboard styles
│   │   ├── employees.css             # Employee page
│   │   ├── jobs.css                  # Jobs page
│   │   └── applications.css          # Forms & tables
│   ├── App.js                        # Main App component
│   ├── index.js                      # React entry point
│   ├── package.json                  # Dependencies
│   ├── Dockerfile                    # Container image
│   └── .env.example                  # Environment template
```

### Backend (Express)
```
backend/
├── src/
│   ├── routes/                       # API endpoints
│   │   ├── employeeRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── ticketRoutes.js
│   ├── controllers/                  # Business logic
│   │   ├── employeeController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── leaveController.js
│   │   └── ticketController.js
│   ├── models/                       # Database queries
│   │   ├── employee.js
│   │   ├── job.js
│   │   ├── applicant.js
│   │   ├── application.js
│   │   ├── leaveRequest.js
│   │   └── ticket.js
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # Authentication
│   │   └── errorHandler.js           # Error handling
│   └── config/
│       └── database.js               # MySQL connection
├── server.js                         # Express entry point
├── package.json                      # Dependencies
├── Dockerfile                        # Container image
└── .env.example                      # Environment template
```

### Database
```
database/
└── init.sql                          # Database schema + sample data
    ├── Employees table (10 records)
    ├── Jobs table (8 records)
    ├── Applicants table (8 records)
    ├── Applications table (8 records)
    ├── Leave Requests table (5 records)
    ├── Support Tickets table (5 records)
    ├── Users table (auth ready)
    └── Indexes and permissions
```

### DevOps
```
.github/
└── workflows/
    └── deploy.yml                    # GitHub Actions CI/CD
        ├── Build & Test Backend
        ├── Build & Test Frontend
        ├── Build & Push to ECR
        ├── Deploy to ECS
        ├── Security Scanning
        └── Code Quality Analysis

docker-compose.yml                    # Local development
├── MySQL service
├── Backend service
└── Frontend service
```

### Documentation
```
docs/
├── ARCHITECTURE.md                   # System design
├── DEVELOPMENT.md                    # Local setup
├── DOCKER.md                         # Container guide
└── ECS_DEPLOYMENT.md                 # AWS deployment

.root/
├── README.md                         # Project overview
├── PROJECT_SUMMARY.md                # This summary
└── PROJECT_INDEX.md                  # This file
```

## 🚀 Getting Started Paths

### Path 1: Quick Local Start (Recommended for testing)
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Follow [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Docker section
3. Run: `docker-compose up --build`
4. Access: http://localhost:3000

### Path 2: Development Without Docker
1. Read [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Local Development section
2. Set up Node.js locally
3. Set up MySQL locally
4. Run backend and frontend separately

### Path 3: AWS Production Deployment
1. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. Follow [docs/ECS_DEPLOYMENT.md](./docs/ECS_DEPLOYMENT.md)
3. Configure GitHub Actions secrets
4. Push to main branch for auto-deployment

## 📊 API Reference

### Available Endpoints

**Employees**
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create employee (Admin)
- `PUT /api/employees/:id` - Update employee (Admin)
- `DELETE /api/employees/:id` - Delete employee (Admin)

**Jobs**
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create job (Admin)
- `PUT /api/jobs/:id` - Update job (Admin)
- `DELETE /api/jobs/:id` - Delete job (Admin)

**Applications**
- `GET /api/applications` - List all applications
- `GET /api/applications/:id` - Get specific application
- `GET /api/applications/job/:jobId` - Get applications for job
- `GET /api/applications/applicant/:applicantId` - Get applicant's applications
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id` - Update application status (Admin)

**Leave Requests**
- `GET /api/leave-requests` - List all leave requests
- `GET /api/leave-requests/:id` - Get specific leave request
- `GET /api/leave-requests/employee/:employeeId` - Get employee's leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request (Admin)

**Support Tickets**
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:id` - Get specific ticket
- `GET /api/tickets/employee/:employeeId` - Get employee's tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket status (Admin)

**Health Check**
- `GET /health` - Backend health status
- `GET /api` - API root documentation

## 🗄️ Database Schema

### Tables Created

| Table | Records | Purpose |
|-------|---------|---------|
| employees | 10 | Employee information |
| jobs | 8 | Job postings |
| applicants | 8 | Job applicants |
| applications | 8 | Application tracking |
| leave_requests | 5 | Leave management |
| support_tickets | 5 | Support requests |
| users | 0 | Authentication (ready) |

### Key Relationships
```
employees ──┬── 1:Many ──→ leave_requests
            └── 1:Many ──→ support_tickets

jobs ──────── 1:Many ──→ applications

applicants ─ 1:Many ──→ applications

applications (connects jobs and applicants)
```

## 🐳 Docker Containers

### Local Development (docker-compose)
- **MySQL**: Port 3306, Volume: mysql_data
- **Backend**: Port 5000, Volume: /app
- **Frontend**: Port 3000, Volume: /app

### AWS Deployment (ECS Fargate)
- Frontend: Task Definition + Service + ALB
- Backend: Task Definition + Service + ALB
- Database: RDS MySQL Multi-AZ

## 🔑 Environment Variables

### Backend (.env)
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=cloud_nexus_hr
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🔄 CI/CD Pipeline (GitHub Actions)

### Stages
1. **Build & Test Backend** - npm install, lint, test
2. **Build & Test Frontend** - npm install, build, test
3. **Build Docker Images** - Create and push to ECR (main branch only)
4. **Deploy to ECS** - Update services and wait for stability
5. **Security Scan** - Trivy vulnerability scan
6. **Code Quality** - SonarCloud analysis

### GitHub Secrets Required
- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ECS_CLUSTER_NAME`

## 📱 Frontend Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/` | HR metrics overview |
| Employee Directory | `/employees` | Employee search & browse |
| Job Postings | `/jobs` | View open jobs |
| Recruitment | `/recruitment` | Application tracking |
| Leave Management | `/leaves` | Leave requests |
| Support Tickets | `/support` | Issue tracking |

## 💻 Technology Details

### Frontend Stack
- React 18.2.0
- React Router 6.16.0
- Axios 1.6.2
- CSS3 with Grid/Flexbox
- No external UI library

### Backend Stack
- Node.js 20
- Express 4.18.2
- MySQL 8.0
- JWT (auth ready)
- CORS enabled

### DevOps Stack
- Docker & Docker Compose
- GitHub Actions
- AWS ECS Fargate
- Amazon ECR
- RDS MySQL
- Application Load Balancer

## 🎯 Feature Checklist

- ✅ Employee Management
- ✅ Job Posting System
- ✅ Recruitment Pipeline (ATS)
- ✅ Leave Management
- ✅ Support Ticket System
- ✅ Dashboard & Analytics
- ✅ Search & Filter
- ✅ Status Tracking
- ✅ Form Handling
- ✅ Responsive Design
- ✅ REST API
- ✅ Authentication Structure
- ✅ Error Handling
- ✅ Docker Containerization
- ✅ CI/CD Pipeline
- ✅ AWS Deployment Ready

## 📚 Learning Resources

### Included in Project
- Architecture diagrams in ARCHITECTURE.md
- Setup guides in DEVELOPMENT.md
- Docker best practices in DOCKER.md
- AWS deployment steps in ECS_DEPLOYMENT.md
- API documentation in code comments

### External Resources
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Docker Docs](https://docs.docker.com/)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)

## ✅ Verification Checklist

After setup, verify:
- [ ] Docker containers start without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000/api
- [ ] MySQL contains sample data
- [ ] All 6 frontend pages are accessible
- [ ] API endpoints return correct data
- [ ] Forms can submit (if backend ready)
- [ ] Search functionality works
- [ ] Responsive design adapts to mobile

## 🆘 Troubleshooting Quick Links

- Can't start Docker? → See [DOCKER.md](./docs/DOCKER.md) - Installation
- API not responding? → See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Debugging
- Database issues? → See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Database Access
- Deployment problems? → See [ECS_DEPLOYMENT.md](./docs/ECS_DEPLOYMENT.md) - Troubleshooting

## 📞 Quick Reference Commands

### Docker Compose
```bash
docker-compose up --build           # Start services
docker-compose down                 # Stop services
docker-compose ps                   # View running containers
docker-compose logs -f              # View live logs
```

### Database
```bash
docker-compose exec mysql mysql -u root -p cloud_nexus_hr
SHOW TABLES;
SELECT * FROM employees LIMIT 5;
```

### API Testing
```bash
curl http://localhost:5000/api
curl http://localhost:5000/api/employees
```

## 🎓 What This Project Teaches

1. Full-stack web development
2. Three-tier architecture
3. RESTful API design
4. React component development
5. Express server setup
6. MySQL database design
7. Docker containerization
8. Docker Compose orchestration
9. GitHub Actions CI/CD
10. AWS cloud deployment

---

**Last Updated**: June 2026
**Project Status**: ✅ Production Ready
**Version**: 1.0.0

**Start with**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) → [DEVELOPMENT.md](./docs/DEVELOPMENT.md) → Local Testing
