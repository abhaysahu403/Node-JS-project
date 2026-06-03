# Fix MySQL Tables Not Created in ECS

## Problem
The MySQL container in ECS starts successfully but no tables are created because the official `mysql:8.0` image was pushed to ECR without the initialization scripts.

## Solution
Build a custom MySQL Docker image that includes the database initialization scripts.

---

## Prerequisites
- AWS CLI configured with appropriate credentials
- Docker installed and running
- ECR repository: `039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql`
- AWS Region: `us-east-1`

---

## Step-by-Step Deployment

### Step 1: Build Custom MySQL Image

Navigate to the database directory:
```bash
cd database
```

Build the custom MySQL image:
```bash
docker build -t cloud-nexus-mysql .
```

Verify the image was created:
```bash
docker images | grep cloud-nexus-mysql
```

### Step 2: Test Locally (Optional but Recommended)

Start a test container:
```bash
docker run -d \
  --name test-mysql \
  -e MYSQL_ROOT_PASSWORD=testpassword \
  -e MYSQL_DATABASE=cloudnexushr \
  -p 3308:3306 \
  cloud-nexus-mysql
```

Wait 30 seconds for MySQL to initialize, then verify tables exist:
```bash
docker exec -it test-mysql mysql -uroot -ptestpassword -e "USE cloudnexushr; SHOW TABLES;"
```

Expected output:
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
```

Check sample data:
```bash
docker exec -it test-mysql mysql -uroot -ptestpassword -e "SELECT COUNT(*) FROM cloudnexushr.employees;"
```

Expected: 10 employees

Clean up test container:
```bash
docker stop test-mysql
docker rm test-mysql
```

### Step 3: Login to AWS ECR

Authenticate Docker to your AWS ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 039612843833.dkr.ecr.us-east-1.amazonaws.com
```

### Step 4: Tag and Push Image to ECR

Tag the image:
```bash
docker tag cloud-nexus-mysql:latest 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
```

Push to ECR:
```bash
docker push 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
```

Verify the push completed successfully:
```bash
aws ecr describe-images --repository-name cloud-nexus-mysql --region us-east-1
```

### Step 5: Update ECS Task Definition

**Option A: Via AWS Console**

1. Go to ECS Console → Task Definitions
2. Select `mysql-task`
3. Click "Create new revision"
4. In the Container Definitions:
   - Container name: `mysql`
   - Image: `039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest`
   - Environment Variables:
     - `MYSQL_ROOT_PASSWORD`: `your-secure-password`
     - `MYSQL_DATABASE`: `cloudnexushr`
     - `MYSQL_USER`: `hr_user`
     - `MYSQL_PASSWORD`: `your-secure-password`
5. Click "Create"

**Option B: Via AWS CLI**

Register a new task definition revision (update the JSON with your actual task definition):
```bash
aws ecs register-task-definition \
  --family mysql-task \
  --network-mode awsvpc \
  --requires-compatibilities FARGATE \
  --cpu "512" \
  --memory "1024" \
  --execution-role-arn "arn:aws:iam::039612843833:role/ecsTaskExecutionRole" \
  --container-definitions '[
    {
      "name": "mysql",
      "image": "039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3306,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "MYSQL_ROOT_PASSWORD",
          "value": "your-secure-password"
        },
        {
          "name": "MYSQL_DATABASE",
          "value": "cloudnexushr"
        },
        {
          "name": "MYSQL_USER",
          "value": "hr_user"
        },
        {
          "name": "MYSQL_PASSWORD",
          "value": "your-secure-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mysql-task",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "mysqladmin ping -h localhost || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]' \
  --region us-east-1
```

### Step 6: Update Backend Task Definition

Ensure backend uses `cloudnexushr` (no underscore):

Environment variable in backend task:
```
DB_NAME=cloudnexushr
```

### Step 7: Force New Deployment

Update the MySQL service to use the new task definition:

**Via AWS Console:**
1. Go to ECS Console → Clusters → Your Cluster
2. Select `mysql-service`
3. Click "Update"
4. Check "Force new deployment"
5. Select the latest task definition revision
6. Click "Update"

**Via AWS CLI:**
```bash
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service mysql-service \
  --force-new-deployment \
  --region us-east-1
```

Wait for the service to stabilize:
```bash
aws ecs wait services-stable \
  --cluster cloud-nexus-hr-cluster \
  --services mysql-service \
  --region us-east-1
```

### Step 8: Update Backend Service

After MySQL is stable, update backend service:
```bash
aws ecs update-service \
  --cluster cloud-nexus-hr-cluster \
  --service backend-service \
  --force-new-deployment \
  --region us-east-1
```

---

## Verification

### Check Service Status

