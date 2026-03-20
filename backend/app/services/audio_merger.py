"""
Merge TTS clips into a single dubbed audio track using ffmpeg.

Strategy: place each clip at its original segment start time using
ffmpeg adelay filter, then amix all streams. This keeps dubbed speech
roughly in sync with the video.
"""
import subprocess
from pathlib import Path
from app.models.segment import Segment


def merge_clips(clip_paths: list[str], segments: list[Segment], output_dir: str) -> str:
    """
    Place each clip at segment.start time and mix into one WAV.
    Returns path to final dubbed audio file.
    """
    if not clip_paths:
        raise ValueError("No clips to merge")

    out_path = str(Path(output_dir) / "dubbed.wav")

    # Build ffmpeg filter_complex:
    # Each input gets adelay applied (in milliseconds), then all are amixed.
    inputs = []
    filter_parts = []
    for i, (path, seg) in enumerate(zip(clip_paths, segments)):
        inputs += ["-i", path]
        delay_ms = int(seg.start * 1000)
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[d{i}]")

    mix_inputs = "".join(f"[d{i}]" for i in range(len(clip_paths)))
    filter_parts.append(f"{mix_inputs}amix=inputs={len(clip_paths)}:duration=longest[out]")

    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-ar", "24000",   # VieNeu TTS outputs 24kHz
        out_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg merge failed: {result.stderr}")

    return out_path
