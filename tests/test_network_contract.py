"""Feature 17 network truthfulness tests / Feature 17 路网数据真实性测试。"""

import json
import io
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from google.transit import gtfs_realtime_pb2

from scripts.check_refresh_due import generated_age_seconds
from scripts.refresh_data import (
    REQUEST_BUDGET,
    build_parking_pressure,
    build_safety_context,
    build_spacing_events,
    datasf_records,
    midpoint_percentile_rank,
    parse_alerts,
    parse_road_events,
    parse_static_gtfs,
    parse_trip_predictions,
    road_event_collection,
    source_refresh_due,
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


def test_safety_context_deduplicates_incidents_and_keeps_time_windows() -> None:
    now = datetime.now(timezone.utc)
    recent = (now - timedelta(days=10)).isoformat()
    medium = (now - timedelta(days=60)).isoformat()
    older = (now - timedelta(days=150)).isoformat()
    rows = [
        {"row_id": "ROW-1", "incident_id": "I1", "incident_datetime": recent, "incident_category": "Homicide", "latitude": "37.700", "longitude": "-122.400"},
        {"row_id": "ROW-2", "incident_id": "I1", "incident_datetime": recent, "incident_category": "Homicide", "latitude": "37.700", "longitude": "-122.400"},
        {"incident_id": "I2", "incident_datetime": medium, "incident_category": "Larceny Theft", "latitude": "37.700", "longitude": "-122.400"},
        {"incident_id": "I3", "incident_datetime": older, "incident_category": "Vandalism", "latitude": "37.700", "longitude": "-122.400"},
    ]

    context = build_safety_context(rows)
    cell = context["cells"][0]

    assert context["method_version"] == "3.0"
    assert context["raw_record_count"] == 4
    assert context["deduplicated_record_count"] == 3
    assert cell["reported_incidents_30d_cell"] == 1
    assert cell["reported_incidents_90d_cell"] == 2
    assert cell["reported_incidents_365d_cell"] == 3
    assert cell["severity_weighted_365d_cell"] == 7


def test_safety_percentiles_use_all_muni_stops_as_the_baseline() -> None:
    now = datetime.now(timezone.utc)
    context = build_safety_context(
        [
            {"incident_id": "I1", "incident_datetime": (now - timedelta(days=10)).isoformat(), "incident_category": "Assault", "latitude": "37.700", "longitude": "-122.400"},
            {"incident_id": "I2", "incident_datetime": (now - timedelta(days=80)).isoformat(), "incident_category": "Larceny Theft", "latitude": "37.780", "longitude": "-122.420"},
        ],
        [(37.700, -122.400), (37.780, -122.420), (37.800, -122.450)],
    )

    assert context["method_version"] == "3.0"
    assert context["percentile_baseline"] == "ALL_MUNI_STOPS"
    assert context["baseline_stop_count"] == 3
    assert len(context["stop_context_distribution"]) == 3
    assert context["stop_context_distribution"][0] == 0

    assert midpoint_percentile_rank([0, 0, 0, 0], 0) == 50


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
    assert context["mapping_quality"] == "SUFFICIENT_FOR_RELATIVE_GUIDANCE"
    assert context["recent_3h_transaction_count"] == 2
    assert context["cells"][0]["metered_spaces"] == 2
    assert context["cells"][0]["active_paid_sessions_proxy"] == 2
    assert "does not measure physical occupancy or open spaces" in context["detail"]


def test_parking_renewals_do_not_double_count_one_meter() -> None:
    meters = [{"post_id": "P1", "parking_space_id": "S1", "lat": 37.780, "lon": -122.420}]
    rows = [
        {"post_id": "P1", "session_start_dt": "2026-09-13T12:00:00", "session_end_dt": "2026-09-13T12:30:00"},
        {"post_id": "P1", "session_start_dt": "2026-09-13T12:25:00", "session_end_dt": "2026-09-13T13:00:00"},
    ]

    context = build_parking_pressure(rows, meters)

    assert context["raw_session_count"] == 2
    assert context["deduplicated_session_count"] == 1
    assert context["cells"][0]["active_paid_sessions_proxy"] == 1


def test_parking_ids_are_normalized_but_paystation_sessions_are_not_merged() -> None:
    meters = [{
        "post_id": "614-08090",
        "parking_space_id": "S1",
        "lat": 37.780,
        "lon": -122.420,
        "active_meter_flag": "P",
    }]
    rows = [
        {"post_id": "614 08090", "session_start_dt": "2026-09-13T12:00:00", "session_end_dt": "2026-09-13T12:30:00"},
        {"post_id": "61408090", "session_start_dt": "2026-09-13T12:25:00", "session_end_dt": "2026-09-13T13:00:00"},
    ]

    context = build_parking_pressure(rows, meters)

    assert context["matched_transaction_count"] == 2
    assert context["match_coverage_ratio"] == 1
    assert context["deduplicated_session_count"] == 2
    assert context["multi_space_or_paystation_post_count"] == 1


def test_low_parking_mapping_coverage_is_marked_as_limited_evidence() -> None:
    meters = [{"post_id": "P1", "parking_space_id": "S1", "lat": 37.780, "lon": -122.420}]
    rows = [
        {"post_id": "P1", "session_start_dt": "2026-09-13T12:00:00", "session_end_dt": "2026-09-13T12:30:00"},
        {"post_id": "UNKNOWN", "session_start_dt": "2026-09-13T12:10:00", "session_end_dt": "2026-09-13T12:40:00"},
    ]

    context = build_parking_pressure(rows, meters)

    assert context["match_coverage_ratio"] == 0.5
    assert context["mapping_quality"] == "LIMITED_EVIDENCE"


def test_no_parking_payments_is_not_labeled_low_pressure() -> None:
    meters = [
        {"post_id": "P1", "parking_space_id": "S1", "lat": 37.780, "lon": -122.420},
        {"post_id": "P2", "parking_space_id": "S2", "lat": 37.790, "lon": -122.430},
    ]
    rows = [{"post_id": "P1", "session_start_dt": "2026-09-13T12:00:00", "session_end_dt": "2026-09-13T12:30:00"}]

    context = build_parking_pressure(rows, meters)
    inactive = next(row for row in context["cells"] if row["lat"] == 37.79)

    assert inactive["pressure_label"] == "NO_RECENT_PAID_ACTIVITY"


def test_parking_inventory_contract_allows_stable_row_id_fallback() -> None:
    script = (ROOT / "scripts/refresh_data.py").read_text(encoding="utf-8")

    assert 'row.get("parking_space_id") or row.get(":id")' in script
    assert "POST_ID remains the transaction join key" in script
    assert 'active_flag not in {"M", "P", "T"}' in script


def test_browser_snapshot_loader_keeps_core_transit_when_context_fails() -> None:
    script = (ROOT / "site/app.js").read_text(encoding="utf-8")

    assert "Promise.allSettled" in script
    assert 'status: snapshot ? "retained_client_cache" : "unavailable"' in script
    assert "Using the latest successful update" in script


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


def test_all_spatially_relevant_sf_road_events_are_kept() -> None:
    events = parse_road_events({
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [-122.42, 37.77]},
                "properties": {"event_type": f"Construction {index}"},
            }
            for index in range(25)
        ]
    })

    assert len(events) == 25


