@echo off
title Invoice Generator - Quick Start Guide
color 0E

:menu
cls
echo.
echo ========================================
echo   Invoice Generator - Quick Start
echo ========================================
echo.
echo What would you like to do?
echo.
echo   1. Build the application
echo   2. Test the build (unpacked)
echo   3. View logs
echo   4. Monitor logs (live)
echo   5. Open logs folder
echo   6. Install and test
echo   7. Clean rebuild
echo   8. Exit
echo.
echo ========================================
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto test
if "%choice%"=="3" goto viewlogs
if "%choice%"=="4" goto monitorlogs
if "%choice%"=="5" goto openlogs
if "%choice%"=="6" goto install
if "%choice%"=="7" goto clean
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:build
cls
echo.
echo ========================================
echo Building Application...
echo ========================================
echo.
cd /d "%~dp0.."
call yarn build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    goto menu
)
echo.
cd electron-app
call yarn build:win
if errorlevel 1 (
    echo.
    echo [ERROR] Electron build failed!
    pause
    goto menu
)
echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
pause
goto menu

:test
cls
echo.
echo ========================================
echo Testing Build...
echo ========================================
echo.
call "%~dp0test-build.bat"
goto menu

:viewlogs
cls
echo.
echo ========================================
echo Viewing Logs...
echo ========================================
echo.
call "%~dp0view-logs.bat"
goto menu

:monitorlogs
cls
echo.
echo ========================================
echo Monitoring Logs (Live)
echo ========================================
echo.
echo Press Ctrl+C to stop monitoring
echo.
cd /d "%~dp0.."
call yarn logs:monitor
pause
goto menu

:openlogs
cls
echo.
echo ========================================
echo Opening Logs Folder...
echo ========================================
echo.
call "%~dp0open-logs-folder.bat"
timeout /t 2 >nul
goto menu

:install
cls
echo.
echo ========================================
echo Install and Test
echo ========================================
echo.

set INSTALLER="%~dp0..\dist\Invoice Generator Setup 1.0.0.exe"

if not exist %INSTALLER% (
    echo [ERROR] Installer not found!
    echo.
    echo Please build the application first (Option 1)
    echo.
    pause
    goto menu
)

echo Installer found: %INSTALLER%
echo.
echo This will:
echo 1. Open the installer
echo 2. Start log monitoring
echo.
echo Please install the application and run it.
echo The log monitor will show all activity.
echo.
pause

start "Invoice Generator - Live Logs" cmd /k "cd /d %~dp0.. && yarn logs:monitor"
timeout /t 2 >nul
start "" %INSTALLER%

echo.
echo Installer launched!
echo Monitor the log window for any issues.
echo.
pause
goto menu

:clean
cls
echo.
echo ========================================
echo Clean Rebuild
echo ========================================
echo.
echo WARNING: This will delete:
echo - dist folder
echo - my-app/.next folder
echo - All build artifacts
echo.
set /p confirm="Are you sure? (Y/N): "

if /i not "%confirm%"=="Y" goto menu

echo.
echo Cleaning build artifacts...
cd /d "%~dp0.."

if exist "dist" (
    echo Removing dist...
    rmdir /s /q "dist"
)

if exist "my-app\.next" (
    echo Removing my-app/.next...
    rmdir /s /q "my-app\.next"
)

echo.
echo Clean complete!
echo.
echo Now building...
echo.

call yarn build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    goto menu
)

cd electron-app
call yarn build:win
if errorlevel 1 (
    echo.
    echo [ERROR] Electron build failed!
    pause
    goto menu
)

echo.
echo ========================================
echo Clean rebuild completed successfully!
echo ========================================
echo.
pause
goto menu

:end
cls
echo.
echo Thank you for using Invoice Generator!
echo.
timeout /t 2 >nul
exit /b 0
