"""Feature 17 network truthfulness tests / Feature 17 路网数据真实性测试。"""

import json
import io
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from google.transit import gtfs_realtime_pb2

from scripts.refresh_data import (
    build_parking_pressure,
    build_safety_context,
    build_spacing_events,
    parse_alerts,
    parse_road_events,
    parse_static_gtfs,
    parse_trip_predictions,
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
        assert not any(
            error.startswith("511 refresh failed")
            for error in snapshot["meta"]["errors"]
        )
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


def test_trip_predictions_keep_concrete_trip_and_stop_times() -> None:
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.header.gtfs_realtime_version = "2.0"
    feed.header.timestamp = now_epoch
    entity = feed.entity.add()
    entity.id = "prediction-1"
    update = entity.trip_update
    update.trip.trip_id = "trip-1"
    update.vehicle.id = "vehicle-1"
    update.timestamp = now_epoch
    board = update.stop_time_update.add()
    board.stop_id = "A"
    board.stop_sequence = 1
    board.departure.time = now_epoch + 300
    alight = update.stop_time_update.add()
    alight.stop_id = "B"
    alight.stop_sequence = 2
    alight.arrival.time = now_epoch + 900

    rows = parse_trip_predictions(
        feed,
        {
            "trip-1": {
                "route_id": "R",
                "direction_id": "0",
                "shape_id": "shape-R-0",
            }
        },
    )

    assert len(rows) == 1
    assert rows[0]["trip_id"] == "trip-1"
    assert rows[0]["shape_id"] == "shape-R-0"
    assert rows[0]["vehicle_id"] == "vehicle-1"
    assert rows[0]["stops"] == [
        {
            "stop_id": "A",
            "stop_sequence": 1,
            "arrival_time": None,
            "departure_time": now_epoch + 300,
        },
        {
            "stop_id": "B",
            "stop_sequence": 2,
            "arrival_time": now_epoch + 900,
            "departure_time": None,
        },
    ]


def test_safety_context_aggregates_locations_without_labeling_places_safe() -> None:
    context = build_safety_context(
        [
            {"latitude": "37.700", "longitude": "-122.400", "incident_count": "2"},
            {"latitude": "37.701", "longitude": "-122.400", "incident_count": "5"},
            {"latitude": "37.780", "longitude": "-122.420", "incident_count": "20"},
        ]
    )

    assert context["status"] == "JOURNEY_RELATIVE_CONTEXT"
    assert context["lookback_days"] == 365
    assert len(context["cells"]) == 3
    assert all("relative_percentile" in row for row in context["cells"])
    assert "not a crime forecast or safe/unsafe label" in context["detail"]


def test_parking_pressure_uses_paid_sessions_without_claiming_open_spaces() -> None:
    meters = [
        {"post_id": "P1", "parking_space_id": "S1", "lat": 37.780, "lon": -122.420},
        {"post_id": "P2", "parking_space_id": "S2", "lat": 37.780, "lon": -122.420},
    ]
    rows = [
        {
            "post_id": "P1",
            "session_start_dt": "2026-09-13T12:00:00",
            "session_end_dt": "2026-09-13T13:00:00",
            "street_block": "100 Market St",
        },
        {
            "post_id": "P2",
            "session_start_dt": "2026-09-13T12:20:00",
            "session_end_dt": "2026-09-13T13:20:00",
            "street_block": "100 Market St",
        },
    ]

    context = build_parking_pressure(rows, meters)

    assert context["status"] == "DESTINATION_PAID_PARKING_PRESSURE"
    assert context["matched_transaction_count"] == 2
    assert context["recent_3h_transaction_count"] == 2
    assert context["cells"][0]["metered_spaces"] == 2
    assert context["cells"][0]["active_paid_sessions_proxy"] == 2
    assert "does not measure physical occupancy or open spaces" in context["detail"]


def test_parking_inventory_contract_allows_stable_row_id_fallback() -> None:
    script = (ROOT / "scripts/refresh_data.py").read_text(encoding="utf-8")

    assert 'row.get("parking_space_id") or row.get(":id")' in script
    assert "POST_ID remains the transaction join key" in script


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
    assert event["geometry"] == [[37.77, -122.42]]


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
    assert "site/data/parking-inventory.json" in workflow
    assert 'github.event_name == \'push\'' in workflow


def test_public_beta_removes_misleading_planner_fallbacks() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    page = (ROOT / "site/index.html").read_text(encoding="utf-8")

    assert "renderLegacyJourney" not in app
    assert "planTrip({silent:true})" not in app
    assert 'fetch("data/network.json", {cache:"default"})' in app
    assert "https://tile.openstreetmap.org/{z}/{x}/{y}.png" in app
    assert "Live predictions + estimates · Public Beta" in page
    assert "Report an issue" in page
    assert 'SAFETY_FIRST:"Safety-first"' in app and "Not available yet" in app
    assert "What we check before recommending a trip" in page
    assert all(step in page for step in ("Collect current updates", "Check each route direction", "Build trips you may be able to make", "Compare what matters to you", "Explain the recommendation"))


def test_rider_facing_copy_uses_plain_language_in_both_languages() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    page = (ROOT / "site/index.html").read_text(encoding="utf-8")
    public_copy = app + page

    assert "Compare routes" in public_copy
    assert "比较路线" in public_copy
    assert "Vehicles close together" in public_copy
    assert "几辆车挤在一起" in public_copy
    assert "Arrival estimates checked" in public_copy
    assert "已查看的到站信息" in public_copy
    assert "Median predicted gap" not in public_copy
    assert "线路脉搏" not in public_copy
    assert "Pareto efficient" not in public_copy
    assert "advice.label, advice.code" not in app


def test_unknown_vehicle_positions_are_separated_from_route_results() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    page = (ROOT / "site/index.html").read_text(encoding="utf-8")

    assert 'routeId !== "UNKNOWN" && knownRouteIds.has(routeId)' in app
    assert "vehicleCoverage().mapped.filter" in app
    assert 'id="unassigned-count"' in page
    assert "live positions not assigned to a route" in page
    assert "leave them off the map and out of route analysis" in app
    assert "Know your next move." in app and "Know your next move." in page
    assert 'journeyTimeline: "Your trip"' in app


def test_realtime_journey_copy_distinguishes_predictions_from_estimates() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    readme_zh = (ROOT / "README.md").read_text(encoding="utf-8")
    readme_en = (ROOT / "README.en.md").read_text(encoding="utf-8")

    assert "Live arrival prediction" in app
    assert "实时到站预测" in app
    assert "Part live, part estimated" in app
    assert "部分实时，部分估算" in app
    assert "Transfer slack" in app
    assert "换乘余量" in app
    assert "one-minute boarding allowance" in readme_en
    assert "一分钟上车余量" in readme_zh
    assert 'safety_status === "JOURNEY_RELATIVE_CONTEXT"' in app
    assert "不能预测你这次是否安全" in app
    assert "Parking near your destination" in app
    assert "目的地附近停车情况" in app
    assert "cannot tell you how many spaces are open" in app


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
