from __future__ import annotations

from datetime import datetime, timezone

from scripts.export_eta_snapshots import build_network_lookups, flatten_snapshot


def test_flatten_snapshot_keeps_future_predictions_and_names() -> None:
    snapshot_epoch = int(datetime(2026, 9, 17, 15, 0, tzinfo=timezone.utc).timestamp())
    network = {
        "routes": [{"route_id": "30", "route_short_name": "30"}],
        "patterns": {
            "30|0|shape": {
                "stops": [
                    {"stop_id": "A", "name": "Geary & 6th Ave"},
                    {"stop_id": "B", "name": "Geary & Masonic"},
                ]
            }
        },
    }
    route_names, stop_names = build_network_lookups(network)
    snapshot = {
        "meta": {"generated_at": "2026-09-17T15:00:00+00:00"},
        "trip_predictions": [
            {
                "service_date": "2026-09-17",
                "trip_id": "trip-30",
                "route_id": "30",
                "direction_id": "0",
                "update_timestamp": snapshot_epoch - 30,
                "stops": [
                    {
                        "stop_id": "A",
                        "stop_sequence": 1,
                        "arrival_time": snapshot_epoch - 60,
                        "departure_time": snapshot_epoch - 30,
                    },
                    {
                        "stop_id": "B",
                        "stop_sequence": 2,
                        "arrival_time": snapshot_epoch + 600,
                        "departure_time": snapshot_epoch + 630,
                    },
                ],
            }
        ],
    }

    rows = flatten_snapshot(snapshot, "abc123", route_names, stop_names)

    assert len(rows) == 1
    assert rows[0]["service_date"] == "2026-09-17"
    assert rows[0]["route_short_name"] == "30"
    assert rows[0]["stop_name"] == "Geary & Masonic"
    assert rows[0]["predicted_arrival_time"] == "2026-09-17T15:10:00+00:00"
    assert rows[0]["source_commit"] == "abc123"


def test_flatten_snapshot_infers_san_francisco_service_date() -> None:
    snapshot = {
        "meta": {"generated_at": "2026-09-18T07:05:00+00:00"},
        "trip_predictions": [
            {
                "trip_id": "late-night-trip",
                "route_id": "1",
                "direction_id": "1",
                "stops": [
                    {
                        "stop_id": "N1",
                        "stop_sequence": 1,
                        "arrival_time": int(
                            datetime(2026, 9, 18, 7, 15, tzinfo=timezone.utc).timestamp()
                        ),
                        "departure_time": None,
                    }
                ],
            }
        ],
    }

    rows = flatten_snapshot(snapshot, "def456", {"1": "1"}, {"N1": "Judah & 9th"})

    assert rows[0]["service_date"] == "2026-09-18"


def test_flatten_snapshot_limits_routes_and_prediction_horizon() -> None:
    snapshot_epoch = int(datetime(2026, 9, 17, 15, 0, tzinfo=timezone.utc).timestamp())
    snapshot = {
        "meta": {"generated_at": "2026-09-17T15:00:00+00:00"},
        "trip_predictions": [
            {
                "trip_id": "selected-route",
                "route_id": "8",
                "stops": [
                    {
                        "stop_id": "within-window",
                        "stop_sequence": 1,
                        "arrival_time": snapshot_epoch + 30 * 60,
                    },
                    {
                        "stop_id": "outside-window",
                        "stop_sequence": 2,
                        "arrival_time": snapshot_epoch + 31 * 60,
                    },
                ],
            },
            {
                "trip_id": "unselected-route",
                "route_id": "38",
                "stops": [
                    {
                        "stop_id": "wrong-route",
                        "stop_sequence": 1,
                        "arrival_time": snapshot_epoch + 5 * 60,
                    }
                ],
            },
        ],
    }

    rows = flatten_snapshot(
        snapshot,
        "ghi789",
        {"8": "8", "38": "38"},
        {
            "within-window": "Selected stop",
            "outside-window": "Too far ahead",
            "wrong-route": "Wrong route",
        },
    )

    assert len(rows) == 1
    assert rows[0]["route_short_name"] == "8"
    assert rows[0]["stop_id"] == "within-window"
