"""Feature 6 service-disruption archive tests / 服务中断历史归档测试。"""

import csv
import json
from pathlib import Path

from scripts.refresh_data import classify_service_alert, update_service_alert_history


def alert(
    alert_id: str = "SF_100",
    routes: list[str] | None = None,
    title: str = "Stop temporarily moved",
) -> dict:
    return {
        "id": alert_id,
        "route_ids": routes if routes is not None else ["14", "49"],
        "direction_id": None,
        "route_match_status": "MATCHED",
        "title": title,
        "description": "Board at the temporary stop.",
    }


def update(tmp_path: Path, alerts: list[dict], timestamp: str) -> dict:
    return update_service_alert_history(
        alerts,
        timestamp,
        history_path=tmp_path / "service-alert-history.json",
        tableau_path=tmp_path / "feature6_service_disruptions.csv",
    )


def test_history_explodes_routes_and_updates_one_episode(tmp_path: Path) -> None:
    update(tmp_path, [alert()], "2026-09-18T08:00:00+00:00")
    history = update(tmp_path, [alert()], "2026-09-18T08:15:00+00:00")

    assert history["summary"]["episode_count"] == 2
    assert history["summary"]["active_episode_count"] == 2
    assert {row["route_id"] for row in history["records"]} == {"14", "49"}
    assert all(row["duration_hours"] == 0.25 for row in history["records"])
    assert all(row["observation_count"] == 2 for row in history["records"])


def test_missing_alert_closes_episode_and_reappearance_starts_new_one(tmp_path: Path) -> None:
    update(tmp_path, [alert(routes=["14"])], "2026-09-18T08:00:00+00:00")
    closed = update(tmp_path, [], "2026-09-18T08:15:00+00:00")

    first = closed["records"][0]
    assert first["active_flag"] is False
    assert first["last_seen"] == "2026-09-18T08:00:00+00:00"
    assert first["inactive_detected_at"] == "2026-09-18T08:15:00+00:00"

    reopened = update(tmp_path, [alert(routes=["14"])], "2026-09-18T08:30:00+00:00")
    assert len(reopened["records"]) == 2
    assert [row["occurrence_index"] for row in reopened["records"]] == [1, 2]
    assert [row["active_flag"] for row in reopened["records"]] == [False, True]


def test_history_writes_tableau_csv_with_requested_fields(tmp_path: Path) -> None:
    update(tmp_path, [alert(routes=["30"], title="Route 30 reroute")], "2026-09-18T08:00:00Z")

    rows = list(csv.DictReader((tmp_path / "feature6_service_disruptions.csv").open(encoding="utf-8")))
    assert len(rows) == 1
    assert rows[0]["route_id"] == "30"
    assert rows[0]["alert_type"] == "REROUTE"
    assert rows[0]["first_seen"] == "2026-09-18T08:00:00+00:00"
    assert json.loads((tmp_path / "service-alert-history.json").read_text())["schema_version"] == 1


def test_service_alert_classification_is_explicit_and_conservative() -> None:
    assert classify_service_alert("Route 1 reroute", "") == "REROUTE"
    assert classify_service_alert("Stop closed", "") == "STOP_CLOSED"
    assert classify_service_alert("Stop temporarily moved", "") == "STOP_MOVED"
    assert classify_service_alert("Stop permanently moved", "") == "STOP_MOVED"
    assert classify_service_alert("Information", "Expect crowding") == "SERVICE_NOTICE"
