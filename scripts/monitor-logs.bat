@echo off
echo.
echo ========================================
echo Invoice Generator - Live Log Monitor
echo ========================================
echo.

set LOG_DIR=%USERPROFILE%\InvoiceGenerator\logs

if not exist "%LOG_DIR%" (
    echo No logs directory found at: %LOG_DIR%
    echo.
    echo The application may not have been run yet.
    echo Logs will be created when you run the application.
    echo.
    pause
    exit /b 0
)

for /f "delims=" %%i in ('dir /b /o-d "%LOG_DIR%\*.log" 2^>nul') do (
    set LATEST_LOG=%%i
    goto :found
)

:notfound
echo No log files found in: %LOG_DIR%
echo.
echo The application may not have been run yet.
echo.
pause
exit /b 0

:found
set LOG_FILE=%LOG_DIR%\%LATEST_LOG%

echo Monitoring log file: %LATEST_LOG%
echo Location: %LOG_FILE%
echo.
echo ========================================
echo Press Ctrl+C to stop monitoring
echo ========================================
echo.

powershell -Command "Get-Content '%LOG_FILE%' -Wait -Tail 50"
