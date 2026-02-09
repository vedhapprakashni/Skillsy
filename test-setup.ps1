# Quick Setup Verification Script for Skillsy
# Run this in PowerShell: .\test-setup.ps1

Write-Host "=== Skillsy Setup Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion) {
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version
if ($pythonVersion) {
    Write-Host "✅ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Frontend Dependencies
Write-Host "Checking Frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend dependencies not found. Run: cd frontend && npm install" -ForegroundColor Yellow
}

# Check Backend Dependencies
Write-Host "Checking Backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\venv") {
    Write-Host "✅ Backend virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend venv not found. Run: cd backend && python -m venv venv" -ForegroundColor Yellow
}

# Check Environment Files
Write-Host "Checking Environment files..." -ForegroundColor Yellow
if (Test-Path "frontend\.env.local") {
    Write-Host "✅ Frontend .env.local exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env.local not found" -ForegroundColor Yellow
}

if (Test-Path "backend\.env") {
    Write-Host "✅ Backend .env exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env not found (create it from the credentials provided)" -ForegroundColor Yellow
}

# Check Database Schema
Write-Host "Checking Database schema file..." -ForegroundColor Yellow
if (Test-Path "backend\database\schema.sql") {
    Write-Host "✅ Database schema.sql exists" -ForegroundColor Green
    Write-Host "   ⚠️  Remember to run this in Supabase SQL Editor!" -ForegroundColor Yellow
} else {
    Write-Host "❌ Database schema.sql not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Run database schema in Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Configure Google OAuth in Supabase Dashboard" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "4. Start backend: cd backend && uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "See TESTING.md for detailed instructions!" -ForegroundColor Cyan
