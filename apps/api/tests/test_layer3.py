import base64
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.lib.retrieval.executor import is_sane, scaled_model, semantic_tree, try_execute
from app.lib.retrieval.index import index_available
from app.main import app

client = TestClient(app)

_PARTS_PATH = Path(__file__).resolve().parents[1] / "index" / "parts.jsonl"


def _sample_code() -> str:
    first_line = _PARTS_PATH.read_text(encoding="utf-8").splitlines()[0]
    return json.loads(first_line)["cadquery"]


@pytest.mark.skipif(not _PARTS_PATH.exists(), reason="retrieval index not built")
def test_executor_round_trip() -> None:
    """A curated part re-executes, scales to target size, and parses to a tree."""
    code = _sample_code()

    solid = try_execute(code)
    assert solid is not None
    assert is_sane(solid)

    model = scaled_model(solid, 150.0)
    box = model.val().BoundingBox()
    assert max(box.xlen, box.ylen, box.zlen) == pytest.approx(150.0, rel=0.01)

    tree = semantic_tree(code)
    assert tree.name == "retrieved_part"
    assert len(tree.children) >= 1


@pytest.mark.skipif(not index_available(), reason="retrieval index not built")
def test_layer3_endpoint_returns_step() -> None:
    """The Layer 3 endpoint retrieves a part and returns a valid STEP."""
    response = client.post("/api/generate/layer3", json={"prompt": "a bracket with mounting holes"})
    assert response.status_code == 200

    data = response.json()
    step = base64.b64decode(data["step_b64"])
    assert step[:13] == b"ISO-10303-21;"
    assert data["metadata"]["archetype"] == "retrieved"
    assert len(data["metadata"]["bounding_box"]) == 3
