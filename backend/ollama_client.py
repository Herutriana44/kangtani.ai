import httpx
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "gemma3n:e2b"):
        self.base_url = base_url
        self.model = model
        self.chat_url = f"{base_url}/api/chat"
        self.generate_url = f"{base_url}/api/generate"
        
    async def test_connection(self) -> bool:
        """Test connection to Ollama server"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                logger.info("Ollama connection test successful")
                return True
        except Exception as e:
            logger.error(f"Ollama connection test failed: {e}")
            raise Exception(f"Cannot connect to Ollama at {self.base_url}: {e}")
    
    async def chat(self, message: str, system_prompt: Optional[str] = None) -> str:
        """
        Send a chat message to Ollama and return the response
        
        Args:
            message: User message
            system_prompt: Optional system prompt for agricultural context
            
        Returns:
            Response from the model
        """
        # Default agricultural system prompt
        if system_prompt is None:
            system_prompt = """You are Kangtani.ai, an agricultural assistant designed to help farmers and agricultural professionals. 
            You provide expert advice on farming techniques, crop management, pest control, soil health, and sustainable agriculture practices.
            Always provide practical, actionable advice that considers local conditions and best practices.
            If you're unsure about something, acknowledge the limitation and suggest consulting local agricultural experts."""
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 2048
            }
        }
        
        try:
            # Updated timeout to 10 minutes (600 seconds)
            async with httpx.AsyncClient(timeout=600.0) as client:
                logger.info(f"Sending message to Ollama: {message[:100]}...")
                response = await client.post(
                    self.chat_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                result = response.json()
                
                if "message" in result and "content" in result["message"]:
                    content = result["message"]["content"]
                    logger.info(f"Received response from Ollama: {content[:100]}...")
                    return content
                else:
                    logger.error(f"Unexpected Ollama response format: {result}")
                    raise Exception("Invalid response format from Ollama")
                    
        except httpx.TimeoutException:
            logger.error("Ollama request timed out after 10 minutes")
            raise Exception("Request to Ollama timed out after 10 minutes. Please try again.")
        except httpx.HTTPStatusError as e:
            logger.error(f"Ollama HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Ollama server error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {e}")
            raise Exception(f"Failed to communicate with Ollama: {e}")
    
    async def generate(self, prompt: str) -> str:
        """
        Generate text using Ollama's generate endpoint (alternative to chat)
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated text
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 2048
            }
        }
        
        try:
            # Updated timeout to 10 minutes (600 seconds)
            async with httpx.AsyncClient(timeout=600.0) as client:
                response = await client.post(
                    self.generate_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                result = response.json()
                
                if "response" in result:
                    return result["response"]
                else:
                    logger.error(f"Unexpected Ollama generate response: {result}")
                    raise Exception("Invalid response format from Ollama generate")
                    
        except Exception as e:
            logger.error(f"Error in generate request: {e}")
            raise Exception(f"Failed to generate text: {e}")
    
    async def list_models(self) -> list:
        """List available models in Ollama"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                result = response.json()
                return result.get("models", [])
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []