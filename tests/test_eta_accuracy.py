from __future__ import annotations

import csv
import datetime
from pathlib import Path

import duckdb

from scripts.build_eta_accuracy import build_outputs
from scripts.download_eta_artifacts import select_latest_artifacts
from scripts.prepare_tableau_history import build_tables


def test_select_latest_artifacts_keeps_one_active_artifact_per_day() -> None:
    artifacts = [
        {
            "id": 1,
            "name": "sf-transit-eta-snapshots-2026-09-16",
            "created_at": "2026-09-17T01:00:00Z",
            "expired": False,
        },
        {
            "id": 2,
            "name": "sf-transit-eta-snapshots-2026-09-16",
            "created_at": "2026-09-17T02:00:00Z",
            "expired": False,
        },
        {
            "id": 3,
            "name": "sf-transit-eta-snapshots-2026-09-17",
            "created_at": "2026-09-18T02:00:00Z",
            "expired": True,
        },
        {
            "id": 4,
            "name": "sf-transit-eta-snapshots-2026-08-31",
            "created_at": "2026-09-01T02:00:00Z",
            "expired": False,
        },
    ]

    selected = select_latest_artifacts(artifacts, "2026-09")

    assert list(selected) == ["2026-09-16"]
    assert selected["2026-09-16"]["id"] == 2


def test_build_outputs_calculates_trust_metrics(tmp_path: Path) -> None:
    predictions_dir = tmp_path / "predictions"
    output_dir = tmp_path / "output"
    work_dir = tmp_path / "work"
    predictions_dir.mkdir()
    predictions_path = predictions_dir / "eta_snapshots_raw_2026-09-16.parquet"
    actuals_path = tmp_path / "eta_actual_arrivals.parquet"

    con = duckdb.connect()
    con.execute(
        f"""
        COPY (
            SELECT * FROM (VALUES
                ('2026-09-16', '30', '30', '0', 'trip-1', 'stop-1', 5, 'Stockton & Clay',
                 '2026-09-16T15:00:00+00:00', '2026-09-16T14:59:30+00:00',
                 '2026-09-16T15:08:00+00:00', '2026-09-16T15:08:10+00:00', 'commit-a'),
                ('2026-09-16', '30', '30', '0', 'trip-1', 'stop-1', 5, 'Stockton & Clay',
                 '2026-09-16T15:05:00+00:00', '2026-09-16T15:04:30+00:00',
                 '2026-09-16T15:09:00+00:00', '2026-09-16T15:09:10+00:00', 'commit-b')
            ) AS t(
                service_date, route_id, route_short_name, direction_id, trip_id,
                stop_id, stop_sequence, stop_name, snapshot_time, feed_timestamp,
                predicted_arrival_time, predicted_departure_time, source_commit
            )
        ) TO '{predictions_path}' (FORMAT PARQUET);

        COPY (
            SELECT * FROM (VALUES
                ('2026-09-16', '30', '30', '0', 'trip-1', 'stop-1', 5,
                 '2026-09-16T15:10:00+00:00')
            ) AS t(
                service_date, route_id, route_short_name, direction_id, trip_id,
                stop_id, stop_sequence, actual_arrival_time
            )
        ) TO '{actuals_path}' (FORMAT PARQUET);
        """
    )
    con.close()

    metrics = build_outputs(predictions_dir, actuals_path, output_dir, work_dir)

    assert metrics["matched_prediction_rows"] == 2
    assert metrics["trip_stop_instances"] == 1
    detail = duckdb.sql(
        f"SELECT displayed_eta_min, actual_remaining_min, prediction_error_min, "
        f"absolute_error_min, trip_stop_instance_id FROM read_parquet('{output_dir / 'eta_accuracy.parquet'}') "
        "ORDER BY snapshot_time"
    ).fetchall()
    assert detail == [
        (8.0, 10.0, -2.0, 2.0, "2026-09-16|trip-1|stop-1|5"),
        (4.0, 5.0, -1.0, 1.0, "2026-09-16|trip-1|stop-1|5"),
    ]

    with (output_dir / "eta_calibration_curve.csv").open(newline="", encoding="utf-8") as handle:
        calibration = list(csv.DictReader(handle))
    assert {row["displayed_eta_minute"] for row in calibration} == {"4", "8"}


def test_historic_observations_export_selected_eta_actuals(tmp_path: Path) -> None:
    source_dir = tmp_path / "historic"
    output_dir = tmp_path / "tableau"
    work_dir = tmp_path / "work"
    source_dir.mkdir()

    def write_source(name: str, header: list[str], rows: list[list[str]]) -> Path:
        path = source_dir / name
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(header)
            writer.writerows(rows)
        return path

    files = {
        "agency.txt": write_source(
            "agency.txt", ["agency_id", "agency_name"], [["SF", "SFMTA"]]
        ),
        "routes.txt": write_source(
            "routes.txt",
            ["route_id", "agency_id", "route_short_name", "route_long_name", "route_type"],
            [["30", "SF", "30", "STOCKTON", "3"]],
        ),
        "trips.txt": write_source(
            "trips.txt",
            ["route_id", "service_id", "trip_id", "direction_id", "shape_id", "trip_headsign"],
            [["30", "weekday", "trip-30", "0", "shape-30", "Presidio"]],
        ),
        "stops.txt": write_source(
            "stops.txt",
            ["stop_id", "stop_name", "stop_lat", "stop_lon"],
            [
                ["stop-1", "Stockton & Clay", "37.79", "-122.41"],
                ["stop-2", "Stockton & Sutter", "37.79", "-122.40"],
            ],
        ),
        "stop_observations.txt": write_source(
            "stop_observations.txt",
            [
                "trip_id",
                "trip_start_date",
                "stop_id",
                "stop_sequence",
                "scheduled_arrival_time",
                "observed_arrival_time",
            ],
            [
                ["trip-30", "20260916", "stop-1", "1", "08:00:00", "08:01:00"],
                ["trip-30", "20260916", "stop-2", "2", "08:10:00", "08:12:00"],
            ],
        ),
        "shapes.txt": write_source(
            "shapes.txt",
            ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"],
            [
                ["shape-30", "37.79", "-122.41", "1"],
                ["shape-30", "37.79", "-122.40", "2"],
            ],
        ),
    }

    build_tables(files, output_dir, work_dir, "2026-09", tmp_path / "unused.json")

    actuals_path = output_dir / "eta_actual_arrivals.parquet"
    assert actuals_path.exists()
    rows = duckdb.sql(
        f"SELECT route_short_name, stop_id, epoch(actual_arrival_time) "
        f"FROM read_parquet('{actuals_path}') ORDER BY stop_sequence"
    ).fetchall()
    expected_first_epoch = datetime.datetime(
        2026, 9, 16, 15, 1, tzinfo=datetime.timezone.utc
    ).timestamp()
    assert rows == [
        ("30", "stop-1", expected_first_epoch),
        ("30", "stop-2", expected_first_epoch + 11 * 60),
    ]
