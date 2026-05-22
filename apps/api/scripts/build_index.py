"""One-time build of the Layer 3 retrieval index from GenCAD-Code.

Streams the CADCODER/GenCAD-Code dataset, curates ~500 clean mechanical parts
(filtering on code length, execution success, and bounding-box sanity),
embeds each part's image with CLIP, and writes the FAISS index plus parts list.

Run from apps/api with the [index] extra installed:
    .venv/Scripts/python.exe scripts/build_index.py
"""

import json
from pathlib import Path

import datasets
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from app.lib.retrieval.executor import is_sane, try_execute
from app.lib.retrieval.index import CLIP_MODEL

TARGET_COUNT = 500
MIN_TOKENS = 400
MAX_TOKENS = 3000
MAX_SCAN = 6000

_INDEX_DIR = Path(__file__).resolve().parents[1] / "index"


def main() -> None:
    print("loading GenCAD-Code (streaming)...")
    dataset = datasets.load_dataset("CADCODER/GenCAD-Code", split="train", streaming=True)
    model = SentenceTransformer(CLIP_MODEL)

    parts: list[dict[str, str]] = []
    images: list[object] = []
    scanned = 0

    for row in dataset:
        if scanned >= MAX_SCAN or len(parts) >= TARGET_COUNT:
            break
        scanned += 1

        token_count = row.get("token_count") or 0
        if not MIN_TOKENS <= token_count <= MAX_TOKENS:
            continue

        code = row["cadquery"]
        solid = try_execute(code)
        if solid is None or not is_sane(solid):
            continue

        parts.append({"id": str(row["deepcad_id"]), "cadquery": code})
        images.append(row["image"])
        if len(parts) % 50 == 0:
            print(f"  curated {len(parts)} parts (scanned {scanned})")

    print(f"curated {len(parts)} parts from {scanned} scanned rows. embedding images...")
    embeddings = model.encode(
        images, normalize_embeddings=True, batch_size=32, show_progress_bar=True
    )
    embeddings = np.asarray(embeddings, dtype="float32")

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    _INDEX_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(_INDEX_DIR / "gencad.faiss"))
    with open(_INDEX_DIR / "parts.jsonl", "w", encoding="utf-8") as handle:
        for part in parts:
            handle.write(json.dumps(part) + "\n")

    print(f"wrote {_INDEX_DIR} — {len(parts)} parts, {embeddings.shape[1]}-d embeddings")


if __name__ == "__main__":
    main()
