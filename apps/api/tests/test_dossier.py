import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_dossier_analysis_falls_back_without_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Without an API key, dossier analysis returns a sensible fallback — no error."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    response = client.post(
        "/api/dossier/analysis",
        json={
            "prompt": "a mounting bracket",
            "label": "L-Bracket",
            "dimensions": [80, 60, 44],
            "faces": 14,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["material_id"] == "aluminum-6061"
    assert data["material_reasoning"]
    assert data["manufacturing_notes"]
