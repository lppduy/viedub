"""Extract 16kHz mono WAV from video using ffmpeg."""
import subprocess
from pathlib import Path


def extract_audio(video_path: str, output_dir: str) -> str:
    """Extract audio from video file, return path to wav file."""
    out_path = Path(output_dir) / "audio.wav"
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ar", "16000",   # 16kHz — required by Whisper
        "-ac", "1",       # mono
        "-vn",            # no video
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")
    return str(out_path)
