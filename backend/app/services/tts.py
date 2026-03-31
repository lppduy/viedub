"""Generate speech for each segment using VieNeu TTS SDK."""
from __future__ import annotations
import os
from pathlib import Path
from vieneu import Vieneu
from app.models.segment import Segment

_tts: Vieneu | None = None


def _get_tts() -> Vieneu:
    """Lazy-init VieNeu. Supports local (default) or remote mode via env vars."""
    global _tts
    if _tts is None:
        mode = os.getenv("VIENEU_MODE", "local")
        if mode == "remote":
            api_base = os.getenv("VIENEU_API_BASE")
            model_name = os.getenv("VIENEU_MODEL_NAME", "pnnbao-ump/VieNeu-TTS")
            if not api_base:
                raise RuntimeError("VIENEU_API_BASE must be set when VIENEU_MODE=remote")
            _tts = Vieneu(mode="remote", api_base=api_base, model_name=model_name)
        else:
            _tts = Vieneu()
    return _tts


def synthesize_segments(segments: list[Segment], output_dir: str) -> list[str]:
    """
    Generate one WAV clip per segment. Returns list of output paths
    in the same order as input segments.
    """
    tts = _get_tts()
    clip_paths: list[str] = []

    for i, seg in enumerate(segments):
        text = seg.vi_text or seg.text   # fallback to original if translation missing
        audio = tts.infer(text=text)
        clip_path = str(Path(output_dir) / f"clip_{i:04d}.wav")
        tts.save(audio, clip_path)
        clip_paths.append(clip_path)

    return clip_paths