```bash
aws ecs describe-services \
  --cluster cloud-nexus-hr-cluster \
  --services mysql-service backend-service \
  --region us-east-1
```

### Check Task Logs

MySQL logs:
```bash
aws logs tail /ecs/mysql-task --follow --region us-east-1
```

Backend logs:
```bash
aws logs tail /ecs/backend-task --follow --region us-east-1
```

### Verify Tables Exist

Connect to ECS task and check MySQL:
```bash
# Get MySQL task ID
MYSQL_TASK=$(aws ecs list-tasks --cluster cloud-nexus-hr-cluster --service mysql-service --region us-east-1 --query 'taskArns[0]' --output text)

# Execute command in the container
aws ecs execute-command \
  --cluster cloud-nexus-hr-cluster \
  --task $MYSQL_TASK \
  --container mysql \
  --command "mysql -uroot -p$MYSQL_ROOT_PASSWORD -e 'USE cloudnexushr; SHOW TABLES;'" \
  --interactive \
  --region us-east-1
```

### Test Backend API

Get your Load Balancer DNS:
```bash
aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[0].DNSName' --output text
```

Test endpoints:
```bash
# Replace ALB_DNS with your actual Load Balancer DNS
ALB_DNS="your-alb-dns-name.us-east-1.elb.amazonaws.com"

# Test API root
curl http://$ALB_DNS/api

# Test employees endpoint
curl http://$ALB_DNS/api/employees

# Test jobs endpoint
curl http://$ALB_DNS/api/jobs

# Test applications endpoint
curl http://$ALB_DNS/api/applications
```

Expected: JSON data with records, not "table doesn't exist" errors.

---

## Troubleshooting

### Issue: Tables still don't exist

**Check 1: Verify image in ECR contains init.sql**
```bash
aws ecr describe-images --repository-name cloud-nexus-mysql --region us-east-1
```

**Check 2: Check MySQL logs for initialization**
```bash
aws logs tail /ecs/mysql-task --since 10m --region us-east-1 | grep -i "entrypoint"
```

Look for:
```
[Note] [Entrypoint]: /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-init.sql
```

**Check 3: Database name mismatch**

Verify backend is using `cloudnexushr`:
```bash
# Check backend environment variables in task definition
aws ecs describe-task-definition --task-definition backend-task --region us-east-1
```

Look for:
```json
{
  "name": "DB_NAME",
  "value": "cloudnexushr"
}
```

### Issue: MySQL container keeps restarting

Check health check status:
```bash
aws ecs describe-tasks --cluster cloud-nexus-hr-cluster --tasks $MYSQL_TASK --region us-east-1
```

### Issue: Backend can't connect to MySQL

Verify security groups allow traffic between backend and MySQL on port 3306.

Check service discovery or ensure backend uses correct MySQL host.

---

## Important Notes

1. **Database Name**: Must be `cloudnexushr` (no underscore) consistently across:
   - MySQL container environment variable: `MYSQL_DATABASE=cloudnexushr`
   - Backend environment variable: `DB_NAME=cloudnexushr`
   - SQL initialization script: `USE cloudnexushr;`

2. **Persistent Data**: If you need to preserve data across deployments:
   - Use EFS (Elastic File System) mounted to `/var/lib/mysql`
   - Or use Amazon RDS instead of containerized MySQL

3. **Passwords**: Use AWS Secrets Manager for production:
   ```bash
   aws secretsmanager create-secret \
     --name cloud-nexus-mysql-password \
     --secret-string "your-secure-password" \
     --region us-east-1
   ```

4. **First-time initialization**: Init scripts only run when MySQL data directory is empty. If you need to re-run:
   - Delete and recreate the ECS service
   - Or mount a fresh EFS volume

---

## Success Criteria

✅ MySQL container starts and stays healthy  
✅ All 7 tables exist in `cloudnexushr` database  
✅ Sample data is loaded (10 employees, 8 jobs, etc.)  
✅ Backend connects successfully  
✅ API endpoints return JSON data instead of errors  
✅ No "Table doesn't exist" errors in logs  

---

## Quick Command Reference

```bash
# Build and push MySQL image
cd database
docker build -t cloud-nexus-mysql .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 039612843833.dkr.ecr.us-east-1.amazonaws.com
docker tag cloud-nexus-mysql:latest 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest
docker push 039612843833.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-mysql:latest

# Update ECS services
aws ecs update-service --cluster cloud-nexus-hr-cluster --service mysql-service --force-new-deployment --region us-east-1
aws ecs wait services-stable --cluster cloud-nexus-hr-cluster --services mysql-service --region us-east-1
aws ecs update-service --cluster cloud-nexus-hr-cluster --service backend-service --force-new-deployment --region us-east-1

# Test API
curl http://your-alb-dns/api/employees
```
