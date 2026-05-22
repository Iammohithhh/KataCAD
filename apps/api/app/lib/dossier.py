"""Dossier analysis — AI material selection and manufacturing notes.

`analyze` never raises: a missing key, an API error, or a malformed response
all resolve to a sensible fallback.
"""

import json
import logging
import os
from pathlib import Path

from app.schemas.dossier import DossierAnalysis, DossierRequest

logger = logging.getLogger("uvicorn.error")

_PROMPTS = Path(__file__).resolve().parent.parent / "prompts"
MATERIAL_PROMPT = (_PROMPTS / "material.txt").read_text(encoding="utf-8")
MANUFACTURING_PROMPT = (_PROMPTS / "manufacturing.txt").read_text(encoding="utf-8")

DEFAULT_MODEL = "gpt-4o-mini"
FALLBACK_MATERIAL = "aluminum-6061"

# Must match the ids in apps/web/lib/materials/catalogue.json.
MATERIAL_IDS = {
    "aluminum-6061",
    "aluminum-7075",
    "steel-1045",
    "steel-a36",
    "steel-4140",
    "stainless-304",
    "stainless-316",
    "tool-steel-a2",
    "titanium-ti6al4v",
    "cast-iron-gray",
    "brass-c360",
    "bronze-c932",
    "copper-c110",
    "magnesium-az31",
    "abs",
    "nylon-6",
    "acetal-delrin",
    "polycarbonate",
    "peek",
    "pla",
}

_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI

        _client = OpenAI(timeout=12.0)
    return _client


def _part_summary(request: DossierRequest) -> str:
    if len(request.dimensions) == 3:
        dims = " x ".join(f"{value:.0f}" for value in request.dimensions)
    else:
        dims = "unknown"
    return (
        f"Part: {request.label}\n"
        f"Original request: {request.prompt}\n"
        f"Bounding box: {dims} mm\n"
        f"Face count: {request.faces}"
    )


def _fallback(reason: str) -> DossierAnalysis:
    logger.warning("dossier analysis fallback (%s)", reason)
    return DossierAnalysis(
        material_id=FALLBACK_MATERIAL,
        material_reasoning=(
            "Aluminum 6061-T6 is a sound general-purpose choice: a strong "
            "strength-to-weight ratio, good machinability, and wide availability."
        ),
        manufacturing_notes=(
            "Machine from billet on a 3-axis mill. General tolerances per "
            "ISO 2768-m apply; deburr all edges and break sharp corners before "
            "inspection."
        ),
    )


def _chat_json(system_prompt: str, user_prompt: str) -> dict:
    response = _get_client().chat.completions.create(
        model=os.getenv("OPENAI_MODEL", DEFAULT_MODEL),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    content = response.choices[0].message.content
    return json.loads(content) if content else {}


def analyze(request: DossierRequest) -> DossierAnalysis:
    """Pick a material and write manufacturing notes for a part. Never raises."""
    if not os.getenv("OPENAI_API_KEY"):
        return _fallback("OPENAI_API_KEY not set")

    summary = _part_summary(request)
    try:
        material = _chat_json(MATERIAL_PROMPT, summary)
        manufacturing = _chat_json(MANUFACTURING_PROMPT, summary)
    except Exception as exc:
        return _fallback(f"{type(exc).__name__}: {exc}")

    material_id = material.get("material")
    if material_id not in MATERIAL_IDS:
        material_id = FALLBACK_MATERIAL

    reasoning = str(material.get("reasoning") or "").strip()
    notes = str(manufacturing.get("notes") or "").strip()
    if not reasoning or not notes:
        return _fallback("incomplete model response")

    return DossierAnalysis(
        material_id=material_id,
        material_reasoning=reasoning,
        manufacturing_notes=notes,
    )
