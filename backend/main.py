from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import base64
import json
from typing import Optional
import logging

# Import our custom modules
from ollama_client import OllamaClient
from utils.audio import AudioProcessor
from utils.file_parser import FileParser

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kangtani.ai Backend",
    description="Agricultural chatbot backend powered by Ollama",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
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

@app.get("/")
async def root():
    return {"message": "Kangtani.ai Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    try:
        # Test Ollama connection
        await ollama_client.test_connection()
        return {"status": "healthy", "ollama": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "ollama": "disconnected", "error": str(e)}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Process audio if provided
        if request.audio_base64:
            try:
                audio_text = await audio_processor.transcribe_audio_base64(request.audio_base64)
                request.message = f"{request.message} [Audio: {audio_text}]"
                logger.info(f"Audio transcribed: {audio_text}")
            except Exception as e:
                logger.error(f"Audio transcription failed: {e}")
                # Continue with original message if audio processing fails

        # Process file content if provided
        if request.file_content:
            try:
                parsed_content = await file_parser.parse_content(request.file_content)
                request.message = f"{request.message}\n\nFile Context:\n{parsed_content}"
                logger.info("File content parsed and added to context")
            except Exception as e:
                logger.error(f"File parsing failed: {e}")
                # Continue with original message if file parsing fails

        # Send to Ollama
        response = await ollama_client.chat(request.message)
        
        return ChatResponse(response=response)
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/file")
async def chat_with_file(
    message: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Read file content
        file_content = await file.read()
        
        # Parse file content
        parsed_content = await file_parser.parse_file(file.filename, file_content)
        
        # Combine message with file context
        full_message = f"{message}\n\nFile Context:\n{parsed_content}"
        
        # Send to Ollama
        response = await ollama_client.chat(full_message)
        
        return ChatResponse(response=response)
    
    except Exception as e:
        logger.error(f"Chat with file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/audio")
async def chat_with_audio(
    message: str = Form(...),
    audio: UploadFile = File(...)
):
    try:
        # Read audio file
        audio_content = await audio.read()
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        # Transcribe audio
        audio_text = await audio_processor.transcribe_audio_base64(audio_base64)
        
        # Combine message with audio transcription
        full_message = f"{message} [Audio: {audio_text}]"
        
        # Send to Ollama
        response = await ollama_client.chat(full_message)
        
        return ChatResponse(response=response)
    
    except Exception as e:
        logger.error(f"Chat with audio error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 