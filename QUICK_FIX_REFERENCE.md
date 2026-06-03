# Quick Fix Reference - MySQL Tables Missing in ECS

## Problem
✗ ECS MySQL container runs but tables don't exist  
✗ Backend returns: "Table 'cloudnexushr.employees' doesn't exist"

## Solution
Build custom MySQL image with initialization scripts

---

## Quick Fix (Windows PowerShell)

```powershell
# Run from project root directory
cd C:\Projects\Automation

# Execute deployment script
.\scripts\deploy-mysql-to-ecs.ps1
```

## Quick Fix (Linux/Mac)

```bash
# Run from project root directory
cd /path/to/Automation

# Make script executable
chmod +x scripts/deploy-mysql-to-ecs.sh

# Execute deployment script
./scripts/deploy-mysql-to-ecs.sh
```

---

## Manual Steps (if scripts fail)

### 1. Build MySQL Image
```bash
cd database
docker build -t cloud-nexus-mysql .
```

### 2. Test Locally (Optional)
```bash
docker run -d --name test-mysql \
  -e MYSQL_ROOT_PASSWORD=testpass \
  -e MYSQL_DATABASE=cloudnexushr \
  -p 3308:3306 cloud-nexus-mysql

# Wait 30 seconds
sleep 30

# Check tables
docker exec test-mysql mysql -uroot -ptestpass \
  -e "USE cloudnexushr; SHOW TABLES;"

# Should show: employees, jobs, applications, etc.

# Cleanup
docker stop test-mysql && docker rm test-mysql
```

### 3. Push to ECR
```bash
# Login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  039612843833.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag cloud-nexus-mysql:latest \
  039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest

# Push
docker push \
  039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
```

### 4. Update ECS Services
```bash
# Update MySQL service
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service mysql-service \
  --force-new-deployment \
  --region us-east-1

# Wait for stable
aws ecs wait services-stable \
  --cluster cloud-nexus-hr-cluster \
  --services mysql-service \
  --region us-east-1

# Update backend service
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service backend-service \
  --force-new-deployment \
  --region us-east-1
```

---

## Verify Fix

### Test API Endpoints
```bash
# Get your Load Balancer DNS
ALB=$(aws elbv2 describe-load-balancers --region us-east-1 \
  --query 'LoadBalancers[0].DNSName' --output text)

# Test endpoints
curl http://$ALB/api/employees
curl http://$ALB/api/jobs
curl http://$ALB/api/applications
```

### Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Priya Sharma",
      "email": "priya.sharma@cloudnexus.com",
      "department": "HR"
    }
  ],
  "count": 10
}
```

### Check Logs
```bash
# MySQL logs
aws logs tail /ecs/mysql-task --follow --region us-east-1

# Backend logs
aws logs tail /ecs/backend-task --follow --region us-east-1
```

---

## What Changed

| File | Change |
|------|--------|
| `database/Dockerfile` | Created - Custom MySQL image with init script |
| `database/init.sql` | Updated - Changed DB name to `cloudnexushr` |
| `backend/src/config/database.js` | Updated - DB name to `cloudnexushr` |
| `docker-compose.yml` | Updated - DB name to `cloudnexushr` |

---

## Key Points

✅ Database name: `cloudnexushr` (no underscore)  
✅ Init script: `/docker-entrypoint-initdb.d/01-init.sql`  
✅ Tables created: 7 tables (employees, jobs, applications, etc.)  
✅ Sample data: 10 employees, 8 jobs, 8 applicants  

---

## Troubleshooting

### Tables still missing?
```bash
# Connect to MySQL container
TASK=$(aws ecs list-tasks --cluster cloud-nexus-hr-cluster \
  --service mysql-service --region us-east-1 \
  --query 'taskArns[0]' --output text)

# Check if init script ran
aws logs filter-pattern "/ecs/mysql-task" \
  --log-stream-name-prefix "ecs/mysql" \
  --filter-pattern "01-init.sql" \
  --region us-east-1
```

### Backend can't connect?
```bash
# Check backend environment variables
aws ecs describe-task-definition \
  --task-definition backend-task \
  --region us-east-1 | grep DB_NAME

# Should output: "DB_NAME": "cloudnexushr"
```

### Image not updating in ECS?
```bash
# Force pull latest image
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service mysql-service \
  --force-new-deployment \
  --region us-east-1
```

---

## Support Files

- **Full Guide**: `docs/ECS_MYSQL_FIX.md`
- **PowerShell Script**: `scripts/deploy-mysql-to-ecs.ps1`
- **Bash Script**: `scripts/deploy-mysql-to-ecs.sh`
- **MySQL Dockerfile**: `database/Dockerfile`

---

## Success Criteria

✅ MySQL service: Healthy  
✅ Backend service: Healthy  
✅ Tables exist in `cloudnexushr` database  
✅ API returns JSON data (not errors)  
✅ No "table doesn't exist" in logs  
