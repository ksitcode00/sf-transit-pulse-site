"""Feature 16A contract tests / Feature 16A 数据契约测试。"""

import json
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
    assert fastest_eta == balanced_eta


def test_same_stop_is_rejected(engine: PlannerEngine) -> None:
    with pytest.raises(PlannerError):
        engine.plan("13161", "13161")


def test_public_beta_uses_the_qa_validated_walking_policy() -> None:
    assert ACCESS_RADIUS_M == 250.0
    assert TRANSFER_RADIUS_M == 180.0
    assert WALK_SPEED_M_PER_MIN == 75.0
