# 🧪 API Testing Guide - Kangtani.ai Backend

Comprehensive testing tools and documentation for the Kangtani.ai backend API.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Postman Collection](#postman-collection)
3. [Command Line Testing](#command-line-testing)
4. [Automated Testing](#automated-testing)
5. [Debugging Tools](#debugging-tools)
6. [API Documentation](#api-documentation)

## 🚀 Quick Start

### Prerequisites
- Backend running on `http://localhost:8000`
- [Postman](https://www.postman.com/downloads/) (for GUI testing)
- `curl` (for command line testing)
- Python 3.8+ (for automated testing)

### Quick Test
```bash
# Test if backend is running
curl http://localhost:8000/health

# Test basic chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the best crop for beginners?"}'
```

## 📮 Postman Collection

### Files
- `Kangtani_Backend_API.postman_collection.json` - Main API collection
- `Kangtani_Backend_Environment.postman_environment.json` - Environment variables
- `POSTMAN_GUIDE.md` - Detailed Postman usage guide

### Import Instructions
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select both JSON files
4. Select environment: **"Kangtani Backend Environment"**

### Collection Structure
```
🌾 Kangtani Backend API
├── Health & Status
│   ├── Root Endpoint (GET /)
│   ├── Health Check (GET /health)
│   └── Debug Information (GET /debug)
├── Chat API
│   ├── Basic Chat (POST /chat)
│   ├── Agricultural Questions
│   ├── Long Message Test
│   └── Error Tests
├── File Upload
│   └── Upload Document (POST /chat/file)
├── Audio Upload
│   └── Upload Audio (POST /chat/audio)
├── Performance Tests
│   ├── Concurrent Requests
│   └── Load Testing
└── Error Handling
    ├── Invalid JSON
    └── Missing Fields
```

### Features
- ✅ **Automated Tests**: Each request includes validation tests
- ✅ **Environment Variables**: Dynamic URL and data management
- ✅ **Performance Monitoring**: Response time tracking
- ✅ **Error Handling**: Comprehensive error scenario testing
- ✅ **Debug Headers**: Request ID and processing time tracking

## 💻 Command Line Testing

### Shell Script (Linux/Mac)
```bash
# Make executable
chmod +x test_api.sh

# Run all tests
./test_api.sh

# Run specific tests
./test_api.sh --health-only
./test_api.sh --chat-only
./test_api.sh --errors-only
./test_api.sh --performance-only

# Test remote backend
./test_api.sh -u http://192.168.1.100:8000
```

### Batch Script (Windows)
```cmd
# Run all tests
test_api.bat
```

### Manual curl Commands

#### Health Checks
```bash
# Root endpoint
curl http://localhost:8000/

# Health check
curl http://localhost:8000/health

# Debug info
curl http://localhost:8000/debug
```

#### Chat API
```bash
# Basic chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the best crop for beginners?"}'

# Agricultural question
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I control pests organically?"}'

# Long message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a large farm with multiple crops including tomatoes, peppers, corn, and beans. The soil is clay-based and we get moderate rainfall. I am interested in sustainable farming practices and want to improve my yields while reducing chemical inputs. Can you provide comprehensive advice on crop rotation, organic fertilization, pest management, and irrigation systems that would work well for my situation?"}'
```

#### Error Testing
```bash
# Empty message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'

# Missing message field
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"other_field": "test"}'

# Invalid JSON
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "invalid_field": "should cause error"}'

# Non-existent endpoint
curl http://localhost:8000/nonexistent
```

## 🤖 Automated Testing

### Python Debug Runner
```bash
# Run comprehensive debug runner
python run_debug.py
```

Features:
- ✅ Dependency checking
- ✅ Backend startup and monitoring
- ✅ API endpoint testing
- ✅ Performance monitoring
- ✅ Interactive chat interface
- ✅ Real-time system resource tracking

### Newman CLI (Postman)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Kangtani_Backend_API.postman_collection.json \
  -e Kangtani_Backend_Environment.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json

# Run with custom environment
newman run Kangtani_Backend_API.postman_collection.json \
  --env-var base_url=http://192.168.1.100:8000
```

### CI/CD Integration
```yaml
# GitHub Actions example
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8
          
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          
      - name: Start backend
        run: |
          cd backend
          python main.py &
          sleep 10
          
      - name: Run API tests
        run: |
          chmod +x test_api.sh
          ./test_api.sh
          
      - name: Run Newman tests
        run: |
          npm install -g newman
          newman run Kangtani_Backend_API.postman_collection.json \
            -e Kangtani_Backend_Environment.postman_environment.json \
            --reporters cli,junit \
            --reporter-junit-export test-results.xml
```

## 🐛 Debugging Tools

### Built-in Debugging
- **Request ID Tracking**: Every request gets a unique ID
- **Processing Time**: Server-side processing time measurement
- **System Monitoring**: CPU, memory, and disk usage
- **Error Logging**: Detailed error messages with stack traces

### Debug Endpoints
```bash
# Get debug information
curl http://localhost:8000/debug

# Check health status
curl http://localhost:8000/health

# Monitor logs
tail -f backend.log
tail -f debug.log
```

### Debug Headers
Check these headers in responses:
- `X-Processing-Time`: Server processing time
- `X-Request-ID`: Unique request identifier
- `Content-Type`: Response format

### Environment Variables
Monitor these variables in Postman:
- `health_status`: Current backend health
- `cpu_usage`: System CPU usage
- `memory_usage`: System memory usage
- `last_request_id`: Last request identifier
- `last_processing_time`: Last processing time

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Currently no authentication required (for development)

### Response Format
All responses are in JSON format with the following structure:
```json
{
  "response": "string",
  "status": "success|error",
  "request_id": "uuid",
  "processing_time": 1.234
}
```

### Error Responses
```json
{
  "error": "Error message",
  "request_id": "uuid",
  "processing_time": 0.123
}
```

### Rate Limiting
Currently no rate limiting implemented (for development)

## 📊 Performance Benchmarks

### Expected Performance
- **Response Time**: < 5 seconds
- **Processing Time**: < 30 seconds
- **Success Rate**: > 95%
- **CPU Usage**: < 80%
- **Memory Usage**: < 80%

### Monitoring Commands
```bash
# Check system resources
python -c "import psutil; print(f'CPU: {psutil.cpu_percent()}%, Memory: {psutil.virtual_memory().percent}%')"

# Monitor response times
curl -w "@curl-format.txt" http://localhost:8000/health

# Load testing
ab -n 100 -c 10 http://localhost:8000/health
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Not Running
```bash
# Check if backend is running
curl http://localhost:8000/health

# Start backend
cd backend && python main.py
```

#### 2. Port Already in Use
```bash
# Check what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Use different port
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

#### 3. CORS Issues
```bash
# Check CORS headers
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8000/chat
```

#### 4. Slow Responses
```bash
# Check system resources
python -c "import psutil; print(f'CPU: {psutil.cpu_percent()}%, Memory: {psutil.virtual_memory().percent}%')"

# Check backend logs
tail -f backend.log
```

### Debug Commands
```bash
# Quick health check
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Check logs
tail -f backend.log
tail -f debug.log

# Monitor system
htop
top
```

## 📝 Best Practices

### Testing Strategy
1. **Start with Health Checks**: Ensure backend is running
2. **Test Basic Functionality**: Verify core features work
3. **Test Error Scenarios**: Ensure graceful error handling
4. **Performance Testing**: Monitor response times
5. **Load Testing**: Test under stress

### Environment Management
- Use different environments for different stages
- Keep sensitive data in environment variables
- Document environment configurations

### Test Data
- Use realistic agricultural questions
- Test various message lengths
- Include edge cases and error scenarios

### Monitoring
- Run tests regularly
- Monitor performance trends
- Track error rates
- Document issues and solutions

---

## 📁 File Structure
```
kangtani.ai/
├── Kangtani_Backend_API.postman_collection.json
├── Kangtani_Backend_Environment.postman_environment.json
├── POSTMAN_GUIDE.md
├── API_TESTING_README.md
├── test_api.sh
├── test_api.bat
├── run_debug.py
├── DEBUG_GUIDE.md
└── backend/
    ├── main.py
    ├── requirements.txt
    └── ...
```

**Note**: These testing tools are designed for comprehensive API validation and debugging. Use them to ensure your Kangtani.ai backend is working correctly before deploying to production. 