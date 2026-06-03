#!/bin/bash
# Bash Script to Deploy Custom MySQL Image to AWS ECS
# Cloud Nexus HR Platform - MySQL Database Fix

set -e

# Configuration
REGION="us-east-1"
ACCOUNT_ID="039612843833"
CLUSTER_NAME="cloud-nexus-hr-cluster"
ECR_REPO="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cloud-nexus-mysql"
IMAGE_NAME="cloud-nexus-mysql"
DATABASE_DIR="./database"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Cloud Nexus HR - MySQL ECS Deployment${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Step 1: Build MySQL Image
echo -e "${YELLOW}[1/7] Building Custom MySQL Image...${NC}"

if [ ! -d "$DATABASE_DIR" ]; then
    echo -e "${RED}ERROR: Database directory not found at $DATABASE_DIR${NC}"
    exit 1
fi

cd $DATABASE_DIR
docker build -t $IMAGE_NAME .
cd ..
echo -e "${GREEN}✓ Image built successfully${NC}"
echo ""

# Step 2: Test Image Locally
echo -e "${YELLOW}[2/7] Testing Image Locally...${NC}"

# Start test container
echo "  Starting test container..."
docker run -d \
    --name test-mysql \
    -e MYSQL_ROOT_PASSWORD=testpassword \
    -e MYSQL_DATABASE=cloudnexushr \
    -p 3308:3306 \
    $IMAGE_NAME > /dev/null

# Wait for MySQL to initialize
echo "  Waiting for MySQL to initialize (30 seconds)..."
sleep 30

# Check tables
echo "  Verifying tables exist..."
TABLES=$(docker exec test-mysql mysql -uroot -ptestpassword -e "USE cloudnexushr; SHOW TABLES;" 2>&1)

if echo "$TABLES" | grep -q "employees" && echo "$TABLES" | grep -q "jobs"; then
    echo -e "${GREEN}✓ Tables created successfully${NC}"
    
    # Check data
    COUNT=$(docker exec test-mysql mysql -uroot -ptestpassword -e "SELECT COUNT(*) FROM cloudnexushr.employees;" 2>&1 | grep -o '[0-9]\+' | tail -1)
    if [ "$COUNT" == "10" ]; then
        echo -e "${GREEN}✓ Sample data loaded (10 employees)${NC}"
    else
        echo -e "${YELLOW}WARNING: Sample data might not be loaded correctly${NC}"
    fi
else
    echo -e "${RED}ERROR: Tables were not created${NC}"
    echo -e "${YELLOW}Docker logs:${NC}"
    docker logs test-mysql
    docker stop test-mysql > /dev/null
    docker rm test-mysql > /dev/null
    exit 1
fi

# Cleanup
echo "  Cleaning up test container..."
docker stop test-mysql > /dev/null
docker rm test-mysql > /dev/null
echo ""

# Step 3: Login to ECR
echo -e "${YELLOW}[3/7] Logging into AWS ECR...${NC}"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO
echo -e "${GREEN}✓ Logged in to ECR${NC}"
echo ""

# Step 4: Tag Image
echo -e "${YELLOW}[4/7] Tagging Image...${NC}"
docker tag ${IMAGE_NAME}:latest ${ECR_REPO}:latest
echo -e "${GREEN}✓ Image tagged: ${ECR_REPO}:latest${NC}"
echo ""

# Step 5: Push to ECR
echo -e "${YELLOW}[5/7] Pushing Image to ECR...${NC}"
docker push ${ECR_REPO}:latest
echo -e "${GREEN}✓ Image pushed to ECR${NC}"
echo ""

# Step 6: Update MySQL Service
echo -e "${YELLOW}[6/7] Updating ECS MySQL Service...${NC}"
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service mysql-service \
    --force-new-deployment \
    --region $REGION > /dev/null

echo -e "${GREEN}✓ MySQL service update initiated${NC}"
echo -e "${CYAN}  Waiting for service to stabilize (this may take 2-3 minutes)...${NC}"

aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services mysql-service \
    --region $REGION

echo -e "${GREEN}✓ MySQL service is stable${NC}"
echo ""

# Step 7: Update Backend Service
echo -e "${YELLOW}[7/7] Updating ECS Backend Service...${NC}"
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service backend-service \
    --force-new-deployment \
    --region $REGION > /dev/null

echo -e "${GREEN}✓ Backend service update initiated${NC}"
echo ""

# Summary
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Deployment Summary${NC}"
echo -e "${CYAN}================================================${NC}"
echo -e "${GREEN}✓ Custom MySQL image built and pushed to ECR${NC}"
echo -e "${GREEN}✓ ECS services updated${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Wait 2-3 minutes for services to fully deploy"
echo ""
echo "2. Check service status:"
echo "   aws ecs describe-services --cluster $CLUSTER_NAME --services mysql-service backend-service --region $REGION"
echo ""
echo "3. Test the API endpoints:"
echo "   curl http://your-alb-dns/api/employees"
echo "   curl http://your-alb-dns/api/jobs"
echo ""
echo "4. View logs if needed:"
echo "   aws logs tail /ecs/mysql-task --follow --region $REGION"
echo "   aws logs tail /ecs/backend-task --follow --region $REGION"
echo ""
echo -e "${CYAN}================================================${NC}"

# Get ALB DNS
echo -e "${CYAN}Fetching Load Balancer DNS...${NC}"
ALB_DNS=$(aws elbv2 describe-load-balancers --region $REGION --query 'LoadBalancers[0].DNSName' --output text 2>&1)
if [ $? -eq 0 ] && [ ! -z "$ALB_DNS" ]; then
    echo -e "${GREEN}Your Application URL: http://$ALB_DNS${NC}"
else
    echo -e "${YELLOW}Could not fetch Load Balancer DNS automatically${NC}"
fi
echo ""
