"""Generate WebVTT subtitle file from translated segments."""
from pathlib import Path
from app.models.segment import Segment


def _fmt_time(seconds: float) -> str:
    """Format seconds as WebVTT timestamp: HH:MM:SS.mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def generate_vtt(segments: list[Segment], output_dir: str) -> str:
    """Write a WebVTT file and return its path."""
    out_path = Path(output_dir) / "subtitles.vtt"
    lines = ["WEBVTT", ""]

    for i, seg in enumerate(segments, 1):
        text = seg.vi_text or seg.text
        lines += [
            str(i),
            f"{_fmt_time(seg.start)} --> {_fmt_time(seg.end)}",
            text,
            "",
        ]

    out_path.write_text("\n".join(lines), encoding="utf-8")
    return str(out_path)
