# Cloud Nexus HR Platform - AWS ECS Fargate Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] Docker images built and pushed to ECR
- [ ] GitHub repository with CI/CD pipeline
- [ ] RDS MySQL instance created
- [ ] VPC and security groups configured
- [ ] Application Load Balancer created
- [ ] IAM roles and policies configured

## 🏗️ AWS Architecture

```
┌────────────────────────────────────────────────┐
│         AWS Cloud (us-east-1 region)           │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │   Elastic Container Registry (ECR)       │  │
│ │   ├── cloud-nexus-hr-frontend:latest     │  │
│ │   └── cloud-nexus-hr-backend:latest      │  │
│ └──────────────────────────────────────────┘  │
│                      ↓                         │
│ ┌──────────────────────────────────────────┐  │
│ │  Application Load Balancer (ALB)         │  │
│ │  Port 80 → Frontend                      │  │
│ │  Port 8080 → Backend                     │  │
│ └──────────────────────────────────────────┘  │
│   ↙                                        ↖   │
│ ┌──────────────────────┐  ┌──────────────┐   │
│ │ ECS Cluster          │  │ RDS MySQL    │   │
│ │ ├── Frontend Service │  │ (Multi-AZ)   │   │
│ │ │   ├── Task 1       │  │              │   │
│ │ │   └── Task 2       │  │ Security: SG │   │
│ │ └── Backend Service  │  └──────────────┘   │
│ │     ├── Task 1       │                      │
│ │     └── Task 2       │                      │
│ └──────────────────────┘                      │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │   Supporting Services                    │  │
│ │   ├── CloudWatch (Monitoring)            │  │
│ │   ├── Secrets Manager (Keys, Passwords)  │  │
│ │   ├── Auto Scaling (CPU/Memory)          │  │
│ │   └── CloudFormation (IaC)               │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

## Step 1: AWS Setup

### 1.1 Create AWS Account

1. Go to [AWS Management Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the setup wizard
4. Configure billing alerts

### 1.2 Configure AWS CLI

```bash
# Install AWS CLI
# macOS
brew install awscli

# Windows
choco install awscliv2

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

### 1.3 Create IAM User for CI/CD

1. Go to IAM Console
2. Create new user: `cloud-nexus-ci-cd`
3. Attach policies:
   - `AmazonECS_FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `IAMFullAccess`
4. Generate access keys
5. Save keys securely

## Step 2: Container Registry Setup

### 2.1 Create ECR Repository

```bash
# Create repository for backend
aws ecr create-repository \
  --repository-name cloud-nexus-hr-backend \
  --region us-east-1

# Create repository for frontend
aws ecr create-repository \
  --repository-name cloud-nexus-hr-frontend \
  --region us-east-1

# View repositories
aws ecr describe-repositories --region us-east-1
```

### 2.2 Push Images to ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push backend image
docker tag cloud-nexus-backend:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-hr-backend:latest

docker push \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-hr-backend:latest

# Tag and push frontend image
docker tag cloud-nexus-frontend:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-hr-frontend:latest

docker push \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-hr-frontend:latest

# Verify push
aws ecr describe-images --repository-name cloud-nexus-hr-backend --region us-east-1
```

## Step 3: Database Setup

### 3.1 Create RDS MySQL Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier cloud-nexus-mysql \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp2 \
  --multi-az \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --publicly-accessible false \
  --region us-east-1

# Wait for instance to be created
aws rds describe-db-instances \
  --db-instance-identifier cloud-nexus-mysql \
  --region us-east-1
```

### 3.2 Create Database

```bash
# After RDS instance is ready, connect to it
mysql -h cloud-nexus-mysql.xxxxx.us-east-1.rds.amazonaws.com \
  -u admin -p

# Run initialization script
# Paste content from database/init.sql
```

### 3.3 Store Credentials in Secrets Manager

```bash
# Store database password
aws secretsmanager create-secret \
  --name cloud-nexus/db-password \
  --secret-string '{"password":"<YOUR_DB_PASSWORD>"}' \
  --region us-east-1

# Store JWT secret
aws secretsmanager create-secret \
  --name cloud-nexus/jwt-secret \
  --secret-string '{"jwt_secret":"<YOUR_JWT_SECRET>"}' \
  --region us-east-1
```

## Step 4: ECS Cluster Setup

### 4.1 Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster \
  --cluster-name cloud-nexus-cluster \
  --region us-east-1

# View cluster
aws ecs describe-clusters \
  --clusters cloud-nexus-cluster \
  --region us-east-1
```

### 4.2 Create CloudWatch Log Groups

```bash
# Create log groups
aws logs create-log-group \
  --log-group-name /ecs/cloud-nexus-frontend \
  --region us-east-1

aws logs create-log-group \
  --log-group-name /ecs/cloud-nexus-backend \
  --region us-east-1

aws logs create-log-group \
  --log-group-name /ecs/cloud-nexus-mysql \
  --region us-east-1

# Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/cloud-nexus-frontend \
  --retention-in-days 7 \
  --region us-east-1
```

### 4.3 Create ECS Task Definition (Backend)

```bash
# Create task-definition-backend.json
aws ecs register-task-definition \
  --cli-input-json file://task-definition-backend.json \
  --region us-east-1
```

