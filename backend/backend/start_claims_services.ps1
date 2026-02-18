# ==================================
# START CLAIMS SERVICES
# ==================================
# PowerShell script to start all required services for claims workflow

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Starting Claims Services         " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please run setup_claims.ps1 first" -ForegroundColor Red
    exit 1
}

# Check if Redis is running
Write-Host "🔍 Checking Redis..." -ForegroundColor Cyan
$redisCheck = redis-cli ping 2>$null
if ($redisCheck -ne "PONG") {
    Write-Host "⚠️  Redis is not running. Starting Redis..." -ForegroundColor Yellow
    Start-Process "redis-server" -WindowStyle Normal
    Start-Sleep -Seconds 2
    $redisCheck = redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "✅ Redis started successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Redis. Please start it manually." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Redis is already running" -ForegroundColor Green
}
Write-Host ""

# Start Celery worker in new terminal
Write-Host "🚀 Starting Celery worker..." -ForegroundColor Cyan
$celeryCmd = "celery -A celery_app worker --loglevel=info --pool=solo"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $celeryCmd" -WindowStyle Normal
Write-Host "✅ Celery worker started in new window" -ForegroundColor Green
Write-Host ""

# Wait a bit for Celery to start
Start-Sleep -Seconds 3

# Start FastAPI server in new terminal
Write-Host "🚀 Starting FastAPI server..." -ForegroundColor Cyan
$uvicornCmd = "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $uvicornCmd" -WindowStyle Normal
Write-Host "✅ FastAPI server started in new window" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Green
Write-Host " All Services Started! 🎉         " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  • Redis Server        ✓" -ForegroundColor Green
Write-Host "  • Celery Worker       ✓" -ForegroundColor Green
Write-Host "  • FastAPI Server      ✓" -ForegroundColor Green
Write-Host ""
Write-Host "API is available at: http://localhost:8000" -ForegroundColor White
Write-Host "API docs at: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (services will continue running)" -ForegroundColor Yellow
Write-Host "To stop services, close the respective terminal windows" -ForegroundColor Yellow

# Keep script running
while ($true) {
    Start-Sleep -Seconds 60
}
