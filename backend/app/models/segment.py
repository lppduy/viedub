from dataclasses import dataclass


@dataclass
class Segment:
    """One transcribed+translated segment with timing."""
    start: float   # seconds
    end: float     # seconds
    text: str      # original transcribed text
    vi_text: str = ""  # Vietnamese translation (filled after translate step)