**task-definition-backend.json:**
```json
{
  "family": "cloud-nexus-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "cloud-nexus-backend",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-nexus-hr-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "DB_HOST",
          "value": "cloud-nexus-mysql.xxxxx.us-east-1.rds.amazonaws.com"
        },
        {
          "name": "DB_PORT",
          "value": "3306"
        },
        {
          "name": "DB_USER",
          "value": "admin"
        },
        {
          "name": "DB_NAME",
          "value": "cloud_nexus_hr"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:cloud-nexus/db-password:password::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:cloud-nexus/jwt-secret:jwt_secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cloud-nexus-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:5000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/ecsTaskExecutionRole"
}
```

### 4.4 Create ECS Task Definition (Frontend)

Similar to backend, but:
- Image: `cloud-nexus-hr-frontend:latest`
- Port: `3000`
- Environment: `REACT_APP_API_URL`
- No database secrets needed

### 4.5 Create ECS Services

```bash
# Create backend service
aws ecs create-service \
  --cluster cloud-nexus-cluster \
  --service-name cloud-nexus-backend \
  --task-definition cloud-nexus-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxx, subnet-yyyyy],
    securityGroups=[sg-xxxxx],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/cloud-nexus-backend/xxxxx,containerName=cloud-nexus-backend,containerPort=5000" \
  --region us-east-1

# Create frontend service (similar)
aws ecs create-service \
  --cluster cloud-nexus-cluster \
  --service-name cloud-nexus-frontend \
  --task-definition cloud-nexus-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --region us-east-1
```

## Step 5: Load Balancer Setup

### 5.1 Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name cloud-nexus-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region us-east-1
```

### 5.2 Create Target Groups

```bash
# Backend target group
aws elbv2 create-target-group \
  --name cloud-nexus-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-enabled \
  --health-check-path /health \
  --region us-east-1

# Frontend target group
aws elbv2 create-target-group \
  --name cloud-nexus-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --region us-east-1
```

### 5.3 Create Listener Rules

```bash
# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:loadbalancer/app/cloud-nexus-alb/xxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/cloud-nexus-frontend-tg/xxxxx \
  --region us-east-1

# Create rule for API
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:listener/app/cloud-nexus-alb/xxxxx/xxxxx \
  --conditions Field=path-pattern,Values=/api/* \
  --priority 1 \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<AWS_ACCOUNT_ID>:targetgroup/cloud-nexus-backend-tg/xxxxx \
  --region us-east-1
```

## Step 6: GitHub Actions Configuration

### 6.1 Add AWS Secrets to GitHub

1. Go to GitHub Repository → Settings → Secrets
2. Add secrets:
   - `AWS_ACCOUNT_ID` - Your AWS account ID
   - `AWS_ACCESS_KEY_ID` - IAM user access key
   - `AWS_SECRET_ACCESS_KEY` - IAM user secret key
   - `ECS_CLUSTER_NAME` - `cloud-nexus-cluster`

### 6.2 Verify CI/CD Workflow

The `.github/workflows/deploy.yml` includes:
- Build & Test stages
- Docker image build & push
- ECS service update

## Step 7: Auto-Scaling Setup

### 7.1 Create Auto-Scaling Target

```bash
# Backend auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/cloud-nexus-cluster/cloud-nexus-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region us-east-1

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --policy-name backend-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/cloud-nexus-cluster/cloud-nexus-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    TargetValue=70.0,PredefinedMetricSpecification="{PredefinedMetricType=ECSServiceAverageCPUUtilization}" \
  --region us-east-1
```

## Step 8: Monitoring & Logging

### 8.1 CloudWatch Dashboard

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name cloud-nexus-dashboard \
  --dashboard-body file://dashboard-body.json \
  --region us-east-1
```

### 8.2 Create Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-cpu \
  --alarm-description "Alert when backend CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:<AWS_ACCOUNT_ID>:alerts \
  --region us-east-1
```

## Deployment Checklist

- [ ] ECR repositories created
- [ ] Images pushed to ECR
- [ ] RDS MySQL instance created and initialized
- [ ] ECS cluster created
- [ ] ECS task definitions registered
- [ ] ECS services created
- [ ] Load balancer configured
- [ ] Target groups set up
- [ ] Listener rules configured
- [ ] Auto-scaling policies created
- [ ] CloudWatch monitoring enabled
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] Health checks passing
- [ ] Application accessible

## Verification

```bash
# Check service status
aws ecs describe-services \
  --cluster cloud-nexus-cluster \
  --services cloud-nexus-backend cloud-nexus-frontend \
  --region us-east-1

# Check running tasks
aws ecs list-tasks \
  --cluster cloud-nexus-cluster \
  --region us-east-1

# Get service URL
aws elbv2 describe-load-balancers \
  --names cloud-nexus-alb \
  --region us-east-1
```

## Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check task logs
aws logs tail /ecs/cloud-nexus-backend --follow

# Check task details
aws ecs describe-tasks \
  --cluster cloud-nexus-cluster \
  --tasks <task-arn> \
  --region us-east-1
```

**Database connection issues:**
```bash
# Verify RDS security group allows traffic
# Check RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier cloud-nexus-mysql \
  --region us-east-1
```

**Load balancer target health:**
```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region us-east-1
```

## Cost Optimization

1. Use Fargate Spot for non-critical workloads (70% savings)
2. Right-size task resources
3. Use RDS Multi-AZ only for production
4. Enable S3 lifecycle policies
5. Monitor and optimize CloudWatch logs retention

## Security Best Practices

1. Use Secrets Manager for sensitive data
2. Enable VPC Flow Logs
3. Use private subnets for databases
4. Enable AWS CloudTrail
5. Implement WAF rules on ALB
6. Regular security group audits
7. Enable RDS encryption
8. Use IAM roles (not access keys)

---

For more information, visit [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
