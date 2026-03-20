"""
Translate segments to Vietnamese.

Provider is decoupled — swap by changing TRANSLATE_PROVIDER env var.
Supported: "gemini" (default, free tier)
"""
import os
from typing import Callable
from app.models.segment import Segment

# Provider registry: name -> callable(numbered_text: str) -> str
_PROVIDERS: dict[str, Callable[[str], str]] = {}


def _get_provider() -> Callable[[str], str]:
    name = os.getenv("TRANSLATE_PROVIDER", "gemini")
    if name not in _PROVIDERS:
        # Lazy-register built-in providers
        if name == "gemini":
            from app.services.providers.gemini_translator import translate_text
            _PROVIDERS["gemini"] = translate_text
        else:
            raise RuntimeError(f"Unknown TRANSLATE_PROVIDER: {name!r}")
    return _PROVIDERS[name]


def translate(segments: list[Segment]) -> list[Segment]:
    """Translate each segment's text to Vietnamese in-place. Returns same list."""
    provider = _get_provider()

    numbered = "\n".join(f"{i+1}. {seg.text}" for i, seg in enumerate(segments))
    raw = provider(numbered)

    for line in raw.strip().splitlines():
        if ". " in line:
            idx_str, _, vi = line.partition(". ")
            try:
                idx = int(idx_str.strip()) - 1
                if 0 <= idx < len(segments):
                    segments[idx].vi_text = vi.strip()
            except ValueError:
                pass

    return segments
