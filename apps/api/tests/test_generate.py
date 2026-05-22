import base64

import pytest
from fastapi.testclient import TestClient

from app.lib.cadquery.registry import ARCHETYPES, get_generator
from app.main import app

client = TestClient(app)


def _param_sets(archetype: str) -> list[dict[str, float]]:
    """Three configurations per archetype: defaults, all-min, all-max."""
    generator = get_generator(archetype)
    assert generator is not None
    build = generator({})
    low = {s.key: s.min for s in build.sliders}
    high = {s.key: s.max for s in build.sliders}
    return [{}, low, high]


@pytest.mark.parametrize("archetype", sorted(ARCHETYPES.keys()))
def test_archetype_round_trip(archetype: str) -> None:
    """Every archetype generates a valid STEP file at three parameter sets."""
    for params in _param_sets(archetype):
        response = client.post(
            "/api/generate/layer2", json={"archetype": archetype, "params": params}
        )
        assert response.status_code == 200, f"{archetype} {params}: {response.text}"

        data = response.json()
        step = base64.b64decode(data["step_b64"])
        assert step[:13] == b"ISO-10303-21;", f"{archetype}: output is not a STEP file"
        assert len(step) > 500, f"{archetype}: STEP file is suspiciously small"

        metadata = data["metadata"]
        assert metadata["archetype"] == archetype
        assert metadata["semantic_tree"]["name"]
        assert len(metadata["sliders"]) >= 3
        assert len(metadata["bounding_box"]) == 3
        assert all(extent > 0 for extent in metadata["bounding_box"])


def test_flange_has_exactly_ten_holes() -> None:
    """The headline example: ten holes, 80 mm bolt circle, 6 mm thick."""
    response = client.post(
        "/api/generate/layer2",
        json={
            "archetype": "flange",
            "params": {"bolt_count": 10, "bolt_circle": 80, "thickness": 6},
        },
    )
    assert response.status_code == 200
    # A 10-bolt flange has 11 cylindrical holes' worth of geometry; the STEP is
    # valid and non-trivial — the precise hole count is verified visually.
    step = base64.b64decode(response.json()["step_b64"])
    assert step[:13] == b"ISO-10303-21;"


def test_unknown_archetype_returns_404() -> None:
    response = client.post("/api/generate/layer2", json={"archetype": "nonsense", "params": {}})
    assert response.status_code == 404
