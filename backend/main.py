from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import base64
import json
from typing import Optional
import logging
import traceback
import time
import os
from datetime import datetime

# Import our custom modules
from ollama_client import OllamaClient
from utils.audio import AudioProcessor
from utils.file_parser import FileParser

# Configure comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Add request ID tracking
import uuid

app = FastAPI(
    title="Kangtani.ai Backend",
    description="Agricultural chatbot backend powered by Ollama",
    version="1.0.0"
)

# Configure CORS with more permissive settings for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
ollama_client = OllamaClient()
audio_processor = AudioProcessor()
file_parser = FileParser()

class ChatRequest(BaseModel):
    message: str
    audio_base64: Optional[str] = None
    file_content: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    status: str = "success"
    request_id: Optional[str] = None
    processing_time: Optional[float] = None

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Log request details
    logger.info(f"Request ID: {request_id} - {request.method} {request.url}")
    logger.info(f"Request ID: {request_id} - Headers: {dict(request.headers)}")
    
    # Add request ID to request state
    request.state.request_id = request_id
    
    try:
        response = await call_next(request)
        processing_time = time.time() - start_time
        
        # Log response details
        logger.info(f"Request ID: {request_id} - Status: {response.status_code} - Time: {processing_time:.3f}s")
        
        # Add processing time to response headers
        response.headers["X-Processing-Time"] = str(processing_time)
        response.headers["X-Request-ID"] = request_id
        
        return response
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Request ID: {request_id} - Error: {str(e)}")
        logger.error(f"Request ID: {request_id} - Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "request_id": request_id,
                "processing_time": processing_time,
                "details": str(e)
            }
        )

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Kangtani.ai Backend API", 
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    try:
        # Test Ollama connection
        ollama_status = await ollama_client.test_connection()
        logger.info(f"Ollama connection test: {ollama_status}")
        
        # Check system resources
        import psutil
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        health_status = {
            "status": "healthy",
            "ollama": "connected" if ollama_status else "disconnected",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": memory.available // (1024**3),  # GB
            }
        }
        
        logger.info(f"Health check result: {health_status}")
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        logger.error(f"Health check traceback: {traceback.format_exc()}")
        return {
            "status": "unhealthy", 
            "ollama": "disconnected", 
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/debug")
async def debug_info():
    """Debug endpoint to show current system state"""
    logger.info("Debug info requested")
    
    try:
        import psutil
        import platform
        
        debug_info = {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "platform": platform.platform(),
                "python_version": platform.python_version(),
                "cpu_count": psutil.cpu_count(),
                "cpu_percent": psutil.cpu_percent(),
                "memory": {
                    "total": psutil.virtual_memory().total // (1024**3),
                    "available": psutil.virtual_memory().available // (1024**3),
                    "percent": psutil.virtual_memory().percent
                },
                "disk": {
                    "total": psutil.disk_usage('/').total // (1024**3),
                    "free": psutil.disk_usage('/').free // (1024**3),
                    "percent": psutil.disk_usage('/').percent
                }
            },
            "environment": {
                "PWD": os.getcwd(),
                "PYTHONPATH": os.environ.get('PYTHONPATH', 'Not set'),
            },
            "network": {
                "hostname": platform.node(),
            }
        }
        
        logger.info(f"Debug info: {debug_info}")
        return debug_info
        
    except Exception as e:
        logger.error(f"Debug info failed: {e}")
        logger.error(f"Debug info traceback: {traceback.format_exc()}")
        return {"error": str(e)}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    request_id = getattr(req.state, 'request_id', str(uuid.uuid4()))
    start_time = time.time()
    
    logger.info(f"Chat request received - ID: {request_id}")
    logger.info(f"Chat request - Message: {request.message[:100]}...")
    logger.info(f"Chat request - Has audio: {bool(request.audio_base64)}")
    logger.info(f"Chat request - Has file: {bool(request.file_content)}")
    
    try:
        # Process audio if provided
        if request.audio_base64:
            try:
                logger.info(f"Processing audio for request {request_id}")
                audio_text = await audio_processor.transcribe_audio_base64(request.audio_base64)
                request.message = f"{request.message} [Audio: {audio_text}]"
                logger.info(f"Audio transcribed for {request_id}: {audio_text}")
            except Exception as e:
                logger.error(f"Audio transcription failed for {request_id}: {e}")
                logger.error(f"Audio transcription traceback: {traceback.format_exc()}")
                # Continue with original message if audio processing fails

        # Process file content if provided
        if request.file_content:
            try:
                logger.info(f"Processing file content for request {request_id}")
                parsed_content = await file_parser.parse_content(request.file_content)
                request.message = f"{request.message}\n\nFile Context:\n{parsed_content}"
                logger.info(f"File content parsed for {request_id}")
            except Exception as e:
                logger.error(f"File parsing failed for {request_id}: {e}")
                logger.error(f"File parsing traceback: {traceback.format_exc()}")
                # Continue with original message if file parsing fails

        # Send to Ollama
        logger.info(f"Sending to Ollama for request {request_id}")
        response = await ollama_client.chat(request.message)
        logger.info(f"Ollama response received for {request_id}: {response[:100]}...")
        
        processing_time = time.time() - start_time
        
        result = ChatResponse(
            response=response,
            request_id=request_id,
            processing_time=processing_time
        )
        
        logger.info(f"Chat request {request_id} completed successfully in {processing_time:.3f}s")
        return result
    
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Chat error for {request_id}: {e}")
        logger.error(f"Chat error traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e),
                "request_id": request_id,
                "processing_time": processing_time
            }
        )

