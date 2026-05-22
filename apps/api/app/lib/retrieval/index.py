"""Load the Layer 3 retrieval index and run nearest-neighbour search.

The index is a FAISS store of CLIP image embeddings for the curated parts;
a prompt is embedded with CLIP's text encoder into the same space. The FAISS
index, the parts list, and the CLIP model are loaded lazily on first use.
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("uvicorn.error")

# index/ lives at apps/api/index/ (this file is apps/api/app/lib/retrieval/).
_INDEX_DIR = Path(__file__).resolve().parents[3] / "index"
_FAISS_PATH = _INDEX_DIR / "gencad.faiss"
_PARTS_PATH = _INDEX_DIR / "parts.jsonl"

CLIP_MODEL = "clip-ViT-B-32"

_index: Any = None
_parts: list[dict] | None = None
_model: Any = None


def index_available() -> bool:
    """True when the curated index has been built and committed."""
    return _FAISS_PATH.exists() and _PARTS_PATH.exists()


def _ensure_loaded() -> None:
    global _index, _parts, _model
    if _index is None:
        import faiss

        _index = faiss.read_index(str(_FAISS_PATH))
    if _parts is None:
        lines = _PARTS_PATH.read_text(encoding="utf-8").splitlines()
        _parts = [json.loads(line) for line in lines if line.strip()]
    if _model is None:
        from sentence_transformers import SentenceTransformer

        logger.info("loading CLIP model for retrieval (%s)", CLIP_MODEL)
        _model = SentenceTransformer(CLIP_MODEL)


def retrieve(prompt: str, k: int = 3) -> list[dict]:
    """Return up to `k` candidate parts, ranked by similarity to the prompt."""
    _ensure_loaded()
    import numpy as np

    embedding = _model.encode([prompt], normalize_embeddings=True)
    query = np.asarray(embedding, dtype="float32")
    _scores, indices = _index.search(query, k)

    parts = _parts or []
    return [parts[idx] for idx in indices[0] if 0 <= idx < len(parts)]
