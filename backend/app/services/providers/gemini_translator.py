"""Gemini translation provider (free tier)."""
import os
import time
import logging
from google import genai
from google.genai import errors as genai_errors

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

# Retry config for 429 rate-limit errors
_MAX_RETRIES = 3
_RETRY_DELAY = 60  # seconds — Gemini per-minute quota resets in ~60s


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=api_key, http_options={"api_version": "v1"})
    return _client


def translate_text(numbered_text: str) -> str:
    """Send numbered lines to Gemini, return raw response text.

    Retries up to _MAX_RETRIES times on 429 rate-limit errors with
    exponential backoff.
    """
    prompt = (
        "You are a professional subtitle translator. "
        "Translate each numbered line to natural Vietnamese. "
        "Preserve the numbering. Output only translated lines, "
        "one per line, same number prefix. No explanation.\n\n"
        + numbered_text
    )
    client = _get_client()

    for attempt in range(_MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                contents=prompt,
            )
            return response.text or ""
        except genai_errors.ClientError as e:
            # 429 RESOURCE_EXHAUSTED — rate limit
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                if attempt < _MAX_RETRIES - 1:
                    logger.warning(
                        "Gemini rate limit hit, retrying in %ds (attempt %d/%d)",
                        _RETRY_DELAY, attempt + 1, _MAX_RETRIES,
                    )
                    time.sleep(_RETRY_DELAY)
                    continue
            raise

    raise RuntimeError("Gemini translation failed after max retries")
