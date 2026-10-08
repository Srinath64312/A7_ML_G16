@echo off
echo =========================================================================
echo    Personalized AI Tutor - State Level ML Project Expo 2026 Launcher
echo =========================================================================
echo.

echo [1/3] Checking Python environment...
python --version
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying Backend Dependencies & Tests...
python -m pytest backend/tests -q
if errorlevel 1 (
    echo Warning: Some tests had issues, starting server anyway...
)

echo.
echo [3/3] Starting Unified AI Tutor Platform on http://localhost:5000 ...
echo Press Ctrl+C to terminate.
echo.
python run.py

pause
