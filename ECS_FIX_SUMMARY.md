# ECS MySQL Tables Missing - Fix Summary

## ✅ Problem Solved

**Issue**: MySQL container in ECS runs successfully but tables don't exist, causing backend API errors:
```
"Table 'cloudnexushr.employees' doesn't exist"
```

**Root Cause**: The official `mysql:8.0` image was pushed to ECR without database initialization scripts.

**Solution**: Created custom MySQL Docker image that includes initialization scripts to automatically create schema and load sample data.

---

## 📦 Deliverables Created

### 1. **MySQL Dockerfile** (`database/Dockerfile`)
Custom MySQL image that copies `init.sql` to `/docker-entrypoint-initdb.d/` for automatic initialization.

### 2. **Updated Database Configuration**
- Changed database name from `cloud_nexus_hr` to `cloudnexushr` (removed underscore)
- Ensures consistency across:
  - MySQL container environment
  - Backend configuration
  - SQL initialization scripts
  - Docker Compose setup

### 3. **Deployment Scripts**
- **Windows**: `scripts/deploy-mysql-to-ecs.ps1`
- **Linux/Mac**: `scripts/deploy-mysql-to-ecs.sh`

Both scripts automate:
- Building custom MySQL image
- Local testing (verifies tables are created)
- Pushing to ECR
- Updating ECS services

### 4. **Documentation**
- **Complete Guide**: `docs/ECS_MYSQL_FIX.md` (step-by-step instructions)
- **Quick Reference**: `QUICK_FIX_REFERENCE.md` (commands at a glance)

---

## 🚀 How to Deploy the Fix

### Option 1: Automated (Recommended)

**Windows PowerShell:**
```powershell
cd C:\Projects\Automation
.\scripts\deploy-mysql-to-ecs.ps1
```

**Linux/Mac:**
```bash
cd /path/to/Automation
chmod +x scripts/deploy-mysql-to-ecs.sh
./scripts/deploy-mysql-to-ecs.sh
```

### Option 2: Manual

```bash
# 1. Build custom MySQL image
cd database
docker build -t cloud-nexus-mysql .

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  039612843833.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag and push
docker tag cloud-nexus-mysql:latest \
  039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
docker push \
  039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest

# 4. Update ECS services
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service mysql-service \
  --force-new-deployment \
  --region us-east-1

# Wait for MySQL to stabilize
aws ecs wait services-stable \
  --cluster cloud-nexus-hr-cluster \
  --services mysql-service \
  --region us-east-1

# Update backend
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service backend-service \
  --force-new-deployment \
  --region us-east-1
```

---

## ✅ Verification Steps

### 1. Check ECS Services Status
```bash
aws ecs describe-services \
  --cluster cloud-nexus-hr-cluster \
  --services mysql-service backend-service \
  --region us-east-1 \
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

Expected:
```
---------------------------------------------------------
|                   DescribeServices                    |
+------------------+--------+-------------+-------------+
|  mysql-service   | ACTIVE |      1      |      1      |
|  backend-service | ACTIVE |      1      |      1      |
+------------------+--------+-------------+-------------+
```

### 2. Check MySQL Logs
```bash
aws logs tail /ecs/mysql-task --follow --region us-east-1
```

Look for:
```
[Note] [Entrypoint]: /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-init.sql
[Note] [Entrypoint]: MySQL init process done. Ready for start up.
```

### 3. Test API Endpoints
```bash
# Get Load Balancer DNS
ALB=$(aws elbv2 describe-load-balancers --region us-east-1 \
  --query 'LoadBalancers[0].DNSName' --output text)

# Test employees endpoint
curl http://$ALB/api/employees

# Test jobs endpoint
curl http://$ALB/api/jobs

# Test applications endpoint
curl http://$ALB/api/applications
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Priya Sharma",
      "email": "priya.sharma@cloudnexus.com",
      "department": "HR",
      "designation": "HR Manager"
    },
    ...
  ],
  "count": 10
}
```

### 4. Verify Tables Exist

Get MySQL task ARN:
```bash
TASK=$(aws ecs list-tasks \
  --cluster cloud-nexus-hr-cluster \
  --service mysql-service \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)
```

Execute command in container:
```bash
aws ecs execute-command \
  --cluster cloud-nexus-hr-cluster \
  --task $TASK \
  --container mysql \
  --command "mysql -uroot -p\$MYSQL_ROOT_PASSWORD -e 'USE cloudnexushr; SHOW TABLES;'" \
  --interactive \
  --region us-east-1