@app.post("/chat/file")
async def chat_with_file(
    message: str = Form(...),
    file: UploadFile = File(...),
    req: Request = None
):
    request_id = getattr(req.state, 'request_id', str(uuid.uuid4())) if req else str(uuid.uuid4())
    start_time = time.time()
    
    logger.info(f"Chat with file request received - ID: {request_id}")
    logger.info(f"File upload - Name: {file.filename}, Size: {file.size if hasattr(file, 'size') else 'Unknown'}")
    
    try:
        # Read file content
        file_content = await file.read()
        logger.info(f"File read successfully for {request_id}, size: {len(file_content)} bytes")
        
        # Parse file content
        parsed_content = await file_parser.parse_file(file.filename, file_content)
        logger.info(f"File parsed successfully for {request_id}")
        
        # Combine message with file context
        full_message = f"{message}\n\nFile Context:\n{parsed_content}"
        
        # Send to Ollama
        response = await ollama_client.chat(full_message)
        
        processing_time = time.time() - start_time
        logger.info(f"Chat with file {request_id} completed in {processing_time:.3f}s")
        
        return ChatResponse(
            response=response,
            request_id=request_id,
            processing_time=processing_time
        )
    
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Chat with file error for {request_id}: {e}")
        logger.error(f"Chat with file traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e),
                "request_id": request_id,
                "processing_time": processing_time
            }
        )

@app.post("/chat/audio")
async def chat_with_audio(
    message: str = Form(...),
    audio: UploadFile = File(...),
    req: Request = None
):
    request_id = getattr(req.state, 'request_id', str(uuid.uuid4())) if req else str(uuid.uuid4())
    start_time = time.time()
    
    logger.info(f"Chat with audio request received - ID: {request_id}")
    logger.info(f"Audio upload - Name: {audio.filename}, Size: {audio.size if hasattr(audio, 'size') else 'Unknown'}")
    
    try:
        # Read audio file
        audio_content = await audio.read()
        logger.info(f"Audio read successfully for {request_id}, size: {len(audio_content)} bytes")
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        # Transcribe audio
        audio_text = await audio_processor.transcribe_audio_base64(audio_base64)
        logger.info(f"Audio transcribed for {request_id}: {audio_text}")
        
        # Combine message with audio transcription
        full_message = f"{message} [Audio: {audio_text}]"
        
        # Send to Ollama
        response = await ollama_client.chat(full_message)
        
        processing_time = time.time() - start_time
        logger.info(f"Chat with audio {request_id} completed in {processing_time:.3f}s")
        
        return ChatResponse(
            response=response,
            request_id=request_id,
            processing_time=processing_time
        )
    
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Chat with audio error for {request_id}: {e}")
        logger.error(f"Chat with audio traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e),
                "request_id": request_id,
                "processing_time": processing_time
            }
        )

if __name__ == "__main__":
    import uvicorn
    
    # Log startup information
    logger.info("Starting Kangtani.ai Backend Server")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Python version: {os.sys.version}")
    
    # Check if running in Google Colab
    try:
        import google.colab
        logger.info("Running in Google Colab environment")
        # In Colab, we need to use ngrok or similar for external access
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
    except ImportError:
        logger.info("Running in local environment")
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug") 