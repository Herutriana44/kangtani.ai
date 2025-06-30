# kangtani.ai Installation & Usage Guide

## Overview

**kangtani.ai** is an offline-friendly agricultural chatbot assistant. It uses a Next.js + Tailwind frontend and a FastAPI backend that connects to a local Ollama instance (with the Gemma model) for LLM-powered chat.

---

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** and **pnpm** or **npm** (for frontend)
- **Ollama** running locally with the `gemma` model pulled
- (Optional) For audio/file parsing: `ffmpeg`, `openai-whisper`, `PyPDF2`, `pdfplumber`, `python-docx`

---

## Backend (FastAPI)

### Location
- `backend/`

### Main Files & Their Purpose
- `main.py`: FastAPI app, exposes `/chat` endpoint, handles CORS, integrates audio/file utils.
- `ollama_client.py`: Handles communication with the local Ollama API (model: Gemma).
- `utils/audio.py`: Audio transcription (OpenAI Whisper, optional fallback).
- `utils/file_parser.py`: File parsing for PDF, CSV, DOCX, TXT, JSON, etc.
- `requirements.txt`: Python dependencies for the backend.

### Installation & Running

1. **Install dependencies**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
2. **Start the FastAPI server**
   ```sh
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - The backend will be available at `http://localhost:8000`
   - CORS is enabled for `localhost:3000` (frontend)

3. **Ollama setup**
   - Make sure Ollama is running locally:
     ```sh
     ollama serve
     ollama pull gemma
     ```
   - Ollama API should be accessible at `http://localhost:11434`

#### API Endpoints
- `POST /chat` — Main chat endpoint. Accepts `{ "message": "your question" }`, returns `{ "response": "LLM reply" }`.
- `POST /chat/file` — (Optional) Send a file and message for context.
- `POST /chat/audio` — (Optional) Send an audio file and message for transcription + chat.
- `GET /health` — Health check for backend and Ollama connection.

---

## Frontend (Next.js)

### Location
- `frontend/`

### Main Files & Their Purpose
- `hooks/useChat.ts`: React hook for chat state and sending messages to backend.
- `components/`: UI components (chat, navigation, etc.)
- `app/`: Next.js app directory (pages, layouts, etc.)
- `package.json`: Frontend dependencies.

### Installation & Running

1. **Install dependencies**
   ```sh
   cd frontend
   pnpm install
   # or
   npm install
   ```
2. **Start the Next.js development server**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```
   - The frontend will be available at `http://localhost:3000`

3. **Usage**
   - Open `http://localhost:3000` in your browser.
   - Start chatting! Messages are sent to the FastAPI backend and answered by the Gemma model via Ollama.

---

## Troubleshooting
- Ensure Ollama is running and the `gemma` model is available.
- If you get CORS errors, make sure both frontend and backend are running on the correct ports.
- For audio/file features, install optional dependencies as listed in `requirements.txt`.

---

## Credits
- Built with [Next.js](https://nextjs.org/), [FastAPI](https://fastapi.tiangolo.com/), [Ollama](https://ollama.com/), and [Gemma LLM](https://ai.google.dev/gemma). 