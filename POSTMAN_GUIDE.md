# 📮 Postman Collection Guide - Kangtani.ai Backend

This guide explains how to use the Postman collection for testing and debugging the Kangtani.ai backend API.

## 📋 Table of Contents

1. [Setup](#setup)
2. [Importing Collections](#importing-collections)
3. [Environment Configuration](#environment-configuration)
4. [API Endpoints](#api-endpoints)
5. [Testing Scenarios](#testing-scenarios)
6. [Debugging with Postman](#debugging-with-postman)
7. [Automated Testing](#automated-testing)

## 🚀 Setup

### Prerequisites
- [Postman](https://www.postman.com/downloads/) installed
- Kangtani.ai backend running on `http://localhost:8000`
- Basic knowledge of REST APIs

### Files Required
- `Kangtani_Backend_API.postman_collection.json` - Main API collection
- `Kangtani_Backend_Environment.postman_environment.json` - Environment variables

## 📥 Importing Collections

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select **Upload Files**
4. Choose `Kangtani_Backend_API.postman_collection.json`
5. Click **Import**

### Step 2: Import Environment
1. Click **Import** again
2. Select **Upload Files**
3. Choose `Kangtani_Backend_Environment.postman_environment.json`
4. Click **Import**

### Step 3: Select Environment
1. In the top-right corner, select **"Kangtani Backend Environment"**
2. Verify `base_url` is set to `http://localhost:8000`

## ⚙️ Environment Configuration

### Default Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8000` | Backend server URL |
| `api_version` | `v1` | API version |
| `client_version` | `1.0.0` | Client version |
| `timestamp` | `{{$timestamp}}` | Current timestamp |
| `health_status` | (auto-filled) | Health check status |
| `cpu_usage` | (auto-filled) | CPU usage percentage |
| `memory_usage` | (auto-filled) | Memory usage percentage |
| `last_request_id` | (auto-filled) | Last request ID |
| `last_processing_time` | (auto-filled) | Last processing time |

### Environment Switching
You can create multiple environments for different setups:

#### Local Development
```json
{
  "base_url": "http://localhost:8000",
  "environment": "local"
}
```

#### Google Colab (with ngrok)
```json
{
  "base_url": "https://abc123.ngrok.io",
  "environment": "colab"
}
```

#### Production
```json
{
  "base_url": "https://api.kangtani.ai",
  "environment": "production"
}
```

## 🔗 API Endpoints

### 1. Health & Status Endpoints

#### GET `/` - Root Endpoint
```bash
GET {{base_url}}/
```
**Purpose**: Get basic API information
**Response**:
```json
{
  "message": "Kangtani.ai Backend API",
  "status": "running",
  "timestamp": "2024-01-01T12:00:00",
  "version": "1.0.0"
}
```

#### GET `/health` - Health Check
```bash
GET {{base_url}}/health
```
**Purpose**: Check backend health and system resources
**Response**:
```json
{
  "status": "healthy",
  "ollama": "connected",
  "timestamp": "2024-01-01T12:00:00",
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "memory_available": 8.5
  }
}
```

#### GET `/debug` - Debug Information
```bash
GET {{base_url}}/debug
```
**Purpose**: Get detailed system debug information
**Response**:
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "system": {
    "platform": "Linux-5.4.0-x86_64",
    "python_version": "3.8.5",
    "cpu_count": 8,
    "cpu_percent": 25.5,
    "memory": {
      "total": 16,
      "available": 8.5,
      "percent": 45.2
    },
    "disk": {
      "total": 500,
      "free": 300,
      "percent": 40.0
    }
  }
}
```

### 2. Chat API Endpoints

#### POST `/chat` - Basic Chat
```bash
POST {{base_url}}/chat
Content-Type: application/json

{
  "message": "What's the best crop for beginners?"
}
```
**Purpose**: Send chat message to agricultural assistant
**Response**:
```json
{
  "response": "For beginners, I recommend tomatoes and peppers...",
  "status": "success",
  "request_id": "abc123-def456",
  "processing_time": 1.245
}
```

#### POST `/chat/file` - File Upload
```bash
POST {{base_url}}/chat/file
Content-Type: multipart/form-data

message: "Please analyze this document"
file: [upload file]
```
**Purpose**: Upload document for analysis

#### POST `/chat/audio` - Audio Upload
```bash
POST {{base_url}}/chat/audio
Content-Type: multipart/form-data

message: "Please transcribe this audio"
audio: [upload audio file]
```
**Purpose**: Upload audio for transcription and response

## 🧪 Testing Scenarios

### 1. Basic Functionality Tests

#### Test 1: Health Check
1. Run **Health Check** request
2. Verify status code is 200
3. Verify response contains health information
4. Check system resources are reasonable

#### Test 2: Basic Chat
1. Run **Basic Chat** request
2. Verify status code is 200
3. Verify response contains chat data
4. Check processing time is reasonable (< 30 seconds)

#### Test 3: Agricultural Questions
1. Run **Agricultural Question** request
2. Verify response is relevant to agriculture
3. Check response quality and completeness

### 2. Error Handling Tests

#### Test 4: Empty Message
1. Run **Empty Message** request
2. Verify graceful error handling
3. Check appropriate error response

#### Test 5: Invalid JSON
1. Run **Invalid JSON** request
2. Verify validation error handling
3. Check error message clarity

### 3. Performance Tests

#### Test 6: Response Time
1. Run **Performance Tests** requests
2. Verify response time < 5 seconds
3. Monitor processing time consistency

#### Test 7: Load Testing
1. Run **Load Test** multiple times
2. Verify consistent performance
3. Check for any degradation

## 🐛 Debugging with Postman

### 1. Console Logging
Postman automatically logs:
- Request details (URL, method, headers)
- Response status and time
- Test results
- Environment variables

### 2. Response Headers
Check these debug headers:
- `X-Processing-Time`: Server processing time
- `X-Request-ID`: Unique request identifier
- `Content-Type`: Response format

### 3. Test Scripts
Each request includes test scripts that:
- Validate response structure
- Check performance metrics
- Store variables for other tests
- Log debugging information

### 4. Environment Variables
Monitor these variables:
- `health_status`: Current backend health
- `cpu_usage`: System CPU usage
- `memory_usage`: System memory usage
- `last_request_id`: Last request identifier
- `last_processing_time`: Last processing time

## 🤖 Automated Testing

### 1. Collection Runner
1. Click **Runner** in Postman
2. Select **Kangtani Backend API** collection
3. Choose environment
4. Set iterations (e.g., 5)
5. Click **Start Run**

### 2. Newman CLI Testing
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Kangtani_Backend_API.postman_collection.json \
  -e Kangtani_Backend_Environment.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### 3. CI/CD Integration
```yaml
# GitHub Actions example
- name: API Tests
  run: |
    newman run Kangtani_Backend_API.postman_collection.json \
      -e Kangtani_Backend_Environment.postman_environment.json \
      --reporters cli,junit \
      --reporter-junit-export test-results.xml
```

## 📊 Monitoring and Metrics

### 1. Performance Metrics
- **Response Time**: Should be < 5 seconds
- **Processing Time**: Should be < 30 seconds
- **Success Rate**: Should be > 95%

### 2. System Metrics
- **CPU Usage**: Should be < 80%
- **Memory Usage**: Should be < 80%
- **Health Status**: Should be "healthy"

### 3. Error Tracking
- Monitor error rates
- Track error types
- Check error messages

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Refused
**Problem**: Cannot connect to backend
**Solution**:
- Verify backend is running: `python main.py`
- Check port 8000 is available
- Verify firewall settings

#### 2. CORS Errors
**Problem**: Frontend can't access API
**Solution**:
- Backend CORS is configured for debugging
- Check `allow_origins` in backend
- Verify request headers

#### 3. Slow Responses
**Problem**: API responses are slow
**Solution**:
- Check system resources
- Monitor Ollama performance
- Verify network connectivity

#### 4. Test Failures
**Problem**: Postman tests failing
**Solution**:
- Check backend logs
- Verify endpoint responses
- Update test expectations

### Debug Commands
```bash
# Check backend status
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Check logs
tail -f backend.log
```

## 📝 Best Practices

### 1. Testing Order
1. Start with health checks
2. Test basic functionality
3. Test error scenarios
4. Run performance tests
5. Test edge cases

### 2. Environment Management
- Use different environments for different stages
- Keep sensitive data in environment variables
- Document environment configurations

### 3. Test Data
- Use realistic agricultural questions
- Test various message lengths
- Include edge cases and error scenarios

### 4. Monitoring
- Run tests regularly
- Monitor performance trends
- Track error rates
- Document issues and solutions

---

**Note**: This Postman collection is designed for comprehensive testing and debugging of the Kangtani.ai backend. Use it to ensure your API is working correctly before deploying to production. 