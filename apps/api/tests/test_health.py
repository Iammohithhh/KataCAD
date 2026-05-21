from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "katacad-api",
        "version": "0.1.0",
    }


def test_echo_returns_received_message() -> None:
    response = client.post("/api/echo", json={"message": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["received"] == "hello"
    assert data["service"] == "katacad-api"
