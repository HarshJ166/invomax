# Create a simple placeholder icon for Windows build
# This creates a basic ICO file to allow the build to proceed

$buildDir = Join-Path $PSScriptRoot "..\build"
$iconPath = Join-Path $buildDir "icon.ico"

# Check if icon already exists
if (Test-Path $iconPath) {
    Write-Host "✓ Icon already exists at: $iconPath" -ForegroundColor Green
    exit 0
}

# Create build directory if it doesn't exist
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

# Download a placeholder icon or create a simple one
Write-Host "Creating placeholder icon..." -ForegroundColor Yellow

# Use the generated PNG from .gemini folder if available
$geminiDir = "C:\Users\Harsh Jajal\.gemini\antigravity\brain"
$pngIcon = Get-ChildItem -Path $geminiDir -Recurse -Filter "invoice_app_icon*.png" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pngIcon) {
    Write-Host "Found generated icon: $($pngIcon.FullName)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To convert PNG to ICO:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://convertio.co/png-ico/" -ForegroundColor Cyan
    Write-Host "2. Upload: $($pngIcon.FullName)" -ForegroundColor Cyan
    Write-Host "3. Download and save to: $iconPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use ImageMagick (if installed):" -ForegroundColor Yellow
    Write-Host "magick convert `"$($pngIcon.FullName)`" -define icon:auto-resize=256,128,64,48,32,16 `"$iconPath`"" -ForegroundColor Cyan
} else {
    Write-Host "No PNG icon found in .gemini folder" -ForegroundColor Red
    Write-Host "Please add icon.ico manually to: $iconPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For now, creating a minimal placeholder ICO file..." -ForegroundColor Yellow

# Create a minimal valid ICO file (16x16 black square)
$icoBytes = @(
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x68, 0x04,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
) + (@(0x3B, 0x82, 0xF6, 0xFF) * 256) # Blue color

[System.IO.File]::WriteAllBytes($iconPath, $icoBytes)

Write-Host "✓ Created placeholder icon at: $iconPath" -ForegroundColor Green
Write-Host "⚠ Replace this with a proper icon before final distribution!" -ForegroundColor Yellow
