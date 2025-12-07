@echo off
title Invoice Generator - Log Viewer
color 0A

echo.
echo ========================================
echo Invoice Generator - Log Viewer
echo ========================================
echo.

set LOG_DIR=%USERPROFILE%\InvoiceGenerator\logs

if not exist "%LOG_DIR%" (
    echo [ERROR] No logs directory found at: %LOG_DIR%
    echo.
    echo The application may not have been run yet.
    echo Logs will be created when you run the application.
    echo.
    pause
    exit /b 0
)

echo Log Directory: %LOG_DIR%
echo.
echo Available log files:
echo.

dir /b /o-d "%LOG_DIR%\*.log" 2>nul

if errorlevel 1 (
    echo [ERROR] No log files found.
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Latest Log File Contents:
echo ========================================
echo.

for /f "delims=" %%i in ('dir /b /o-d "%LOG_DIR%\*.log" 2^>nul') do (
    set LATEST_LOG=%%i
    goto :display
)

:display
set LOG_FILE=%LOG_DIR%\%LATEST_LOG%
echo File: %LATEST_LOG%
echo.

type "%LOG_FILE%"

echo.
echo ========================================
echo End of Log File
echo ========================================
echo.
echo Press any key to exit...
pause >nul
