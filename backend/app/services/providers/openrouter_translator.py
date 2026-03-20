"""OpenRouter translation provider (OpenAI-compatible API, free models available)."""
import os
from openai import OpenAI

_client: OpenAI | None = None

# Default free model — change via OPENROUTER_MODEL env var
_DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free"


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not set")
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
    return _client


def translate_text(numbered_text: str) -> str:
    """Send numbered lines to OpenRouter, return raw response text."""
    model = os.getenv("OPENROUTER_MODEL", _DEFAULT_MODEL)
    prompt = (
        "You are a professional subtitle translator. "
        "Translate each numbered line to natural Vietnamese. "
        "Preserve the numbering. Output only translated lines, "
        "one per line, same number prefix. No explanation.\n\n"
        + numbered_text
    )
    response = _get_client().chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content or ""
