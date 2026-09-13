"""Feature 16A contract tests / Feature 16A 数据契约测试。"""

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from backend.planner import (
    ACCESS_RADIUS_M,
    TRANSFER_RADIUS_M,
    WALK_SPEED_M_PER_MIN,
    PlannerEngine,
    PlannerError,
)


ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="module")
def engine() -> PlannerEngine:
    return PlannerEngine.from_files(
        ROOT / "site/data/network.json",
        ROOT / "site/data/latest.json",
    )


def test_catalog_covers_public_network(engine: PlannerEngine) -> None:
    assert len(engine.list_routes()) == engine.network["meta"]["route_count"]
    expected_patterns = engine.network["meta"].get(
        "pattern_count", engine.network["meta"]["route_direction_count"]
    )
    assert len(engine.patterns) == expected_patterns
    assert len(engine.patterns) >= engine.network["meta"]["route_direction_count"]
    assert len(engine.stops) > 1_000


def test_reference_journey_returns_shared_mode_contract(engine: PlannerEngine) -> None:
    result = engine.plan("13161", "15659", "BALANCED")
    assert result["origin"]["name"] == "4th St & Market St"
    assert result["destination"]["name"] == "Market St & Buchanan St"
    assert {row["mode"] for row in result["modes"]} == {
        "FASTEST",
        "BALANCED",
        "SAFETY_FIRST",
    }
    assert result["alternatives"]
    assert result["selected_journey_id"] in {
        row["journey_id"] for row in result["alternatives"]
    }


def test_mode_changes_ranking_not_actual_eta(engine: PlannerEngine) -> None:
    fastest = engine.plan("13161", "15659", "FASTEST")
    balanced = engine.plan("13161", "15659", "BALANCED")
    fastest_eta = {
        row["journey_id"]: row["eta_min"] for row in fastest["alternatives"]
    }
    balanced_eta = {
        row["journey_id"]: row["eta_min"] for row in balanced["alternatives"]
    }
    assert fastest_eta.keys() == balanced_eta.keys()
    assert all(
        fastest_eta[journey_id] == pytest.approx(balanced_eta[journey_id], abs=0.2)
        for journey_id in fastest_eta
    )


def test_same_stop_is_rejected(engine: PlannerEngine) -> None:
    with pytest.raises(PlannerError):
        engine.plan("13161", "13161")


def test_public_beta_uses_the_qa_validated_walking_policy() -> None:
    assert ACCESS_RADIUS_M == 250.0
    assert TRANSFER_RADIUS_M == 180.0
    assert WALK_SPEED_M_PER_MIN == 75.0


def _realtime_test_engine(
    *, transfer: bool, safety: bool = False, parking: bool = False
) -> PlannerEngine:
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    stops = {
        "A": {"stop_id": "A", "name": "Alpha", "lat": 37.700, "lon": -122.400},
        "X": {"stop_id": "X", "name": "Exchange", "lat": 37.710, "lon": -122.400},
        "D": {"stop_id": "D", "name": "Delta", "lat": 37.720, "lon": -122.400},
    }
    patterns = {
        "R1|0|s1": {
            "route_id": "R1",
            "direction_id": "0",
            "shape_id": "s1",
            "headsign": "Exchange",
            "shape": [[37.700, -122.400], [37.710, -122.400]],
            "stops": [stops["A"], stops["X"]],
        }
    }
    routes = [{"route_id": "R1", "route_type": "3"}]
    predictions = [
        {
            "trip_id": "trip-1",
            "route_id": "R1",
            "direction_id": "0",
            "shape_id": "s1",
            "vehicle_id": "vehicle-1",
            "update_timestamp": now_epoch,
            "stops": [
                {"stop_id": "A", "stop_sequence": 1, "departure_time": now_epoch + 300},
                {"stop_id": "X", "stop_sequence": 2, "arrival_time": now_epoch + 600},
            ],
        }
    ]
    if transfer:
        patterns["R2|0|s2"] = {
            "route_id": "R2",
            "direction_id": "0",
            "shape_id": "s2",
            "headsign": "Delta",
            "shape": [[37.710, -122.400], [37.720, -122.400]],
            "stops": [stops["X"], stops["D"]],
        }
        routes.append({"route_id": "R2", "route_type": "3"})
        predictions.append(
            {
                "trip_id": "trip-2",
                "route_id": "R2",
                "direction_id": "0",
                "shape_id": "s2",
                "vehicle_id": "vehicle-2",
                "update_timestamp": now_epoch,
                "stops": [
                    {"stop_id": "X", "stop_sequence": 1, "departure_time": now_epoch + 780},
                    {"stop_id": "D", "stop_sequence": 2, "arrival_time": now_epoch + 1200},
                ],
            }
        )
    network = {
        "meta": {"route_count": len(routes), "route_direction_count": len(patterns), "pattern_count": len(patterns)},
        "routes": routes,
        "route_directions": {},
        "patterns": patterns,
    }
    safety_payload = {
        "status": "JOURNEY_RELATIVE_CONTEXT",
        "lookback_days": 365,
        "cells": [
            {"lat": 37.700, "lon": -122.400, "reported_incidents_365d_cell": 2, "reported_incidents_365d_nearby": 2},
            {"lat": 37.710, "lon": -122.400, "reported_incidents_365d_cell": 8, "reported_incidents_365d_nearby": 8},
            {"lat": 37.720, "lon": -122.400, "reported_incidents_365d_cell": 20, "reported_incidents_365d_nearby": 20},
        ],
    } if safety else {}
    parking_payload = {
        "status": "DESTINATION_PAID_PARKING_PRESSURE",
        "cells": [
            {
                "lat": 37.720,
                "lon": -122.400,
                "metered_spaces": 10,
                "active_paid_sessions_proxy": 7,
                "paid_session_pressure_ratio": 0.7,
                "starts_15m": 2,
                "starts_30m": 4,
                "starts_60m": 6,
                "previous_30m_starts": 1,
            },
            {
                "lat": 37.730,
                "lon": -122.430,
                "metered_spaces": 10,
                "active_paid_sessions_proxy": 2,
                "paid_session_pressure_ratio": 0.2,
                "starts_15m": 0,
                "starts_30m": 1,
                "starts_60m": 2,
                "previous_30m_starts": 1,
            },
        ],
    } if parking else {}
    realtime = {
        "meta": {"status": "live"},
        "routes": [],
        "vehicles": [],
        "trip_predictions": predictions,
        "safety": safety_payload,
        "parking": parking_payload,
    }
    return PlannerEngine(network, realtime)


