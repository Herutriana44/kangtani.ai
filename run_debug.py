#!/usr/bin/env python3
"""
Kangtani.ai Debug Runner
Comprehensive debugging and monitoring for the agricultural chatbot
"""

import os
import sys
import time
import logging
import subprocess
import requests
import json
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class KangtaniDebugger:
    def __init__(self):
        self.backend_process = None
        self.backend_url = "http://localhost:8000"
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        
    def check_dependencies(self):
        """Check if all required dependencies are installed"""
        logger.info("🔍 Checking dependencies...")
        
        required_packages = [
            "fastapi", "uvicorn", "httpx", "pydantic", 
            "python-multipart", "psutil", "requests"
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package)
                logger.info(f"✅ {package} - OK")
            except ImportError:
                missing_packages.append(package)
                logger.error(f"❌ {package} - Missing")
        
        if missing_packages:
            logger.error(f"Missing packages: {missing_packages}")
            logger.info("Run: pip install -r backend/requirements.txt")
            return False
        
        logger.info("✅ All dependencies are installed")
        return True
    
    def check_backend_files(self):
        """Check if backend files exist"""
        logger.info("🔍 Checking backend files...")
        
        required_files = [
            "main.py",
            "requirements.txt"
        ]
        
        missing_files = []
        for file in required_files:
            file_path = self.backend_dir / file
            if file_path.exists():
                logger.info(f"✅ {file} - Found")
            else:
                missing_files.append(file)
                logger.error(f"❌ {file} - Missing")
        
        if missing_files:
            logger.error(f"Missing files: {missing_files}")
            return False
        
        logger.info("✅ All backend files are present")
        return True
    
    def check_port_availability(self):
        """Check if port 8000 is available"""
        logger.info("🔍 Checking port 8000 availability...")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=2)
            logger.warning(f"⚠️ Port 8000 is already in use (status: {response.status_code})")
            return False
        except requests.exceptions.ConnectionError:
            logger.info("✅ Port 8000 is available")
            return True
        except Exception as e:
            logger.info(f"✅ Port 8000 is available (error: {e})")
            return True
    
    def start_backend(self):
        """Start the backend server"""
        logger.info("🚀 Starting backend server...")
        
        if not self.check_dependencies():
            logger.error("❌ Dependencies check failed")
            return False
        
        if not self.check_backend_files():
            logger.error("❌ Backend files check failed")
            return False
        
        if not self.check_port_availability():
            logger.error("❌ Port 8000 is not available")
            return False
        
        try:
            # Change to backend directory
            os.chdir(self.backend_dir)
            
            # Start server
            self.backend_process = subprocess.Popen([
                sys.executable, "-m", "uvicorn", "main:app",
                "--host", "0.0.0.0",
                "--port", "8000",
                "--log-level", "debug"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            logger.info(f"✅ Backend server started (PID: {self.backend_process.pid})")
            
            # Wait for server to start
            time.sleep(3)
            
            # Test server
            if self.test_backend():
                logger.info("✅ Backend server is running and responding")
                return True
            else:
                logger.error("❌ Backend server failed to start properly")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to start backend: {e}")
            return False
    
    def test_backend(self):
        """Test if backend is responding"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"🏥 Health check: {health_data}")
                return True
            else:
                logger.error(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
            return False
    
    def test_api_endpoints(self):
        """Test all API endpoints"""
        logger.info("🧪 Testing API endpoints...")
        
        endpoints = [
            ("/", "GET"),
            ("/health", "GET"),
            ("/debug", "GET"),
            ("/chat", "POST", {"message": "Test message"})
        ]
        
        results = []
        for endpoint, method, *args in endpoints:
            try:
                url = f"{self.backend_url}{endpoint}"
                
                if method == "GET":
                    response = requests.get(url, timeout=10)
                elif method == "POST":
                    response = requests.post(url, json=args[0], timeout=10)
                
                success = response.status_code < 400
                status_icon = "✅" if success else "❌"
                
                logger.info(f"{status_icon} {method} {endpoint} - {response.status_code}")
                
                if success:
                    try:
                        data = response.json()
                        logger.info(f"   Response: {json.dumps(data, indent=2)[:200]}...")
                    except:
                        logger.info(f"   Response: {response.text[:200]}...")
                else:
                    logger.error(f"   Error: {response.text}")
                
                results.append({
                    "endpoint": endpoint,
                    "method": method,
                    "success": success,
                    "status": response.status_code
                })
                
            except Exception as e:
                logger.error(f"❌ {method} {endpoint} - Error: {e}")
                results.append({
                    "endpoint": endpoint,
                    "method": method,
                    "success": False,
                    "error": str(e)
                })
        
        # Summary
        successful = sum(1 for r in results if r["success"])
        total = len(results)
        logger.info(f"📊 API Test Summary: {successful}/{total} endpoints working")
        
        return successful == total
    
    def monitor_server(self):
        """Monitor server status and resources"""
        logger.info("📊 Starting server monitoring...")
        
        try:
            import psutil
            
            while True:
                # Check if server is still running
                if self.backend_process and self.backend_process.poll() is not None:
                    logger.error("❌ Backend server has stopped")
                    break
                
                # System resources
                cpu_percent = psutil.cpu_percent()
                memory = psutil.virtual_memory()
                
                # API health
                try:
                    response = requests.get(f"{self.backend_url}/health", timeout=5)
                    api_status = "✅ Healthy" if response.status_code == 200 else f"⚠️ HTTP {response.status_code}"
                except:
                    api_status = "❌ Unreachable"
                
                # Log status
                logger.info(f"📊 Status: CPU {cpu_percent}% | Memory {memory.percent}% | API {api_status}")
                
                time.sleep(30)  # Check every 30 seconds
                
        except KeyboardInterrupt:
            logger.info("🛑 Monitoring stopped by user")
        except Exception as e:
            logger.error(f"❌ Monitoring error: {e}")
    
    def interactive_chat(self):
        """Interactive chat interface for testing"""
        logger.info("🌾 Starting interactive chat...")
        logger.info("Type 'quit' to exit, 'status' for server status")
        
        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    logger.info("👋 Goodbye!")
                    break
                
                if user_input.lower() == 'status':
                    self.test_backend()
                    continue
                
                if not user_input:
                    continue
                
                # Send message
                try:
                    response = requests.post(
                        f"{self.backend_url}/chat",
                        json={"message": user_input},
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"🤖 Kangtani: {data['response']}")
                        print(f"   ⏱️ Time: {data.get('processing_time', 0):.2f}s")
                        print(f"   🆔 ID: {data.get('request_id', 'N/A')}")
                    else:
                        print(f"❌ Error: HTTP {response.status_code}")
                        print(f"   Response: {response.text}")
                        
                except Exception as e:
                    print(f"❌ Error: {e}")
                    
            except KeyboardInterrupt:
                logger.info("👋 Goodbye!")
                break
            except Exception as e:
                logger.error(f"❌ Chat error: {e}")
    
    def cleanup(self):
        """Clean up resources"""
        logger.info("🧹 Cleaning up...")
        
        if self.backend_process and self.backend_process.poll() is None:
            self.backend_process.terminate()
            logger.info("🛑 Backend server stopped")
        
        logger.info("✅ Cleanup completed")
    
    def run(self):
        """Main run method"""
        logger.info("🌾 Kangtani.ai Debug Runner")
        logger.info("=" * 50)
        
        try:
            # Start backend
            if not self.start_backend():
                logger.error("❌ Failed to start backend")
                return
            
            # Test API
            if not self.test_api_endpoints():
                logger.warning("⚠️ Some API endpoints failed")
            
            # Start monitoring in background
            import threading
            monitor_thread = threading.Thread(target=self.monitor_server, daemon=True)
            monitor_thread.start()
            
            # Start interactive chat
            self.interactive_chat()
            
        except KeyboardInterrupt:
            logger.info("🛑 Stopped by user")
        except Exception as e:
            logger.error(f"❌ Runtime error: {e}")
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    debugger = KangtaniDebugger()
    debugger.run()

if __name__ == "__main__":
    main() 