def test_open511_geography_field_is_parsed_as_sf_event_location() -> None:
    events = parse_road_events({
        "events": [
            {
                "id": "511.org/example",
                "headline": "Construction on US-101 Northbound",
                "description": "Right lane closed",
                "geography": {"type": "Point", "coordinates": [-122.405, 37.775]},
                "roads": [{"name": "US-101", "direction": "Northbound"}],
            }
        ]
    })

    assert len(events) == 1
    assert events[0]["title"] == "Construction on US-101 Northbound"
    assert events[0]["description"].startswith("US-101 · Right lane closed")
    assert (events[0]["lat"], events[0]["lon"]) == (37.775, -122.405)
    assert events[0]["geometry"] == [[37.775, -122.405]]


def test_road_feed_distinguishes_valid_zero_events_from_unknown_schema() -> None:
    assert road_event_collection({"Events": []}) == []

    with pytest.raises(ValueError, match="no recognized event collection"):
        road_event_collection({"message": "temporary upstream error"})

    with pytest.raises(ValueError, match="is not a list"):
        road_event_collection({"features": {"unexpected": "object"}})


def test_every_production_split_json_has_its_minimum_contract() -> None:
    contracts = {
        "live-transit.json": {"meta", "system", "vehicles", "routes", "trip_predictions"},
        "alerts-roads.json": {"source_status", "alerts", "road_events"},
        "parking-context.json": {"source_status", "parking"},
        "safety-context.json": {"source_status", "safety"},
    }
    for filename, required_keys in contracts.items():
        payload = json.loads((ROOT / "site/data" / filename).read_text(encoding="utf-8"))
        assert required_keys <= payload.keys(), filename

    alerts_roads = json.loads((ROOT / "site/data/alerts-roads.json").read_text(encoding="utf-8"))
    assert {"alerts", "roads"} <= alerts_roads["source_status"].keys()
    assert isinstance(alerts_roads["alerts"], list)
    assert isinstance(alerts_roads["road_events"], list)

    parking = json.loads((ROOT / "site/data/parking-context.json").read_text(encoding="utf-8"))
    assert isinstance(parking["parking"], dict)
    safety = json.loads((ROOT / "site/data/safety-context.json").read_text(encoding="utf-8"))
    assert isinstance(safety["safety"], dict)


