"""Translate segments to Vietnamese using OpenAI API."""
import os
from openai import OpenAI
from app.models.segment import Segment

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _client = OpenAI(api_key=api_key)
    return _client


def translate(segments: list[Segment]) -> list[Segment]:
    """Translate each segment's text to Vietnamese in-place. Returns same list."""
    client = _get_client()

    # Batch all texts into one request to minimize API calls
    texts = [seg.text for seg in segments]
    numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts))

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional subtitle translator. "
                    "Translate each numbered line from the source language to natural Vietnamese. "
                    "Preserve the numbering. Output only the translated lines, one per line, "
                    "keeping the same number prefix. Do not add any explanation."
                ),
            },
            {"role": "user", "content": numbered},
        ],
        temperature=0.3,
    )

    raw = response.choices[0].message.content or ""
    lines = raw.strip().splitlines()

    # Parse "N. translated text" lines back into segments
    for line in lines:
        if ". " in line:
            idx_str, _, vi = line.partition(". ")
            try:
                idx = int(idx_str.strip()) - 1
                if 0 <= idx < len(segments):
                    segments[idx].vi_text = vi.strip()
            except ValueError:
                pass

    return segments
