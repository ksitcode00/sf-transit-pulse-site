"""Feature 17 network truthfulness tests / Feature 17 路网数据真实性测试。"""

import json
import io
import zipfile
from collections import Counter
from pathlib import Path

from google.transit import gtfs_realtime_pb2

from scripts.refresh_data import (
    build_spacing_events,
    parse_alerts,
    parse_road_events,
    parse_static_gtfs,
)


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

    transit_status = snapshot["meta"]["source_status"]["transit"]["status"]
    assert transit_status in {"live", "retained_sample"}
    if transit_status == "live":
        assert snapshot["meta"]["errors"] == []
        assert not any(str(row.get("vehicle_id", "")).startswith("demo-") for row in snapshot["vehicles"])
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


def test_refresh_plan_stays_below_default_511_rate_limit() -> None:
    snapshot = json.loads((ROOT / "site/data/latest.json").read_text(encoding="utf-8"))
    budget = snapshot["meta"]["request_budget"]

    calculated = (
        budget["core_runs_per_hour"] * budget["core_requests_per_run"]
        + budget["context_runs_per_hour"] * budget["context_extra_requests_per_run"]
    )
    assert calculated == budget["planned_requests_per_hour"] == 44
    assert calculated < budget["default_limit_per_hour"] == 60


def test_workflow_runs_core_every_five_minutes_and_context_every_fifteen() -> None:
    workflow = (ROOT / ".github/workflows/refresh-data.yml").read_text(encoding="utf-8")

    assert 'cron: "3,18,33,48 * * * *"' in workflow
    assert 'cron: "8,13,23,28,38,43,53,58 * * * *"' in workflow
    assert "SF_TRANSIT_REFRESH_CONTEXT" in workflow


def test_public_beta_removes_misleading_planner_fallbacks() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    page = (ROOT / "site/index.html").read_text(encoding="utf-8")

    assert "renderLegacyJourney" not in app
    assert "planTrip({silent:true})" not in app
    assert 'fetch("data/network.json", {cache:"default"})' in app
    assert "https://tile.openstreetmap.org/{z}/{x}/{y}.png" in app
    assert "Estimated planner · Public Beta" in page
    assert "Report an issue" in page


def test_static_gtfs_keeps_multiple_patterns_per_route_direction() -> None:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(
            "routes.txt",
            "route_id,route_short_name,route_long_name,route_type\nR,R,Route R,3\n",
        )
        archive.writestr(
            "trips.txt",
            "route_id,service_id,trip_id,direction_id,trip_headsign,shape_id\n"
            "R,WK,t-long,0,Downtown,s-long\n"
            "R,WK,t-short,0,Short turn,s-short\n",
        )
        archive.writestr(
            "stops.txt",
            "stop_id,stop_name,stop_lat,stop_lon\n"
            "A,Alpha,37.70,-122.40\nB,Beta,37.71,-122.41\n"
            "C,Charlie,37.72,-122.42\nD,Delta,37.73,-122.43\n",
        )
        archive.writestr(
            "shapes.txt",
            "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled\n"
            "s-long,37.70,-122.40,1,0\ns-long,37.73,-122.43,2,4000\n"
            "s-short,37.70,-122.40,1,0\ns-short,37.72,-122.42,2,2500\n",
        )
        archive.writestr(
            "stop_times.txt",
            "trip_id,stop_id,stop_sequence\n"
            "t-long,A,1\nt-long,B,2\nt-long,C,3\nt-long,D,4\n"
            "t-short,A,1\nt-short,B,2\nt-short,C,3\n",
        )
    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        network = parse_static_gtfs(archive)["network"]

    assert network["meta"]["route_direction_count"] == 1
    assert network["meta"]["pattern_count"] == 2
    assert set(network["patterns"]) == {"R|0|s-long", "R|0|s-short"}
