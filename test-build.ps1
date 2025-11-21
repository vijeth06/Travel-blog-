# Test Production Build Locally

Write-Host "Testing Production Build Configuration" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Clean previous builds
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "frontend\build") {
    Remove-Item -Recurse -Force "frontend\build"
    Write-Host "✓ Removed old build folder`n" -ForegroundColor Green
}

# Step 2: Build frontend
Write-Host "Step 2: Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..
Write-Host "✓ Frontend built successfully`n" -ForegroundColor Green

# Step 3: Check if build uses dynamic API URL
Write-Host "Step 3: Checking build configuration..." -ForegroundColor Yellow
$mainJs = Get-ChildItem -Path "frontend\build\static\js\main*.js" -File | Select-Object -First 1
if ($mainJs) {
    $content = Get-Content $mainJs.FullName -Raw
    if ($content -match "localhost:5000") {
        Write-Host "✗ WARNING: Build still contains 'localhost:5000' hardcoded!" -ForegroundColor Red
        Write-Host "  This means old cached files are being used." -ForegroundColor Red
    } else {
        Write-Host "✓ Build does not contain hardcoded localhost:5000`n" -ForegroundColor Green
    }
}

# Step 4: Start backend
Write-Host "Step 4: Starting backend server..." -ForegroundColor Yellow
Write-Host "Run in a separate terminal:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm start`n" -ForegroundColor White

# Step 5: Test in browser
Write-Host "Step 5: Open browser and test:" -ForegroundColor Yellow
Write-Host "  http://localhost:5000" -ForegroundColor White
Write-Host "  Check browser console - should NOT see ':5000/api' errors`n" -ForegroundColor White

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next: Check Render Dashboard" -ForegroundColor Cyan
Write-Host "  1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "  2. Find service: travel-blog-na4y" -ForegroundColor White
Write-Host "  3. Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor White
Write-Host "  4. Wait ~5-10 minutes for rebuild" -ForegroundColor White
Write-Host "  5. Visit: https://travel-blog-na4y.onrender.com" -ForegroundColor White
Write-Host "  6. Hard refresh: Ctrl+Shift+R" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
