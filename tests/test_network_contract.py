"""Feature 17 network truthfulness tests / Feature 17 路网数据真实性测试。"""

import json
from collections import Counter
from pathlib import Path

from google.transit import gtfs_realtime_pb2

from scripts.refresh_data import build_spacing_events, parse_alerts, parse_road_events


ROOT = Path(__file__).resolve().parents[1]


def test_spacing_events_keep_location_scope_explicit() -> None:
    events = build_spacing_events(
        [0, 120, 600, 2400],
        "stop-1",
        {
            "stop-1": {
                "name": "Geary Blvd & Fillmore St",
                "lat": 37.784,
                "lon": -122.433,
            }
        },
    )

    assert {event["type"] for event in events} == {"BUNCHING", "SEVERE_GAP"}
    assert all(event["observation_scope"] == "PREDICTION_REFERENCE_STOP" for event in events)
    assert all(event["location_name"] == "Geary Blvd & Fillmore St" for event in events)


def test_checked_in_snapshot_separates_positions_from_predictions() -> None:
    snapshot = json.loads((ROOT / "site/data/latest.json").read_text(encoding="utf-8"))
    position_counts = Counter(
        (str(row["route_id"]), str(row["direction_id"]))
        for row in snapshot["vehicles"]
    )

    for row in snapshot["routes"]:
        key = (str(row["route_id"]), str(row["direction_id"]))
        assert row["vehicle_count"] == position_counts[key]
        assert "predictions_observed" in row


def test_unmatched_events_are_labeled_instead_of_silently_route_filtered() -> None:
    snapshot = json.loads((ROOT / "site/data/latest.json").read_text(encoding="utf-8"))

    assert snapshot["meta"]["source_status"]["transit"]["status"] == "retained_sample"
    assert all("route_ids" in row and "route_match_status" in row for row in snapshot["alerts"])
    assert all("route_ids" in row and "route_match_status" in row for row in snapshot["road_events"])


def test_live_alert_contract_keeps_route_and_direction() -> None:
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.header.gtfs_realtime_version = "2.0"
    entity = feed.entity.add()
    entity.id = "alert-5-inbound"
    selector = entity.alert.informed_entity.add()
    selector.route_id = "5"
    selector.direction_id = 1
    entity.alert.header_text.translation.add(text="Route 5 notice", language="en")

    alert = parse_alerts(feed)[0]

    assert alert["route_ids"] == ["5"]
    assert alert["direction_id"] == "1"
    assert alert["route_match_status"] == "MATCHED"


def test_road_event_without_transit_match_remains_explicit_context() -> None:
    event = parse_road_events(
        {
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [-122.42, 37.77]},
                    "properties": {"event_type": "Construction", "description": "Lane closure"},
                }
            ]
        }
    )[0]

    assert event["route_ids"] == []
    assert event["route_match_status"] == "UNAVAILABLE"
    assert (event["lat"], event["lon"]) == (37.77, -122.42)
