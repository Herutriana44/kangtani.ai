@echo off
REM Kangtani.ai Backend API Test Script for Windows
REM This script tests all API endpoints using curl

setlocal enabledelayedexpansion

REM Configuration
set BASE_URL=http://localhost:8000
set TIMEOUT=30

echo 🌾 Kangtani.ai Backend API Test Script
echo ==========================================

REM Check if curl is available
curl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: curl is not installed or not in PATH
    echo Please install curl or add it to your PATH
    pause
    exit /b 1
)

REM Function to test endpoint
:test_endpoint
set method=%1
set endpoint=%2
set data=%3
set description=%4

echo.
echo ℹ️ Testing: %description%
echo Endpoint: %method% %BASE_URL%%endpoint%
if not "%data%"=="" echo Data: %data%

REM Make request
if "%method%"=="GET" (
    for /f "tokens=*" %%i in ('curl -s -w "%%{http_code}\n%%{time_total}" --max-time %TIMEOUT% "%BASE_URL%%endpoint%" 2^>nul') do (
        set response=%%i
    )
) else (
    for /f "tokens=*" %%i in ('curl -s -w "%%{http_code}\n%%{time_total}" --max-time %TIMEOUT% -H "Content-Type: application/json" -d "%data%" "%BASE_URL%%endpoint%" 2^>nul') do (
        set response=%%i
    )
)

REM Parse response (simplified for batch)
echo Response: %response%
echo ---
goto :eof

REM Check if backend is running
:check_backend
echo.
echo ℹ️ Checking if backend is running...
curl -s --max-time 5 "%BASE_URL%/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Backend is not running at %BASE_URL%
    echo ℹ️ Start the backend with: cd backend ^&^& python main.py
    pause
    exit /b 1
) else (
    echo ✅ Backend is running at %BASE_URL%
)
goto :eof

REM Test health endpoints
:test_health
echo.
echo ⚠️ === Health ^& Status Endpoints ===
call :test_endpoint GET / "" "Root endpoint"
call :test_endpoint GET /health "" "Health check"
call :test_endpoint GET /debug "" "Debug information"
goto :eof

REM Test chat endpoints
:test_chat
echo.
echo ⚠️ === Chat API Endpoints ===
call :test_endpoint POST /chat "{\"message\": \"What is the best crop for beginners?\"}" "Basic chat"
call :test_endpoint POST /chat "{\"message\": \"How can I control pests organically?\"}" "Organic pest control"
call :test_endpoint POST /chat "{\"message\": \"What are the best practices for soil health?\"}" "Soil health"
call :test_endpoint POST /chat "{\"message\": \"What irrigation system is best for tomatoes?\"}" "Irrigation systems"
goto :eof

REM Test error handling
:test_errors
echo.
echo ⚠️ === Error Handling Tests ===
call :test_endpoint POST /chat "{\"message\": \"\"}" "Empty message"
call :test_endpoint POST /chat "{\"other_field\": \"test\"}" "Missing message field"
call :test_endpoint GET /nonexistent "" "Non-existent endpoint"
goto :eof

REM Test performance
:test_performance
echo.
echo ⚠️ === Performance Tests ===
call :test_endpoint POST /chat "{\"message\": \"Performance test message 1\"}" "Performance test 1"
call :test_endpoint POST /chat "{\"message\": \"Performance test message 2\"}" "Performance test 2"
call :test_endpoint POST /chat "{\"message\": \"Performance test message 3\"}" "Performance test 3"
goto :eof

REM Main execution
call :check_backend
if errorlevel 1 goto :end

call :test_health
call :test_chat
call :test_errors
call :test_performance

echo.
echo 🎉 All tests completed!
echo ℹ️ Check the output above for any errors or issues.

:end
pause 