def test_refresh_plan_stays_below_default_511_rate_limit() -> None:
    budget = REQUEST_BUDGET

    calculated = (
        budget["core_runs_per_hour"] * budget["core_requests_per_run"]
        + budget["context_runs_per_hour"] * budget["context_extra_requests_per_run"]
    )
    assert calculated == budget["planned_requests_per_hour"] == 48
    assert budget["reserved_requests_per_hour"] == 12
    assert calculated <= budget["default_limit_per_hour"] * 0.8
    assert calculated + budget["reserved_requests_per_hour"] == budget["default_limit_per_hour"] == 60
    assert budget["planned_requests_per_day"] == calculated * 24 + budget["static_requests_per_day"]
    assert budget["published_daily_limit"] is None


def test_cloudflare_drives_three_minutes_and_github_remains_fallback() -> None:
    workflow = (ROOT / ".github/workflows/refresh-data.yml").read_text(encoding="utf-8")

    assert 'cron: "3-59/5 * * * *"' in workflow
    assert "cancel-in-progress: false" in workflow
    assert "github.event_name == 'push' || inputs.force_context == true" in workflow
    assert "check_refresh_due.py --minimum-age-seconds 120" in workflow
    assert "data/parking-inventory.json" in workflow
    assert "data/static-index.json" in workflow
    assert "site/data/live-transit.json" in workflow
    assert "site/data/alerts-roads.json" in workflow
    assert "site/data/parking-context.json" in workflow
    assert "site/data/safety-context.json" in workflow

    static_workflow = (ROOT / ".github/workflows/refresh-static.yml").read_text(encoding="utf-8")
    assert 'cron: "37 11 * * *"' in static_workflow
    assert 'SF_TRANSIT_STATIC_ONLY: "true"' in static_workflow

    watchdog = (ROOT / ".github/workflows/refresh-watchdog.yml").read_text(encoding="utf-8")
    assert 'cron: "11,26,41,56 * * * *"' in watchdog
    assert "check_refresh_health.py --max-age-min 7" in watchdog

    external_watchdog = (ROOT / "cloudflare/refresh-watchdog/worker.js").read_text(encoding="utf-8")
    assert "GITHUB_WORKFLOW_TOKEN" in external_watchdog
    assert "MIN_REFRESH_AGE_SECONDS" in external_watchdog
    assert "actions/workflows" in external_watchdog
    worker_config = (ROOT / "cloudflare/refresh-watchdog/wrangler.jsonc").read_text(encoding="utf-8")
    assert '"1-59/3 * * * *"' in worker_config


def test_browser_polling_does_not_spend_511_quota() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")

    assert "setInterval(() => loadData(), 90 * 1000)" in app
    assert "api.511.org" not in app


def test_duplicate_refresh_gate_uses_generated_snapshot_age(monkeypatch, tmp_path) -> None:
    now = datetime.now(timezone.utc)
    snapshot = tmp_path / "live-transit.json"
    snapshot.write_text(
        json.dumps({"meta": {"generated_at": (now - timedelta(seconds=90)).isoformat()}}),
        encoding="utf-8",
    )
    monkeypatch.setattr("scripts.check_refresh_due.SNAPSHOT_PATH", snapshot)

    assert 89 <= generated_age_seconds(now) <= 91


