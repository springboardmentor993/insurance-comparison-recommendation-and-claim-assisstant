# ==================================
# INSURENZ CLAIMS WORKFLOW SETUP
# ==================================
# PowerShell script to setup claims workflow

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Insurenz Claims Workflow Setup  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env file and add your credentials!" -ForegroundColor Yellow
    Write-Host "   - AWS credentials for S3" -ForegroundColor Yellow
    Write-Host "   - SMTP credentials for email" -ForegroundColor Yellow
    Write-Host "   - Redis URL (if different from default)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after you've updated the .env file"
}

# Install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create database tables
Write-Host "🗄️  Creating database tables..." -ForegroundColor Cyan
python create_claims_tables_sqlite.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database tables" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database tables created" -ForegroundColor Green
Write-Host ""

# Check if Redis is running
Write-Host "🔍 Checking Redis connection..." -ForegroundColor Cyan
$redisCheck = redis-cli ping 2>$null
if ($redisCheck -eq "PONG") {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis is not running!" -ForegroundColor Yellow
    Write-Host "Please start Redis server:" -ForegroundColor Yellow
    Write-Host "  1. Install Redis: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    Write-Host "  2. Run: redis-server" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Green
Write-Host " Setup Complete! 🎉               " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start Redis server (if not running):" -ForegroundColor White
Write-Host "   redis-server" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Celery worker in a new terminal:" -ForegroundColor White
Write-Host "   celery -A celery_app worker --loglevel=info --pool=solo" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start FastAPI server:" -ForegroundColor White
Write-Host "   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use the start script:" -ForegroundColor White
Write-Host "   .\start_claims_services.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed documentation, see: CLAIMS_WORKFLOW_SETUP.md" -ForegroundColor Cyan
