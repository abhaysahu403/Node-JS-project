# Cloud Nexus HR Platform - Development Guide

## 🏗️ Local Development Setup

This guide walks you through setting up the Cloud Nexus HR Platform for local development.

## Prerequisites

Before you start, ensure you have installed:

### Required Software
- **Docker** (version 20.10+)
  - Download: https://www.docker.com/products/docker-desktop
- **Docker Compose** (version 1.29+)
  - Usually bundled with Docker Desktop
- **Git** (version 2.30+)
  - Download: https://git-scm.com/

### Optional (for local development without Docker)
- **Node.js** (version 20 LTS)
  - Download: https://nodejs.org/
- **MySQL** (version 8.0)
  - Download: https://dev.mysql.com/downloads/mysql/

### Recommended Tools
- **VS Code** - Code editor
- **Postman** - API testing tool
- **MySQL Workbench** - Database management tool
- **Git Bash** - Command line interface (Windows)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cloud-nexus-hr.git
cd cloud-nexus-hr
```

### 2. Create Environment Files

#### Root Directory `.env` (for docker-compose)
```bash
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=cloud_nexus_hr

# Backend Configuration
NODE_ENV=development
BACKEND_PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### 3. Start Services with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### 4. Access the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Root**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **MySQL**: localhost:3306

## 📝 Database Access

### Via MySQL CLI
```bash
# Connect to MySQL inside container
docker exec -it cloud-nexus-mysql mysql -u root -prootpassword cloud_nexus_hr

# List tables
SHOW TABLES;

# View employees
SELECT * FROM employees;

# Exit
EXIT;
```

### Via MySQL Workbench
1. Open MySQL Workbench
2. Create new connection:
   - Host: localhost
   - Port: 3306
   - Username: root
   - Password: rootpassword
   - Database: cloud_nexus_hr
3. Connect and browse tables

## 🔧 Local Development (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=cloud_nexus_hr
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=dev-secret-key
   ```

4. **Start backend server**
   ```bash
   npm start       # Production mode
   npm run dev     # Development with nodemon
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start frontend server**
   ```bash
   npm start
   ```

## 📚 API Testing

### Using Postman

1. **Import Collection**
   - Create new collection "Cloud Nexus HR"
   - Set base URL: `http://localhost:5000/api`

2. **Test Endpoints**
   ```
   # GET all employees
   GET /employees
   
   # GET employee by ID
   GET /employees/1
   
   # CREATE employee
   POST /employees
   {
     "name": "John Doe",
     "email": "john@example.com",
     "department": "Engineering",
     "designation": "Senior Engineer",
     "phone": "+1-234-567-8900",
     "joining_date": "2024-01-15"
   }
   ```

### Using cURL

```bash
# GET all employees
curl http://localhost:5000/api/employees

# GET specific employee
curl http://localhost:5000/api/employees/1

# POST create employee
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "department": "HR",
    "designation": "HR Manager"
  }'
```

## 🐛 Debugging

### Backend Debugging

1. **Using console logs**
   ```javascript
   console.log('Debug info:', data);
   ```

2. **Using VS Code debugger**
   - Set breakpoints in code
   - Run with debugger: `node --inspect server.js`
   - Open chrome://inspect

3. **View logs**
   ```bash
   docker-compose logs backend
   docker-compose logs backend -f  # Follow logs
   ```

### Frontend Debugging

1. **Using React DevTools**
   - Install React DevTools browser extension
   - Inspect components in DevTools

2. **Using Browser DevTools**
   - F12 to open DevTools
   - Console tab for errors
   - Network tab for API calls

3. **View logs**
   ```bash
   docker-compose logs frontend
   ```

## 📊 Database Management

### View Data

```sql
-- View all employees
SELECT * FROM employees;

-- View all jobs
SELECT * FROM jobs;

-- View all applications
SELECT a.*, ap.name, j.title 
FROM applications a
JOIN applicants ap ON a.applicant_id = ap.id
JOIN jobs j ON a.job_id = j.id;
```

### Reset Database

```bash
# Stop containers and remove volume
docker-compose down -v

# Restart (will reinitialize from init.sql)
docker-compose up --build
```

## 🔑 Sample API Calls

### Employees
```bash
# Get all employees
curl http://localhost:5000/api/employees

# Get single employee
curl http://localhost:5000/api/employees/1

# Search employees
curl "http://localhost:5000/api/employees?search=Engineering"
```

### Jobs
```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Get open jobs only
curl "http://localhost:5000/api/jobs?openOnly=true"
```

### Applications
```bash
# Get all applications
curl http://localhost:5000/api/applications

# Get applications for specific job
curl http://localhost:5000/api/applications/job/1

# Create application
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_id": 1,
    "job_id": 1
  }'
```

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
npm test
```

### Frontend Unit Tests
```bash
cd frontend
npm test -- --watchAll=false
```

## 🚨 Common Issues

### Issue: "Docker daemon is not running"
**Solution**: Start Docker Desktop or Docker service
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows
Start Docker Desktop from Start menu
```

### Issue: "Port already in use"
**Solution**: Change port or kill process using it
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process (use PID from above)
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: "Database connection failed"
**Solution**: Ensure MySQL container is healthy
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Issue: "Frontend cannot reach backend"
**Solution**: Check API URL and CORS
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check frontend .env file
# REACT_APP_API_URL should be http://localhost:5000/api
```

## 📖 Code Style

### Backend (Node.js/Express)
- Use async/await over callbacks
- Use const/let (avoid var)
- Use arrow functions where appropriate
- Add JSDoc comments for functions

### Frontend (React)
- Use functional components
- Use hooks (useState, useEffect)
- Use meaningful component names
- Add PropTypes for validation

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
# After review, merge to main
```

## 📈 Performance Tips

1. **Database Queries**
   - Use proper indexes
   - Limit result sets
   - Use SELECT specific columns

2. **Frontend**
   - Use React.memo for components
   - Implement lazy loading
   - Optimize images

3. **Backend**
   - Use connection pooling
   - Implement caching
   - Minimize database calls

## 🆘 Getting Help

1. **Check logs first**
   - Docker logs: `docker-compose logs [service]`
   - Application console: Check terminal/browser console

2. **Check API**
   - Health endpoint: http://localhost:5000/health
   - API root: http://localhost:5000/api

3. **Common commands**
   ```bash
   # View all containers
   docker-compose ps
   
   # View service logs
   docker-compose logs [service] -f
   
   # Restart service
   docker-compose restart [service]
   
   # Execute command in container
   docker-compose exec [service] [command]
   ```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

Happy coding! 🚀
