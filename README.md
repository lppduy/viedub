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

## Requirements

- Node.js 20+, pnpm
- Python 3.11+
- ffmpeg
- Gemini API key

## Quick start

### Frontend

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173
```

### Backend

#### macOS / Linux

```bash
# Install ffmpeg
brew install ffmpeg

cd backend

# Configure environment
cp .env.example .env   # add your GEMINI_API_KEY

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies & run
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

#### Windows

```bash
# Install ffmpeg
winget install ffmpeg

cd backend

# Configure environment
copy .env.example .env   # add your GEMINI_API_KEY

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install prebuilt llama-cpp-python (must be before vieneu)
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu

# Install dependencies & run
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

## License

[MIT](LICENSE)
