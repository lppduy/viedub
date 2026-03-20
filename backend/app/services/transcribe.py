"""Transcribe audio using faster-whisper. Returns list of Segments."""
from faster_whisper import WhisperModel
from app.models.segment import Segment

# Load model once at module level — avoids reload on every request
_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        # "base" balances speed vs accuracy for local use
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    return _model


def transcribe(audio_path: str) -> list[Segment]:
    """Transcribe audio file, return list of timed segments."""
    model = _get_model()
    segments_iter, _ = model.transcribe(audio_path, beam_size=5)
    return [
        Segment(start=seg.start, end=seg.end, text=seg.text.strip())
        for seg in segments_iter
        if seg.text.strip()
    ]
