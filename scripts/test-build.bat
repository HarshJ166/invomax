@echo off
title Invoice Generator - Test Build
color 0B

echo.
echo ========================================
echo Invoice Generator - Build Tester
echo ========================================
echo.

set DIST_DIR=%~dp0..\dist
set UNPACKED_DIR=%DIST_DIR%\win-unpacked
set EXE_PATH=%UNPACKED_DIR%\Invoice Generator.exe

echo Checking build files...
echo.

if not exist "%DIST_DIR%" (
    echo [ERROR] Distribution folder not found!
    echo.
    echo Please build the application first:
    echo   yarn build
    echo   cd electron-app
    echo   yarn build:win
    echo.
    pause
    exit /b 1
)

if not exist "%UNPACKED_DIR%" (
    echo [ERROR] Unpacked build not found!
    echo.
    echo Please build the application first:
    echo   cd electron-app
    echo   yarn build:win
    echo.
    pause
    exit /b 1
)

if not exist "%EXE_PATH%" (
    echo [ERROR] Application executable not found!
    echo Expected: %EXE_PATH%
    echo.
    pause
    exit /b 1
)

echo [OK] Build files found
echo.
echo Build location: %UNPACKED_DIR%
echo Executable: Invoice Generator.exe
echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.
echo The application will start in a moment.
echo.
echo IMPORTANT: 
echo - A separate terminal will open showing live logs
echo - Keep both windows open to monitor the application
echo - Press Ctrl+C in the log window to stop monitoring
echo.
echo Starting log monitor in 3 seconds...
timeout /t 3 >nul

echo.
echo [1/2] Starting log monitor...

start "Invoice Generator - Live Logs" cmd /k "cd /d %~dp0.. && yarn logs:monitor"

timeout /t 2 >nul

echo [2/2] Starting application...
echo.

cd /d "%UNPACKED_DIR%"
start "" "Invoice Generator.exe"

echo.
echo ========================================
echo Application Started!
echo ========================================
echo.
echo Two windows should now be open:
echo 1. Invoice Generator application
echo 2. Live log monitor
echo.
echo Check the log window for any errors or warnings.
echo.
echo Press any key to close this window...
pause >nul
