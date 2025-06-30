# 🐛 Kangtani.ai Debugging Guide

This guide provides comprehensive debugging information for the Kangtani.ai agricultural chatbot application.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Debugging](#backend-debugging)
3. [Frontend Debugging](#frontend-debugging)
4. [Common Issues](#common-issues)
5. [Google Colab Setup](#google-colab-setup)
6. [Monitoring Tools](#monitoring-tools)

## 🚀 Quick Start

### Option 1: Using Debug Runner (Recommended)
```bash
# Run the comprehensive debug runner
python run_debug.py
```

### Option 2: Manual Setup
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Start backend with debug logging
python main.py

# In another terminal, start frontend
cd frontend
npm run dev
```

## 🔧 Backend Debugging

### Enhanced Logging Features

The backend now includes comprehensive logging:

- **Request/Response Logging**: Every request is logged with unique ID
- **Performance Monitoring**: Processing time for each request
- **Error Tracking**: Detailed error messages with stack traces
- **System Monitoring**: CPU, memory, and disk usage

### Debug Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /` | Root endpoint | `http://localhost:8000/` |
| `GET /health` | Health check | `http://localhost:8000/health` |
| `GET /debug` | System debug info | `http://localhost:8000/debug` |
| `POST /chat` | Chat endpoint | `http://localhost:8000/chat` |

### Testing Backend

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the best crop for beginners?"}'

# Test debug endpoint
curl http://localhost:8000/debug
```

### Backend Log Files

- `backend.log`: Main application logs
- `debug.log`: Debug runner logs

## 🎨 Frontend Debugging

### Enhanced Debug Features

The frontend now includes:

- **Connection Status**: Real-time backend connection monitoring
- **Debug Panel**: Toggle to show detailed debug information
- **Error Tracking**: Detailed error messages with retry logic
- **Request/Response Logging**: Console logging for all API calls

### Debug Panel

Click the settings icon (⚙️) in the chat header to toggle the debug panel, which shows:

- Backend URL
- Connection status
- Debug mode status
- Last error message
- Test connection button

### Console Debugging

Open browser developer tools (F12) to see detailed logs:

```javascript
// Debug logs are prefixed with [Kangtani Debug]
[Kangtani Debug] Sending message: What's the best crop for beginners?
[Kangtani Debug] Response received in 245ms
[Kangtani Debug] Response data: {response: "...", request_id: "...", processing_time: 0.245}
```

### Environment Variables

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NODE_ENV=development
```

## ❗ Common Issues

### 1. "Failed to Fetch" Error

**Symptoms**: Frontend shows "failed to fetch" when sending messages

**Causes & Solutions**:

#### A. Backend Not Running
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it
cd backend
python main.py
```

#### B. CORS Issues
```python
# Backend CORS is already configured for debugging
allow_origins=["*"]  # Allows all origins
```

#### C. Wrong Backend URL
```javascript
// Check frontend configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
```

#### D. Port Already in Use
```bash
# Check what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Kill the process or use different port
```

### 2. Backend Won't Start

**Symptoms**: Error when starting backend server

**Solutions**:

#### A. Missing Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### B. Port Already in Use
```bash
# Use different port
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

#### C. Permission Issues
```bash
# Run with admin privileges (Windows)
# Or check file permissions (Linux/Mac)
```

### 3. Slow Response Times

**Symptoms**: Chat responses take too long

**Solutions**:

#### A. Check System Resources
```bash
# Monitor CPU and memory
python -c "import psutil; print(f'CPU: {psutil.cpu_percent()}%, Memory: {psutil.virtual_memory().percent}%')"
```

#### B. Check Network Latency
```bash
# Test backend response time
curl -w "@curl-format.txt" http://localhost:8000/health
```

#### C. Optimize Ollama
```bash
# Use smaller model for faster responses
ollama pull gemma:2b
```

### 4. Frontend Connection Issues

**Symptoms**: Frontend can't connect to backend

**Solutions**:

#### A. Check Network Configuration
```bash
# Test if backend is reachable
ping localhost
telnet localhost 8000
```

#### B. Check Firewall
```bash
# Allow port 8000 through firewall
# Windows: Windows Defender Firewall
# Linux: ufw allow 8000
```

#### C. Use Different Backend URL
```javascript
// If backend is on different machine
const BACKEND_URL = "http://192.168.1.100:8000"
```

## 🌐 Google Colab Setup

### Quick Setup

1. **Upload the notebook**: `run_on_colab.ipynb`
2. **Run all cells**: The notebook will automatically:
   - Install dependencies
   - Start backend server
   - Expose via ngrok
   - Provide public URL

### Manual Setup

```python
# Install dependencies
!pip install fastapi uvicorn httpx pydantic python-multipart psutil pyngrok

# Start backend
import subprocess
server_process = subprocess.Popen([
    "python", "-m", "uvicorn", "main:app", 
    "--host", "0.0.0.0", "--port", "8000"
])

# Expose with ngrok
from pyngrok import ngrok
public_url = ngrok.connect(8000)
print(f"Public URL: {public_url}")
```

### Colab Limitations

- **No GPU**: Ollama runs on CPU only
- **Limited RAM**: Use smaller models
- **Session Timeout**: Notebooks timeout after inactivity
- **No Persistence**: Data is lost when session ends

## 📊 Monitoring Tools

### Built-in Monitoring

The debug runner includes real-time monitoring:

```bash
python run_debug.py
```

This provides:
- System resource monitoring
- API health checks
- Request/response logging
- Interactive chat interface

### External Monitoring

#### A. System Resources
```bash
# CPU and Memory
htop
top
```

#### B. Network
```bash
# Port monitoring
netstat -tulpn | grep :8000

# Network traffic
iftop
```

#### C. Logs
```bash
# Real-time log monitoring
tail -f backend.log
tail -f debug.log
```

### Performance Metrics

Monitor these key metrics:

- **Response Time**: Should be < 5 seconds
- **CPU Usage**: Should be < 80%
- **Memory Usage**: Should be < 80%
- **Error Rate**: Should be < 1%

## 🔍 Advanced Debugging

### Debug Mode

Enable debug mode in frontend:

```javascript
const DEBUG_MODE = true;  // Always enable for debugging
```

### Request Tracing

Each request gets a unique ID for tracing:

```javascript
// Frontend logs request ID
[Kangtani Debug] Request ID: abc123-def456

// Backend logs same ID
Request ID: abc123-def456 - POST /chat
```

### Error Recovery

The frontend includes automatic retry logic:

```javascript
// Retry failed requests up to 2 times
sendMessageWithRetry(message, 2);
```

### Health Checks

Regular health checks ensure system stability:

```bash
# Manual health check
curl http://localhost:8000/health

# Expected response
{
  "status": "healthy",
  "ollama": "connected",
  "timestamp": "2024-01-01T12:00:00",
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2
  }
}
```

## 📞 Getting Help

### Debug Information to Collect

When reporting issues, include:

1. **Backend logs**: `backend.log` and `debug.log`
2. **Frontend console logs**: Browser developer tools
3. **System information**: OS, Python version, Node version
4. **Error messages**: Exact error text
5. **Steps to reproduce**: Detailed steps

### Common Debug Commands

```bash
# Check backend status
curl http://localhost:8000/health

# Check system resources
python -c "import psutil; print(f'CPU: {psutil.cpu_percent()}%, Memory: {psutil.virtual_memory().percent}%')"

# Check network connectivity
ping localhost
telnet localhost 8000

# Check logs
tail -f backend.log
tail -f debug.log

# Test API endpoints
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message": "test"}'
```

---

**Remember**: The debug runner (`python run_debug.py`) is the easiest way to get started with comprehensive debugging and monitoring! 