# ECS MySQL Fix - Deployment Checklist

## Pre-Deployment Checklist

- [ ] AWS CLI installed and configured
- [ ] Docker installed and running
- [ ] AWS credentials with ECS/ECR permissions
- [ ] ECR repository exists: `cloud-nexus-mysql`
- [ ] ECS cluster running: `cloud-nexus-hr-cluster`
- [ ] Services exist: `mysql-service` and `backend-service`

---

## Deployment Steps

### Phase 1: Build and Test

- [ ] Navigate to project directory: `cd C:\Projects\Automation`
- [ ] Build MySQL image: `docker build -t cloud-nexus-mysql ./database`
- [ ] Verify image created: `docker images | grep cloud-nexus-mysql`
- [ ] Test locally (optional):
  ```bash
  docker run -d --name test-mysql -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=cloudnexushr -p 3308:3306 cloud-nexus-mysql
  ```
- [ ] Wait 30 seconds for initialization
- [ ] Check tables exist:
  ```bash
  docker exec test-mysql mysql -uroot -ptest -e "USE cloudnexushr; SHOW TABLES;"
  ```
- [ ] Verify 7 tables listed
- [ ] Cleanup test: `docker stop test-mysql && docker rm test-mysql`

### Phase 2: Push to ECR

- [ ] Login to ECR:
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 039612843833.dkr.ecr.us-east-1.amazonaws.com
  ```
- [ ] Tag image:
  ```bash
  docker tag cloud-nexus-mysql:latest 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
  ```
- [ ] Push to ECR:
  ```bash
  docker push 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
  ```
- [ ] Verify push: `aws ecr describe-images --repository-name cloud-nexus-mysql --region us-east-1`

### Phase 3: Update ECS

- [ ] Update MySQL service:
  ```bash
  aws ecs update-service --cluster cloud-nexus-hr-cluster --service mysql-service --force-new-deployment --region us-east-1
  ```
- [ ] Wait for MySQL to stabilize (2-3 minutes):
  ```bash
  aws ecs wait services-stable --cluster cloud-nexus-hr-cluster --services mysql-service --region us-east-1
  ```
- [ ] Update backend service:
  ```bash
  aws ecs update-service --cluster cloud-nexus-hr-cluster --service backend-service --force-new-deployment --region us-east-1
  ```
- [ ] Wait for backend to stabilize

### Phase 4: Verification

- [ ] Check service status:
  ```bash
  aws ecs describe-services --cluster cloud-nexus-hr-cluster --services mysql-service backend-service --region us-east-1
  ```
- [ ] Both services show: `runningCount: 1`, `desiredCount: 1`
- [ ] Check MySQL logs for initialization:
  ```bash
  aws logs tail /ecs/mysql-task --region us-east-1 | grep "01-init.sql"
  ```
- [ ] Get Load Balancer DNS:
  ```bash
  aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[0].DNSName' --output text
  ```
- [ ] Test employees endpoint: `curl http://[ALB-DNS]/api/employees`
- [ ] Response shows: `"success": true, "count": 10`
- [ ] Test jobs endpoint: `curl http://[ALB-DNS]/api/jobs`
- [ ] Response shows: `"success": true, "count": 8`
- [ ] Test applications endpoint: `curl http://[ALB-DNS]/api/applications`
- [ ] Response shows: `"success": true, "count": 8`
- [ ] No "table doesn't exist" errors
- [ ] Frontend loads at: `http://[ALB-DNS]/`

---

## Automated Deployment (Alternative)

Instead of manual steps, use deployment script:

**Windows:**
- [ ] Run: `.\scripts\deploy-mysql-to-ecs.ps1`

**Linux/Mac:**
- [ ] Make executable: `chmod +x scripts/deploy-mysql-to-ecs.sh`
- [ ] Run: `./scripts/deploy-mysql-to-ecs.sh`

---

## Post-Deployment Verification Checklist

### Service Health
- [ ] MySQL service: ACTIVE, HEALTHY
- [ ] Backend service: ACTIVE, HEALTHY
- [ ] Frontend service: ACTIVE, HEALTHY

### Database
- [ ] Database `cloudnexushr` exists
- [ ] 7 tables created:
  - [ ] `employees`
  - [ ] `jobs`
  - [ ] `applicants`
  - [ ] `applications`
  - [ ] `leave_requests`
  - [ ] `support_tickets`
  - [ ] `users`
- [ ] Sample data loaded:
  - [ ] 10 employees
  - [ ] 8 jobs
  - [ ] 8 applicants
  - [ ] 8 applications
  - [ ] 5 leave requests
  - [ ] 5 support tickets
  - [ ] 4 users

### API Endpoints
- [ ] `/api` - API info
- [ ] `/api/employees` - Returns 10 employees
- [ ] `/api/jobs` - Returns 8 jobs
- [ ] `/api/applications` - Returns 8 applications
- [ ] `/api/leave-requests` - Returns 5 requests
- [ ] `/api/tickets` - Returns 5 tickets

### Logs
- [ ] No "table doesn't exist" errors
- [ ] No connection errors
- [ ] MySQL initialization completed
- [ ] Backend connected successfully

---

## Rollback Plan (If Issues Occur)

If deployment fails:

1. [ ] Check previous task definition version number
2. [ ] Revert MySQL service:
   ```bash
   aws ecs update-service --cluster cloud-nexus-hr-cluster --service mysql-service --task-definition mysql-task:PREVIOUS_VERSION --region us-east-1
   ```
3. [ ] Revert backend service if needed
4. [ ] Review logs for errors
5. [ ] Check troubleshooting guide: `docs/ECS_MYSQL_FIX.md`

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Tables still missing | Verify image in ECR is custom-built, not official mysql:8.0 |
| Backend can't connect | Check DB_NAME environment variable is `cloudnexushr` |
| Service won't stabilize | Check CloudWatch logs for errors |
| Init script didn't run | Ensure data volume was empty on first start |
| Wrong database name | Update task definition environment variables |

---

## Contacts & Resources

- **Full Guide**: `docs/ECS_MYSQL_FIX.md`
- **Quick Reference**: `QUICK_FIX_REFERENCE.md`
- **Summary**: `ECS_FIX_SUMMARY.md`
- **Architecture**: `docs/ARCHITECTURE.md`

---

## Sign-Off

Deployment completed by: ________________  
Date: ________________  
Time: ________________  

All checklist items verified: ☐ Yes ☐ No

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
