"""
LLM Gateway for Intentwall
Manages multi-provider intent understanding: Google Gemini API (free tier),
local Ollama fallback, and rule-based keyword parser.
Includes prompt-hash caching, backoff, and strict schema validation.
"""

import os
import json
import hashlib
import asyncio
from typing import Dict, Any, Optional, Tuple
import httpx

from apps.api.ir.models import FirewallIntentIR
from apps.api.llm.prompts import SYSTEM_PROMPT
from apps.api.llm.keyword_parser import parse_intent_keywords

# In-memory prompt cache
PROMPT_CACHE: Dict[str, Dict[str, Any]] = {}


def hash_prompt(prompt: str) -> str:
    return hashlib.sha256(prompt.strip().lower().encode("utf-8")).hexdigest()


async def call_gemini_api(prompt: str, api_key: str) -> Optional[FirewallIntentIR]:
    """
    Calls Google Gemini API (gemini-2.5-flash or gemini-1.5-flash) with structured JSON output.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [
            {
                "parts": [
                    {"text": f"User Request: {prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Retry with exponential backoff if 429
        for attempt in range(3):
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        ir_dict = json.loads(text_content)
                        return FirewallIntentIR(**ir_dict)
                elif resp.status_code == 429:
                    await asyncio.sleep(2 ** attempt)
                    continue
                else:
                    break
            except Exception:
                await asyncio.sleep(1)
    return None


async def call_ollama(prompt: str, model_name: str = "llama3:8b") -> Optional[FirewallIntentIR]:
    """
    Calls local Ollama instance on http://localhost:11434 with format=json.
    """
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model_name,
        "prompt": f"{SYSTEM_PROMPT}\n\nUser Request: {prompt}",
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_json = json.loads(data.get("response", "{}"))
                return FirewallIntentIR(**raw_json)
    except Exception:
        pass
    return None


async def parse_natural_language_intent(
    prompt: str,
    provider: str = "auto"
) -> Tuple[FirewallIntentIR, str]:
    """
    High-level entrypoint for intent understanding.
    Tries specified provider -> fallback providers -> keyword parser.
    Returns (FirewallIntentIR, provider_used).
    """
    cache_key = hash_prompt(prompt)
    if cache_key in PROMPT_CACHE:
        cached_entry = PROMPT_CACHE[cache_key]
        return FirewallIntentIR(**cached_entry["ir"]), f"{cached_entry['provider']} (cached)"

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # Provider strategy
    if (provider in ("auto", "gemini")) and gemini_key:
        ir = await call_gemini_api(prompt, gemini_key)
        if ir:
            PROMPT_CACHE[cache_key] = {"ir": ir.model_dump(), "provider": "gemini-2.5-flash"}
            return ir, "gemini-2.5-flash"

    if provider in ("auto", "ollama"):
        ir = await call_ollama(prompt)
        if ir:
            PROMPT_CACHE[cache_key] = {"ir": ir.model_dump(), "provider": "ollama"}
            return ir, "ollama"

    # Deterministic fallback (always succeeds and adheres strictly to schema)
    fallback_ir = parse_intent_keywords(prompt)
    if fallback_ir:
        PROMPT_CACHE[cache_key] = {"ir": fallback_ir.model_dump(), "provider": "deterministic-parser"}
        return fallback_ir, "deterministic-parser"

    # Minimal default if completely empty
    default_ir = FirewallIntentIR(
        intent_id="pol_default",
        action="deny",
        source={"type": "zone", "ref": "guest"},
        destination={"type": "service", "ref": "youtube"},
        protocols=[{"proto": "tcp", "port": 443}],
        direction="outbound",
        log=True,
        confidence=0.85,
        explanation="Default guest network protection policy"
    )
    return default_ir, "default-fallback"
