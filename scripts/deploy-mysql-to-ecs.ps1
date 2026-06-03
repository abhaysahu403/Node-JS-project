# PowerShell Script to Deploy Custom MySQL Image to AWS ECS
# Cloud Nexus HR Platform - MySQL Database Fix

param(
    [string]$Region = "us-east-1",
    [string]$AccountId = "039612843833",
    [string]$ClusterName = "cloud-nexus-hr-cluster",
    [switch]$SkipBuild,
    [switch]$SkipTest
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Cloud Nexus HR - MySQL ECS Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$EcrRepo = "$AccountId.dkr.ecr.$Region.amazonaws.com/cloud-nexus-mysql"
$ImageName = "cloud-nexus-mysql"
$DatabaseDir = ".\database"

# Step 1: Build MySQL Image
if (-not $SkipBuild) {
    Write-Host "[1/7] Building Custom MySQL Image..." -ForegroundColor Yellow
    
    if (-not (Test-Path $DatabaseDir)) {
        Write-Host "ERROR: Database directory not found at $DatabaseDir" -ForegroundColor Red
        exit 1
    }
    
    Push-Location $DatabaseDir
    docker build -t $ImageName .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✓ Image built successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[1/7] Skipping build (using existing image)" -ForegroundColor Gray
    Write-Host ""
}

# Step 2: Test Image Locally (Optional)
if (-not $SkipTest) {
    Write-Host "[2/7] Testing Image Locally..." -ForegroundColor Yellow
    
    # Start test container
    Write-Host "  Starting test container..."
    docker run -d `
        --name test-mysql `
        -e MYSQL_ROOT_PASSWORD=testpassword `
        -e MYSQL_DATABASE=cloudnexushr `
        -p 3308:3306 `
        $ImageName | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to start test container" -ForegroundColor Red
        exit 1
    }
    
    # Wait for MySQL to initialize
    Write-Host "  Waiting for MySQL to initialize (30 seconds)..."
    Start-Sleep -Seconds 30
    
    # Check tables
    Write-Host "  Verifying tables exist..."
    $tables = docker exec test-mysql mysql -uroot -ptestpassword -e "USE cloudnexushr; SHOW TABLES;" 2>&1
    
    if ($tables -match "employees" -and $tables -match "jobs" -and $tables -match "applications") {
        Write-Host "✓ Tables created successfully" -ForegroundColor Green
        
        # Check data
        $count = docker exec test-mysql mysql -uroot -ptestpassword -e "SELECT COUNT(*) FROM cloudnexushr.employees;" 2>&1
        if ($count -match "10") {
            Write-Host "✓ Sample data loaded (10 employees)" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Sample data might not be loaded correctly" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ERROR: Tables were not created" -ForegroundColor Red
        Write-Host "Docker logs:" -ForegroundColor Yellow
        docker logs test-mysql
        docker stop test-mysql | Out-Null
        docker rm test-mysql | Out-Null
        exit 1
    }
    
    # Cleanup
    Write-Host "  Cleaning up test container..."
    docker stop test-mysql | Out-Null
    docker rm test-mysql | Out-Null
    Write-Host ""
} else {
    Write-Host "[2/7] Skipping local test" -ForegroundColor Gray
    Write-Host ""
}

# Step 3: Login to ECR
Write-Host "[3/7] Logging into AWS ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrRepo 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: ECR login failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Logged in to ECR" -ForegroundColor Green
Write-Host ""

# Step 4: Tag Image
Write-Host "[4/7] Tagging Image..." -ForegroundColor Yellow
docker tag ${ImageName}:latest ${EcrRepo}:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker tag failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Image tagged: ${EcrRepo}:latest" -ForegroundColor Green
Write-Host ""

# Step 5: Push to ECR
Write-Host "[5/7] Pushing Image to ECR..." -ForegroundColor Yellow
docker push ${EcrRepo}:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker push failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Image pushed to ECR" -ForegroundColor Green
Write-Host ""

# Step 6: Update MySQL Service
Write-Host "[6/7] Updating ECS MySQL Service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ClusterName `
    --service mysql-service `
    --force-new-deployment `
    --region $Region | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to update mysql-service" -ForegroundColor Red
    exit 1
}
Write-Host "✓ MySQL service update initiated" -ForegroundColor Green
Write-Host "  Waiting for service to stabilize (this may take 2-3 minutes)..." -ForegroundColor Cyan

aws ecs wait services-stable `
    --cluster $ClusterName `
    --services mysql-service `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MySQL service is stable" -ForegroundColor Green
} else {
    Write-Host "WARNING: Service did not stabilize in time (may still be deploying)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Update Backend Service
Write-Host "[7/7] Updating ECS Backend Service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ClusterName `
    --service backend-service `
    --force-new-deployment `
    --region $Region | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Failed to update backend-service" -ForegroundColor Yellow
    Write-Host "  You may need to update it manually" -ForegroundColor Yellow
} else {
    Write-Host "✓ Backend service update initiated" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✓ Custom MySQL image built and pushed to ECR" -ForegroundColor Green
Write-Host "✓ ECS services updated" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for services to fully deploy"
Write-Host "2. Check service status:"
Write-Host "   aws ecs describe-services --cluster $ClusterName --services mysql-service backend-service --region $Region"
Write-Host ""
Write-Host "3. Test the API endpoints:"
Write-Host "   curl http://your-alb-dns/api/employees"
Write-Host "   curl http://your-alb-dns/api/jobs"
Write-Host ""
Write-Host "4. View logs if needed:"
Write-Host "   aws logs tail /ecs/mysql-task --follow --region $Region"
Write-Host "   aws logs tail /ecs/backend-task --follow --region $Region"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

# Get ALB DNS
Write-Host "Fetching Load Balancer DNS..." -ForegroundColor Cyan
$AlbDns = aws elbv2 describe-load-balancers --region $Region --query 'LoadBalancers[0].DNSName' --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $AlbDns) {
    Write-Host "Your Application URL: http://$AlbDns" -ForegroundColor Green
} else {
    Write-Host "Could not fetch Load Balancer DNS automatically" -ForegroundColor Yellow
}
Write-Host ""