def test_direct_journey_uses_concrete_trip_prediction() -> None:
    result = _realtime_test_engine(transfer=False).plan("A", "X", "FASTEST")
    journey = result["alternatives"][0]

    assert result["meta"]["eta_status"] == "REALTIME_TRIP_PREDICTION"
    assert journey["eta_status"] == "REALTIME_TRIP_PREDICTION"
    assert journey["legs"][1]["trip_id"] == "trip-1"
    assert journey["legs"][2]["predicted_arrival"]


def test_transfer_uses_two_trips_and_calculates_catch_slack() -> None:
    result = _realtime_test_engine(transfer=True).plan("A", "D", "BALANCED")
    journey = next(row for row in result["alternatives"] if row["route_sequence"] == "R1 → R2")

    assert journey["eta_status"] == "REALTIME_TRIP_PREDICTION"
    assert journey["transfer"]["catchability"] == "TIGHT"
    assert journey["transfer"]["catch_slack_min"] == pytest.approx(2.0, abs=0.1)
    assert journey["transfer"]["first_trip_arrival"]
    assert journey["transfer"]["second_trip_departure"]
    assert [leg.get("trip_id") for leg in journey["legs"] if leg["type"] == "RIDE"] == [
        "trip-1",
        "trip-2",
    ]


def test_leg_disruption_requires_slowdown_and_road_match_for_corroboration() -> None:
    engine = _realtime_test_engine(transfer=False)
    engine.vehicle_speeds[("R1", "0")] = 4.0
    engine.realtime["road_events"] = [
        {
            "title": "Road work near Exchange",
            "route_ids": [],
            "geometry": [[37.705, -122.400]],
        }
    ]
    pattern = engine.pattern_by_key["R1|0|s1"]

    context = engine._leg_disruption(pattern, engine.stops["A"], engine.stops["X"])

    assert context["movement_status"] == "SLOWER_THAN_COMPARISON"
    assert context["road_context"][0]["relation"] == "DIRECT_OVERLAP"
    assert context["evidence_status"] == "SLOWDOWN_WITH_MATCHED_ROAD_CONTEXT"
    assert "do not prove" in context["causality_note"]


def test_journey_safety_context_enables_real_safety_first_contract() -> None:
    result = _realtime_test_engine(transfer=True, safety=True).plan("A", "D", "SAFETY_FIRST")
    journey = next(row for row in result["alternatives"] if row["route_sequence"] == "R1 → R2")

    assert result["meta"]["safety_status"] == "JOURNEY_RELATIVE_CONTEXT"
    assert journey["safety"]["status"] == "JOURNEY_RELATIVE_CONTEXT"
    assert journey["safety"]["origin_percentile"] is not None
    assert journey["safety"]["route_percentile"] is not None
    assert journey["safety"]["transfer_percentile"] is not None
    assert journey["safety"]["destination_percentile"] is not None
    assert journey["costs"]["safety_first"] > journey["costs"]["balanced"]


def test_destination_parking_context_is_a_pressure_proxy_not_availability() -> None:
    result = _realtime_test_engine(transfer=True, parking=True).plan("A", "D", "BALANCED")
    journey = next(row for row in result["alternatives"] if row["route_sequence"] == "R1 → R2")
    parking = journey["destination_parking"]

    assert parking["status"] == "PAID_PARKING_PRESSURE_PROXY"
    assert parking["metered_spaces_represented"] == 10
    assert parking["active_paid_sessions_proxy"] == 7
    assert parking["starts_60m"] == 6
    assert parking["trend"] == "RISING"
    assert "does not measure physical occupancy or open spaces" in parking["disclaimer"]
