"""Feature 16A HTTP boundary tests / Feature 16A HTTP 接口测试。"""

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_health_and_catalog_endpoints() -> None:
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["routes"] >= 60
    assert health.json()["route_directions"] >= 120

    stops = client.get("/stops", params={"q": "4th St & Market", "limit": 10})
    assert stops.status_code == 200
    assert any(row["stop_id"] == "13161" for row in stops.json()["stops"])


def test_plan_trip_endpoint_returns_interactive_payload() -> None:
    response = client.post(
        "/plan-trip",
        json={
            "origin_stop_id": "13161",
            "destination_stop_id": "15659",
            "mode": "BALANCED",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["selected_mode"] == "BALANCED"
    assert payload["alternatives"]
    assert payload["selected_journey_id"]


def test_public_pages_origin_is_allowed() -> None:
    response = client.options(
        "/plan-trip",
        headers={
            "Origin": "https://ksitcode00.github.io",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://ksitcode00.github.io"