```

**Expected Output**:
```
+------------------------+
| Tables_in_cloudnexushr |
+------------------------+
| applicants             |
| applications           |
| employees              |
| jobs                   |
| leave_requests         |
| support_tickets        |
| users                  |
+------------------------+
7 rows in set
```

---

## 📊 Database Schema

### Tables Created (7 total)

| Table | Description | Sample Records |
|-------|-------------|----------------|
| `employees` | Employee directory | 10 |
| `jobs` | Job postings | 8 |
| `applicants` | Job applicants | 8 |
| `applications` | Job applications | 8 |
| `leave_requests` | Leave requests | 5 |
| `support_tickets` | Support tickets | 5 |
| `users` | Authentication | 4 |

### Key Configuration

| Setting | Value |
|---------|-------|
| Database Name | `cloudnexushr` |
| Character Set | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |
| Engine | InnoDB |
| MySQL Version | 8.0 |

---

## 🔧 Files Modified

| File | Change | Why |
|------|--------|-----|
| `database/Dockerfile` | **Created** | Custom MySQL image with init script |
| `database/init.sql` | Updated DB name | Changed `cloud_nexus_hr` → `cloudnexushr` |
| `backend/src/config/database.js` | Updated default DB | Changed `cloud_nexus_hr` → `cloudnexushr` |
| `docker-compose.yml` | Updated env vars | Changed `cloud_nexus_hr` → `cloudnexushr` |
| `scripts/deploy-mysql-to-ecs.ps1` | **Created** | Automated deployment (Windows) |
| `scripts/deploy-mysql-to-ecs.sh` | **Created** | Automated deployment (Linux/Mac) |
| `docs/ECS_MYSQL_FIX.md` | **Created** | Complete deployment guide |
| `QUICK_FIX_REFERENCE.md` | **Created** | Quick command reference |

---

## 🎯 Success Criteria

✅ MySQL container starts and stays healthy  
✅ All 7 tables are created in `cloudnexushr` database  
✅ Sample data is loaded (10 employees, 8 jobs, etc.)  
✅ Backend connects to MySQL successfully  
✅ API endpoints return JSON data (not errors)  
✅ No "table doesn't exist" errors in logs  
✅ Health checks pass for both MySQL and backend services  

---

## 📝 Important Notes

### 1. Database Name Consistency
The database name **must be `cloudnexushr`** (no underscore) across:
- ECS Task Definition environment variable: `MYSQL_DATABASE=cloudnexushr`
- Backend environment variable: `DB_NAME=cloudnexushr`
- SQL initialization script: `USE cloudnexushr;`

### 2. Initialization Script Execution
- Scripts in `/docker-entrypoint-initdb.d/` run **only on first startup** when data directory is empty
- They execute in alphabetical order
- Our script: `01-init.sql`

### 3. Data Persistence
Current setup does not persist data across container restarts. For production:
- Use **Amazon RDS** (recommended)
- Or mount **EFS volume** to `/var/lib/mysql`

### 4. Security Best Practices
- Use **AWS Secrets Manager** for database passwords
- Don't hardcode passwords in task definitions
- Restrict security groups to only allow traffic from backend

### 5. Troubleshooting
If tables still don't exist after deployment:
1. Check MySQL logs for initialization messages
2. Verify image in ECR is the custom-built one (not official mysql:8.0)
3. Ensure ECS task is using latest task definition revision
4. Check that database name matches everywhere

---

## 🔗 Related Documentation

- **Full Deployment Guide**: `docs/ECS_MYSQL_FIX.md`
- **Quick Reference**: `QUICK_FIX_REFERENCE.md`
- **ECS Deployment Guide**: `docs/ECS_DEPLOYMENT.md`
- **Architecture Overview**: `docs/ARCHITECTURE.md`

---

## ✅ Local Testing Results

Tested locally with `docker-compose`:
```bash
docker compose up --build
```

**Results**:
- ✅ MySQL container healthy
- ✅ Backend container healthy
- ✅ Frontend container healthy
- ✅ Database `cloudnexushr` created
- ✅ All 7 tables created
- ✅ Sample data loaded (10 employees)
- ✅ API returns data successfully:
  ```json
  {"success": true, "count": 10}
  ```

---

## 🎉 Ready to Deploy

All files are ready. Follow the deployment steps above to fix your ECS MySQL issue.

**Estimated Time**: 10-15 minutes (including service stabilization)

**Questions?** Check `docs/ECS_MYSQL_FIX.md` for detailed troubleshooting.
