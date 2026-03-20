# VieDub

AI-powered Vietnamese dubbing & subtitles. Vietnamese-first.

**Author:** Le Pham Phuong Duy ([@lppduy](https://github.com/lppduy))

## What it does

Upload a video → get Vietnamese subtitles + dubbed audio track.

**Pipeline:** Whisper (transcribe) → Gemini (translate) → VieNeu TTS (dub)

## Stack

- **Frontend:** React + Vite + TailwindCSS (TypeScript)
- **Backend:** Python FastAPI
- **Desktop:** Tauri (planned)

## Quick start

### Frontend

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173
```

### Backend

```bash
# Install system dependency
brew install ffmpeg   # macOS — required for audio extraction

cd backend
cp .env.example .env  # fill in GEMINI_API_KEY
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

## Requirements

- Node.js 20+, pnpm
- Python 3.11+
- ffmpeg (`brew install ffmpeg` on macOS)
- Gemini API key (free — get at aistudio.google.com)

## License

[MIT](LICENSE)
