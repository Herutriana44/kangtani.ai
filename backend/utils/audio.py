import base64
import io
import logging
import tempfile
import os
from typing import Optional
import wave

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.whisper_available = self._check_whisper_availability()
        
    def _check_whisper_availability(self) -> bool:
        """Check if OpenAI Whisper is available"""
        try:
            import whisper
            return True
        except ImportError:
            logger.warning("OpenAI Whisper not available. Install with: pip install openai-whisper")
            return False
    
    async def transcribe_audio_base64(self, audio_base64: str) -> str:
        """
        Transcribe audio from base64 string
        
        Args:
            audio_base64: Base64 encoded audio data
            
        Returns:
            Transcribed text
        """
        try:
            # Decode base64 audio
            audio_data = base64.b64decode(audio_base64)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using available methods
                if self.whisper_available:
                    return await self._transcribe_with_whisper(temp_file_path)
                else:
                    # Fallback to simple audio validation
                    return await self._validate_audio_file(temp_file_path)
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Audio transcription failed: {e}")
            return "[Audio transcription failed]"
    
    async def _transcribe_with_whisper(self, audio_file_path: str) -> str:
        """Transcribe audio using OpenAI Whisper"""
        try:
            import whisper
            
            # Load model (this will download on first use)
            model = whisper.load_model("base")
            
            # Transcribe
            result = model.transcribe(audio_file_path)
            
            return result["text"].strip()
            
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            return "[Whisper transcription failed]"
    
    async def _validate_audio_file(self, audio_file_path: str) -> str:
        """Validate audio file and return placeholder text"""
        try:
            with wave.open(audio_file_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                rate = wav_file.getframerate()
                duration = frames / float(rate)
                
                logger.info(f"Audio file validated: {duration:.2f}s duration")
                return f"[Audio file received: {duration:.2f}s duration]"
                
        except Exception as e:
            logger.error(f"Audio validation failed: {e}")
            return "[Audio file validation failed]"
    
    async def transcribe_audio_file(self, audio_file_path: str) -> str:
        """
        Transcribe audio from file path
        
        Args:
            audio_file_path: Path to audio file
            
        Returns:
            Transcribed text
        """
        try:
            if self.whisper_available:
                return await self._transcribe_with_whisper(audio_file_path)
            else:
                return await self._validate_audio_file(audio_file_path)
                
        except Exception as e:
            logger.error(f"Audio file transcription failed: {e}")
            return "[Audio transcription failed]"
    
    def is_audio_file(self, filename: str) -> bool:
        """Check if file is an audio file based on extension"""
        audio_extensions = {'.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma'}
        return any(filename.lower().endswith(ext) for ext in audio_extensions)
    
    async def get_audio_duration(self, audio_base64: str) -> Optional[float]:
        """Get duration of audio file from base64 data"""
        try:
            audio_data = base64.b64decode(audio_base64)
            
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                with wave.open(temp_file_path, 'rb') as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    return frames / float(rate)
            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Failed to get audio duration: {e}")
            return None 