def test_datasf_app_token_is_sent_only_as_a_header(monkeypatch) -> None:
    captured = {}

    class Response:
        @staticmethod
        def json():
            return []

    def fake_request(url, **kwargs):
        captured.update({"url": url, **kwargs})
        return Response()

    monkeypatch.setenv("SF_TRANSIT_DATASF_APP_TOKEN", "private-test-token")
    monkeypatch.setattr("scripts.refresh_data.request", fake_request)
    assert datasf_records("abcd-1234", "SELECT *", 10) == []
    assert captured["headers"] == {"X-App-Token": "private-test-token"}
    assert "private-test-token" not in str(captured["url"])
    assert "private-test-token" not in str(captured["params"])


def test_slow_sources_use_last_check_time_for_refresh_cadence() -> None:
    now = datetime.now(timezone.utc)
    recent = {"meta": {"source_status": {"parking": {"checked_at": now.isoformat()}}}}
    old = {"meta": {"source_status": {"parking": {"checked_at": (now - timedelta(minutes=31)).isoformat()}}}}

    assert not source_refresh_due(recent, "parking", timedelta(minutes=30))
    assert source_refresh_due(old, "parking", timedelta(minutes=30))


def test_parking_query_uses_datasf_floating_timestamp_format() -> None:
    script = (ROOT / "scripts/refresh_data.py").read_text(encoding="utf-8")

    assert 'replace(tzinfo=None).isoformat(timespec="seconds")' in script


def test_public_beta_removes_misleading_planner_fallbacks() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    page = (ROOT / "site/index.html").read_text(encoding="utf-8")

    assert "renderLegacyJourney" not in app
    assert "planTrip({silent:true})" not in app
    assert 'fetch("data/network.json", {cache:"default"})' in app
    assert "https://tile.openstreetmap.org/{z}/{x}/{y}.png" in app
    assert "Latest predictions + on-device planning · Public Beta" in page
    assert "Report an issue" in page
    assert 'SAFETY_FIRST:"Historical context"' in app and "Not available yet" in app
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
    assert "Know what to take. Know why." in app and "Know what to take. Know why." in page
    assert 'journeyTimeline: "Your trip"' in app


def test_realtime_journey_copy_distinguishes_predictions_from_estimates() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")
    readme_zh = (ROOT / "README.zh.md").read_text(encoding="utf-8")
    readme_en = (ROOT / "README.md").read_text(encoding="utf-8")

    assert "Live arrival prediction" in app
    assert "实时到站预测" in app
    assert "Part live, part estimated" in app
    assert "部分实时，部分估算" in app
    assert "Transfer slack" in app
    assert "换乘余量" in app
    assert "one-minute boarding allowance" in readme_en
    assert "一分钟上车余量" in readme_zh
    assert 'safety_status === "JOURNEY_RELATIVE_CONTEXT"' in app
    assert 'class="timing-badge live"' in app
    assert "renderComparison" in app
    assert "New transit data changed the top option" in app
    assert "不能预测你这次是否安全" in app
    assert "Recent parking activity near your destination" in app
    assert "目的地附近近期停车活动" in app
    assert "cannot tell you how many spaces are open" in app
    assert "Recent cached arrival prediction" in app
    assert "近期缓存的到站预测" in app
    assert "First transit leg now" in app
    assert "首段公交当前移动" in app


def test_safety_context_is_lazy_loaded_after_the_first_screen() -> None:
    app = (ROOT / "site/app.js").read_text(encoding="utf-8")

    assert 'piece.path !== "safety-context.json"' in app
    assert "async function ensureSafetyContext()" in app
    assert "await ensureSafetyContext();" in app
    assert 'contextObserver.observe(contextSection)' in app


def test_ci_validates_every_production_split_json() -> None:
    workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")

    for filename in (
        "live-transit.json",
        "alerts-roads.json",
        "parking-context.json",
        "safety-context.json",
        "refresh-health.json",
    ):
        assert f"python -m json.tool site/data/{filename}" in workflow


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
