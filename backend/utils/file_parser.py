import logging
import io
import tempfile
import os
from typing import Optional, Union
import base64

logger = logging.getLogger(__name__)

class FileParser:
    def __init__(self):
        self.supported_extensions = {
            '.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm',
            '.pdf', '.docx', '.doc', '.rtf'
        }
    
    async def parse_file(self, filename: str, file_content: bytes) -> str:
        """
        Parse file content based on file extension
        
        Args:
            filename: Name of the file
            file_content: Raw file content as bytes
            
        Returns:
            Extracted text content
        """
        try:
            file_extension = self._get_file_extension(filename)
            
            if file_extension not in self.supported_extensions:
                return f"[Unsupported file type: {file_extension}]"
            
            # Save to temporary file for processing
            with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            try:
                if file_extension == '.pdf':
                    return await self._parse_pdf(temp_file_path)
                elif file_extension == '.csv':
                    return await self._parse_csv(temp_file_path)
                elif file_extension == '.docx':
                    return await self._parse_docx(temp_file_path)
                elif file_extension == '.json':
                    return await self._parse_json(temp_file_path)
                elif file_extension in ['.txt', '.md', '.html', '.htm', '.xml', '.rtf']:
                    return await self._parse_text(temp_file_path)
                else:
                    return await self._parse_text(temp_file_path)
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"File parsing failed for {filename}: {e}")
            return f"[File parsing failed: {str(e)}]"
    
    async def parse_content(self, content: str) -> str:
        """
        Parse content string (for when content is already provided as text)
        
        Args:
            content: Text content to parse
            
        Returns:
            Processed content
        """
        try:
            # Simple text processing - remove excessive whitespace
            lines = content.split('\n')
            cleaned_lines = [line.strip() for line in lines if line.strip()]
            return '\n'.join(cleaned_lines)
        except Exception as e:
            logger.error(f"Content parsing failed: {e}")
            return f"[Content parsing failed: {str(e)}]"
    
    def _get_file_extension(self, filename: str) -> str:
        """Extract file extension from filename"""
        return os.path.splitext(filename.lower())[1]
    
    async def _parse_pdf(self, file_path: str) -> str:
        """Parse PDF file"""
        try:
            # Try PyPDF2 first
            try:
                import PyPDF2
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    return text.strip()
            except ImportError:
                pass
            
            # Try pdfplumber as alternative
            try:
                import pdfplumber
                text = ""
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        text += page.extract_text() + "\n"
                return text.strip()
            except ImportError:
                pass
            
            # Fallback message
            return "[PDF parsing requires PyPDF2 or pdfplumber. Install with: pip install PyPDF2 pdfplumber]"
            
        except Exception as e:
            logger.error(f"PDF parsing failed: {e}")
            return f"[PDF parsing failed: {str(e)}]"
    
    async def _parse_csv(self, file_path: str) -> str:
        """Parse CSV file"""
        try:
            import csv
            
            with open(file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.reader(file)
                rows = list(csv_reader)
                
                if not rows:
                    return "[Empty CSV file]"
                
                # Convert to readable format
                text_lines = []
                for i, row in enumerate(rows):
                    text_lines.append(f"Row {i+1}: {', '.join(row)}")
                
                return '\n'.join(text_lines)
                
        except Exception as e:
            logger.error(f"CSV parsing failed: {e}")
            return f"[CSV parsing failed: {str(e)}]"
    
    async def _parse_docx(self, file_path: str) -> str:
        """Parse DOCX file"""
        try:
            from docx import Document
            
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
            
        except ImportError:
            return "[DOCX parsing requires python-docx. Install with: pip install python-docx]"
        except Exception as e:
            logger.error(f"DOCX parsing failed: {e}")
            return f"[DOCX parsing failed: {str(e)}]"
    
    async def _parse_json(self, file_path: str) -> str:
        """Parse JSON file"""
        try:
            import json
            
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Convert JSON to readable text format
                if isinstance(data, dict):
                    return self._dict_to_text(data)
                elif isinstance(data, list):
                    return self._list_to_text(data)
                else:
                    return str(data)
                    
        except Exception as e:
            logger.error(f"JSON parsing failed: {e}")
            return f"[JSON parsing failed: {str(e)}]"
    
    async def _parse_text(self, file_path: str) -> str:
        """Parse text file"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as file:
                        content = file.read()
                        return content.strip()
                except UnicodeDecodeError:
                    continue
            
            # If all encodings fail, try binary read
            with open(file_path, 'rb') as file:
                content = file.read()
                return content.decode('utf-8', errors='ignore').strip()
                
        except Exception as e:
            logger.error(f"Text parsing failed: {e}")
            return f"[Text parsing failed: {str(e)}]"
    
    def _dict_to_text(self, data: dict, indent: int = 0) -> str:
        """Convert dictionary to readable text"""
        lines = []
        for key, value in data.items():
            if isinstance(value, dict):
                lines.append(f"{'  ' * indent}{key}:")
                lines.append(self._dict_to_text(value, indent + 1))
            elif isinstance(value, list):
                lines.append(f"{'  ' * indent}{key}:")
                lines.append(self._list_to_text(value, indent + 1))
            else:
                lines.append(f"{'  ' * indent}{key}: {value}")
        return '\n'.join(lines)
    
    def _list_to_text(self, data: list, indent: int = 0) -> str:
        """Convert list to readable text"""
        lines = []
        for i, item in enumerate(data):
            if isinstance(item, dict):
                lines.append(f"{'  ' * indent}Item {i+1}:")
                lines.append(self._dict_to_text(item, indent + 1))
            elif isinstance(item, list):
                lines.append(f"{'  ' * indent}Item {i+1}:")
                lines.append(self._list_to_text(item, indent + 1))
            else:
                lines.append(f"{'  ' * indent}Item {i+1}: {item}")
        return '\n'.join(lines)
    
    def is_supported_file(self, filename: str) -> bool:
        """Check if file type is supported"""
        return self._get_file_extension(filename) in self.supported_extensions
    
    def get_file_size_mb(self, file_content: bytes) -> float:
        """Get file size in MB"""
        return len(file_content) / (1024 * 1024) 