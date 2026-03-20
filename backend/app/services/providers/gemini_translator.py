"""Gemini translation provider (free tier)."""
import os
from google import genai

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=api_key)
    return _client


def translate_text(numbered_text: str) -> str:
    """Send numbered lines to Gemini, return raw response text."""
    prompt = (
        "You are a professional subtitle translator. "
        "Translate each numbered line to natural Vietnamese. "
        "Preserve the numbering. Output only translated lines, "
        "one per line, same number prefix. No explanation.\n\n"
        + numbered_text
    )
    response = _get_client().models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text or ""
