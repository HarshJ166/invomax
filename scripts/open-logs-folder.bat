@echo off
title Invoice Generator - Open Logs Folder
color 0A

echo.
echo ========================================
echo Invoice Generator - Open Logs Folder
echo ========================================
echo.

set LOG_DIR=%USERPROFILE%\InvoiceGenerator\logs

if not exist "%LOG_DIR%" (
    echo Creating logs directory...
    mkdir "%LOG_DIR%" 2>nul
    if errorlevel 1 (
        echo [ERROR] Failed to create logs directory.
        pause
        exit /b 1
    )
    echo Logs directory created: %LOG_DIR%
    echo.
)

echo Opening logs folder...
echo Location: %LOG_DIR%
echo.

explorer "%LOG_DIR%"

echo.
echo Logs folder opened in Windows Explorer.
echo.
timeout /t 2 >nul
