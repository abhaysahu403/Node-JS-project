# Cloud Nexus HR Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet Users                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  AWS Application Load Balancer                       │
│           (Distributes traffic across ECS tasks)                    │
└────────────────┬───────────────────────────┬───────────────────────┘
                 │                           │
        ┌────────▼──────────────┐   ┌────────▼──────────────┐
        │   Frontend (React)    │   │  Backend (Express)    │
        │  ECS Fargate Task 1   │   │  ECS Fargate Task 1   │
        │  Port: 3000           │   │  Port: 5000           │
        └────────┬──────────────┘   └────────┬──────────────┘
        ┌────────▼──────────────┐   ┌────────▼──────────────┐
        │   Frontend (React)    │   │  Backend (Express)    │
        │  ECS Fargate Task 2   │   │  ECS Fargate Task 2   │
        │  Port: 3000           │   │  Port: 5000           │
        └────────┬──────────────┘   └────────┬──────────────┘
                 │                           │
                 │       ┌───────────────────┘
                 │       │
                 ▼       ▼
        ┌─────────────────────────────────┐
        │    AWS Secrets Manager          │
        │  (JWT keys, DB credentials)     │
        └─────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────┐
        │   AWS RDS MySQL Database        │
        │   (cloud_nexus_hr)              │
        │   Multi-AZ High Availability    │
        └─────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer (Frontend)
- **Technology**: React 18.2
- **Components**:
  - Dashboard - HR metrics and analytics
  - Employee Directory - Employee search and filtering
  - Job Postings - Open positions display
  - Recruitment Management - Application tracking
  - Leave Management - Leave request handling
  - Support Tickets - Issue tracking
- **Features**:
  - Responsive design (Mobile, Tablet, Desktop)
  - Real-time data binding
  - Component-based architecture
  - CSS-in-JS styling

### 2. API Layer (Backend)
- **Technology**: Node.js 20 + Express.js
- **Architecture**:
  - RESTful API design
  - JWT authentication
  - Role-based access control (RBAC)
  - Async/await operations
  - Error handling middleware
- **Modules**:
  - Employee Management API
  - Job Management API
  - Application Tracking API
  - Leave Request API
  - Support Ticket API

### 3. Data Layer (Database)
- **Technology**: MySQL 8.0
- **Schema**:
  - Employees table (employee data)
  - Jobs table (job postings)
  - Applicants table (applicant info)
  - Applications table (job applications)
  - Leave Requests table (leave tracking)
  - Support Tickets table (support requests)
  - Users table (authentication)
- **Features**:
  - Foreign key relationships
  - Indexes for performance
  - Timestamps (created_at, updated_at)
  - ENUM types for status fields

## Component Architecture

### Frontend Components
```
App
├── Navbar
│   ├── Logo
│   ├── Navigation Menu
│   └── Mobile Toggle
├── Routes
│   ├── Dashboard
│   ├── EmployeeDirectory
│   ├── JobPostings
│   ├── RecruitmentManagement
│   ├── LeaveManagement
│   └── SupportTickets
├── Main Content Area
└── Footer
```

### Backend Structure
```
backend/
├── server.js (Entry point)
├── src/
│   ├── routes/ (HTTP endpoints)
│   ├── controllers/ (Business logic)
│   ├── models/ (Database queries)
│   ├── middleware/ (Auth, Error handling)
│   └── config/ (Database connection)
```

## Data Flow

### 1. Frontend → Backend
```
User Action (Click) → React Component
    ↓
API Service (api.js) → HTTP Request
    ↓
Backend Route Handler
    ↓
Controller (Business Logic)
    ↓
Model (Database Query)
    ↓
MySQL Database
```

### 2. Backend → Frontend
```
Database Query Result
    ↓
Controller Response
    ↓
JSON Response
    ↓
Frontend receives data
    ↓
React State Update
    ↓
Component Re-render
```

## Authentication Flow

```
User Login
    ↓
Backend verifies credentials
    ↓
Generate JWT Token
    ↓
Send token to frontend
    ↓
Store in localStorage
    ↓
Include in API headers
    ↓
Verify token on each request
    ↓
Grant/Deny access
```

## Deployment Architecture

### Local Development
```
docker-compose up
    ↓
    ├── MySQL Container
    ├── Backend Container
    └── Frontend Container
    
All connected via Docker network: cloud_nexus_network
```

### AWS ECS Fargate
```
GitHub Push
    ↓
GitHub Actions CI/CD
    ├── Build & Test
    ├── Build Docker Images
    └── Push to ECR
        ↓
        Update ECS Services
        ↓
        ├── Frontend Service (2+ tasks)
        ├── Backend Service (2+ tasks)
        └── RDS MySQL Database
        
        Load Balancer distributes traffic
```

## API Endpoint Structure

```
/api
├── /employees
│   ├── GET / (list all)
│   ├── GET /:id (get one)
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   └── DELETE /:id (delete)
├── /jobs (same pattern)
├── /applications (same pattern)
├── /leave-requests (same pattern)
└── /tickets (same pattern)
```

## Database Relationships

```
employees
    ├── 1 → Many leave_requests
    ├── 1 → Many support_tickets
    └── 1 → 1 users

jobs
    └── 1 → Many applications

applicants
    └── 1 → Many applications

applications
    ├── Many → 1 applicants
    └── Many → 1 jobs
```

## Security Layers

1. **Transport Security**
   - HTTPS in production
   - TLS/SSL encryption

2. **Authentication**
   - JWT tokens
   - Token expiration (24 hours)

3. **Authorization**
   - Role-based access control
   - Middleware validation

4. **Data Security**
   - Password hashing (bcryptjs)
   - SQL parameter binding
   - Input validation

5. **Infrastructure Security**
   - Private subnets for RDS
   - Security groups
   - Network ACLs

## Scalability

### Horizontal Scaling
- Multiple ECS tasks for frontend
- Multiple ECS tasks for backend
- Auto-scaling based on CPU/Memory
- Load balancer distributes traffic

### Vertical Scaling
- RDS read replicas for database
- Connection pooling
- Caching layer (Redis optional)

## High Availability

- Multi-AZ RDS deployment
- Multiple ECS task instances
- Load balancer health checks
- Auto-recovery on failures
- CloudWatch monitoring

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - CSS optimization
   - Image compression

2. **Backend**
   - Database indexing
   - Query optimization
   - Connection pooling
   - Caching strategies

3. **Database**
   - Proper indexing
   - Query optimization
   - Regular maintenance

## Monitoring & Logging

- CloudWatch for AWS resources
- Application logs to CloudWatch Logs
- Performance monitoring
- Error tracking
- Alert notifications

## Disaster Recovery

- Automated backups (RDS)
- Point-in-time recovery
- Multi-AZ replication
- Cross-region backup (optional)
- Recovery time objective (RTO): < 1 hour
- Recovery point objective (RPO): < 5 minutes

## Technology Justification

| Component | Why Chosen |
|-----------|-----------|
| React | Fast, component-based, large ecosystem |
| Express | Lightweight, flexible, widely used |
| MySQL | Relational data, ACID compliance, cost-effective |
| Docker | Consistency across environments |
| ECS Fargate | Serverless containers, no infra management |
| GitHub Actions | Native integration, cost-effective |
| RDS | Managed database, automated backups |
| ALB | High performance, health checks |

---

This architecture demonstrates enterprise-grade design patterns and is suitable for production deployment at scale.
