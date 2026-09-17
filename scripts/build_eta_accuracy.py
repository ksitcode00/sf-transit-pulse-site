#!/usr/bin/env python3
"""Match ETA predictions to observed arrivals and build Tableau-ready outputs."""

from __future__ import annotations

import argparse
import csv
import datetime
import json
import sys
from pathlib import Path

import duckdb


SELECTED_ROUTES = ("1", "8", "30", "45")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--predictions-dir", required=True)
    parser.add_argument("--actual-arrivals", required=True)
    parser.add_argument("--output-dir", default="eta-accuracy-output")
    parser.add_argument("--work-dir", default=".eta-accuracy-work")
    parser.add_argument("--public-output", help="Optional compact JSON for the Analytics website")
    return parser.parse_args()


def sql_path(path: Path) -> str:
    return str(path.resolve()).replace("'", "''")


def write_dictionary(output_dir: Path) -> None:
    rows = [
        ("eta_accuracy.parquet", "One prediction snapshot matched to one actual trip-stop arrival", "Detailed modeling and audit"),
        ("eta_accuracy_summary.csv", "Route × horizon × day type × time period", "KPI comparison and horizon analysis"),
        ("eta_calibration_curve.csv", "Route × displayed ETA minute", "Displayed ETA versus actual remaining time"),
        ("eta_stop_summary.csv", "Route × direction × stop", "Stops with persistently weak predictions"),
        ("eta_route_time_summary.csv", "Route × day type × hour", "Rush-hour, weekday, and weekend comparison"),
    ]
    with (output_dir / "data_dictionary.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["file", "grain", "tableau_use"])
        writer.writerows(rows)


def write_readme(output_dir: Path, metrics: dict[str, int | float]) -> None:
    text = f"""# Feature 4 — ETA Prediction Accuracy & Trustworthiness

This dataset measures whether a displayed Muni ETA was trustworthy, not merely what ETA was shown.

## Scope

- Routes: 1, 8, 30, and 45
- Prediction window: 0–30 minutes
- Matched prediction rows: {metrics['matched_prediction_rows']:,}
- Distinct repeated-measure trip-stop instances: {metrics['trip_stop_instances']:,}

## Core definitions

- `displayed_eta_min = predicted_arrival_time - snapshot_time`
- `actual_remaining_min = actual_arrival_time - snapshot_time`
- `prediction_error_min = predicted_arrival_time - actual_arrival_time`
- A negative prediction error means the ETA was optimistic: the vehicle arrived later than predicted.
- `trip_stop_instance_id` identifies repeated forecasts for the same service-date, trip, and stop. Inferential models must account for this dependence rather than treating every snapshot as independent.

## Main Tableau metrics

- Median absolute error
- Mean absolute error (MAE)
- P90 absolute error
- Median signed error (bias)
- Calibration curve: displayed ETA versus actual remaining time

## Method limitation

Actual arrivals come from the official 511 historic `stop_observations.txt` feed and may still contain measurement error. Descriptive summaries are produced automatically. Mixed-effects/GEE, conformal intervals, and isotonic calibration should be fitted only after enough service dates and trip-stop clusters have accumulated, with train/test separation by service date.
"""
    (output_dir / "README.md").write_text(text, encoding="utf-8")


def build_outputs(
    predictions_dir: Path,
    actual_arrivals: Path,
    output_dir: Path,
    work_dir: Path,
    public_output: Path | None = None,
) -> dict[str, int | float]:
    prediction_files = sorted(predictions_dir.glob("eta_snapshots_raw_*.parquet"))
    if not prediction_files:
        raise RuntimeError(f"No ETA prediction Parquet files found in {predictions_dir}")
    if not actual_arrivals.exists():
        raise RuntimeError(f"Actual-arrival file does not exist: {actual_arrivals}")

    output_dir.mkdir(parents=True, exist_ok=True)
    work_dir.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect(str(work_dir / "eta_accuracy.duckdb"))
    con.execute("PRAGMA threads=4")
    con.execute("PRAGMA memory_limit='4GB'")
    prediction_glob = sql_path(predictions_dir / "eta_snapshots_raw_*.parquet")
    actuals_path = sql_path(actual_arrivals)
    selected_route_sql = ", ".join(f"'{route}'" for route in SELECTED_ROUTES)

    con.execute(
        f"""
        CREATE TABLE predictions AS
        WITH typed AS (
            SELECT
                cast(service_date AS DATE) AS service_date,
                cast(route_id AS VARCHAR) AS route_id,
                cast(route_short_name AS VARCHAR) AS route_short_name,
                cast(direction_id AS VARCHAR) AS direction_id,
                cast(trip_id AS VARCHAR) AS trip_id,
                cast(stop_id AS VARCHAR) AS stop_id,
                cast(stop_sequence AS INTEGER) AS stop_sequence,
                cast(stop_name AS VARCHAR) AS stop_name,
                try_cast(snapshot_time AS TIMESTAMPTZ) AS snapshot_time,
                try_cast(feed_timestamp AS TIMESTAMPTZ) AS feed_timestamp,
                coalesce(
                    try_cast(nullif(predicted_arrival_time, '') AS TIMESTAMPTZ),
                    try_cast(nullif(predicted_departure_time, '') AS TIMESTAMPTZ)
                ) AS predicted_arrival_time,
                cast(source_commit AS VARCHAR) AS source_commit
            FROM read_parquet('{prediction_glob}', union_by_name=true)
        )
        SELECT *
        FROM typed
        WHERE route_short_name IN ({selected_route_sql})
          AND snapshot_time IS NOT NULL
          AND predicted_arrival_time IS NOT NULL
          AND predicted_arrival_time > snapshot_time
          AND predicted_arrival_time <= snapshot_time + INTERVAL '30 minutes'
        QUALIFY row_number() OVER (
            PARTITION BY service_date, trip_id, stop_id, stop_sequence, snapshot_time
            ORDER BY source_commit DESC
        ) = 1;

        CREATE TABLE actuals AS
        SELECT
            cast(service_date AS DATE) AS service_date,
            cast(route_id AS VARCHAR) AS route_id,
            cast(route_short_name AS VARCHAR) AS route_short_name,
            cast(direction_id AS VARCHAR) AS direction_id,
            cast(trip_id AS VARCHAR) AS trip_id,
            cast(stop_id AS VARCHAR) AS stop_id,
            cast(stop_sequence AS INTEGER) AS stop_sequence,
            try_cast(actual_arrival_time AS TIMESTAMPTZ) AS actual_arrival_time
        FROM read_parquet('{actuals_path}')
        WHERE cast(route_short_name AS VARCHAR) IN ({selected_route_sql})
          AND try_cast(actual_arrival_time AS TIMESTAMPTZ) IS NOT NULL
        QUALIFY row_number() OVER (
            PARTITION BY service_date, trip_id, stop_id, stop_sequence
            ORDER BY actual_arrival_time DESC
        ) = 1;

        CREATE TABLE eta_accuracy AS
        WITH matched AS (
            SELECT
                p.*,
                a.actual_arrival_time,
                epoch(p.predicted_arrival_time - p.snapshot_time) / 60.0 AS displayed_eta_min,
                epoch(a.actual_arrival_time - p.snapshot_time) / 60.0 AS actual_remaining_min,
                epoch(p.predicted_arrival_time - a.actual_arrival_time) / 60.0 AS prediction_error_min
            FROM predictions p
            INNER JOIN actuals a
              ON p.service_date = a.service_date
             AND p.trip_id = a.trip_id
             AND p.stop_id = a.stop_id
             AND p.stop_sequence = a.stop_sequence
        ), enriched AS (
            SELECT
                *,
                abs(prediction_error_min) AS absolute_error_min,
                concat(
                    cast(service_date AS VARCHAR), '|', trip_id, '|', stop_id, '|',
                    cast(stop_sequence AS VARCHAR)
                ) AS trip_stop_instance_id,
                round(displayed_eta_min)::INTEGER AS displayed_eta_minute,
                CASE
                    WHEN actual_remaining_min <= 5 THEN '00–05 min'
                    WHEN actual_remaining_min <= 10 THEN '05–10 min'
                    WHEN actual_remaining_min <= 15 THEN '10–15 min'
                    WHEN actual_remaining_min <= 20 THEN '15–20 min'
                    WHEN actual_remaining_min <= 30 THEN '20–30 min'
                    ELSE '30+ min'
                END AS prediction_horizon_bucket,
                strftime(timezone('America/Los_Angeles', snapshot_time), '%A') AS weekday,
                isodow(timezone('America/Los_Angeles', snapshot_time)) AS weekday_order,
                hour(timezone('America/Los_Angeles', snapshot_time)) AS local_hour,
                CASE
                    WHEN isodow(timezone('America/Los_Angeles', snapshot_time)) IN (6, 7)
                    THEN 'Weekend' ELSE 'Weekday'
                END AS day_type,
                CASE
                    WHEN hour(timezone('America/Los_Angeles', snapshot_time)) BETWEEN 6 AND 9
                    THEN 'AM Peak'
                    WHEN hour(timezone('America/Los_Angeles', snapshot_time)) BETWEEN 16 AND 19
                    THEN 'PM Peak'
                    ELSE 'Off-peak'
                END AS time_period,
                CASE WHEN prediction_error_min < 0 THEN 1 ELSE 0 END AS optimistic_prediction_flag
            FROM matched
            WHERE actual_arrival_time > snapshot_time
              AND actual_remaining_min <= 120
              AND abs(prediction_error_min) <= 120
        )
        SELECT * FROM enriched;
        """
    )

    matched_rows = int(con.execute("SELECT count(*) FROM eta_accuracy").fetchone()[0])
    clusters = int(
        con.execute("SELECT count(DISTINCT trip_stop_instance_id) FROM eta_accuracy").fetchone()[0]
    )
    if matched_rows == 0:
        raise RuntimeError(
            "No predictions matched actual arrivals. Check service dates and trip/stop identifiers."
        )

    detail_out = sql_path(output_dir / "eta_accuracy.parquet")
    summary_out = sql_path(output_dir / "eta_accuracy_summary.csv")
    calibration_out = sql_path(output_dir / "eta_calibration_curve.csv")
    stop_out = sql_path(output_dir / "eta_stop_summary.csv")
    route_time_out = sql_path(output_dir / "eta_route_time_summary.csv")

    con.execute(
        f"""
        COPY (
            SELECT * FROM eta_accuracy
            ORDER BY service_date, route_short_name, trip_id, stop_sequence, snapshot_time
        ) TO '{detail_out}' (FORMAT PARQUET, COMPRESSION ZSTD);

        COPY (
            SELECT
                route_short_name,
                direction_id,
                prediction_horizon_bucket,
                day_type,
                time_period,
                count(*) AS prediction_count,
                count(DISTINCT trip_stop_instance_id) AS trip_stop_instance_count,
                round(median(absolute_error_min), 3) AS median_absolute_error_min,
                round(avg(absolute_error_min), 3) AS mean_absolute_error_min,
                round(quantile_cont(absolute_error_min, 0.9), 3) AS p90_absolute_error_min,
                round(median(prediction_error_min), 3) AS median_signed_error_min,
                round(avg(prediction_error_min), 3) AS mean_signed_error_min,
                round(sqrt(avg(prediction_error_min * prediction_error_min)), 3) AS rmse_min,
                round(avg(optimistic_prediction_flag) * 100, 3) AS optimistic_prediction_pct
            FROM eta_accuracy
            GROUP BY ALL
            ORDER BY route_short_name, direction_id, prediction_horizon_bucket, day_type, time_period
        ) TO '{summary_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT
                route_short_name,
                displayed_eta_minute,
                count(*) AS prediction_count,
                count(DISTINCT trip_stop_instance_id) AS trip_stop_instance_count,
                round(median(displayed_eta_min), 3) AS median_displayed_eta_min,
                round(median(actual_remaining_min), 3) AS median_actual_remaining_min,
                round(median(prediction_error_min), 3) AS median_signed_error_min,
                round(median(absolute_error_min), 3) AS median_absolute_error_min,
                round(quantile_cont(absolute_error_min, 0.9), 3) AS p90_absolute_error_min
            FROM eta_accuracy
            WHERE displayed_eta_minute BETWEEN 0 AND 30
            GROUP BY ALL
            ORDER BY route_short_name, displayed_eta_minute
        ) TO '{calibration_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT
                route_short_name,
                direction_id,
                stop_id,
                any_value(stop_name) AS stop_name,
                count(*) AS prediction_count,
                count(DISTINCT trip_stop_instance_id) AS trip_stop_instance_count,
                round(median(absolute_error_min), 3) AS median_absolute_error_min,
                round(avg(absolute_error_min), 3) AS mean_absolute_error_min,
                round(quantile_cont(absolute_error_min, 0.9), 3) AS p90_absolute_error_min,
                round(median(prediction_error_min), 3) AS median_signed_error_min
            FROM eta_accuracy
            GROUP BY ALL
            ORDER BY median_absolute_error_min DESC, prediction_count DESC
        ) TO '{stop_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT
                route_short_name,
                day_type,
                weekday,
                weekday_order,
                local_hour,
                time_period,
                count(*) AS prediction_count,
                count(DISTINCT trip_stop_instance_id) AS trip_stop_instance_count,
                round(median(absolute_error_min), 3) AS median_absolute_error_min,
                round(avg(absolute_error_min), 3) AS mean_absolute_error_min,
                round(quantile_cont(absolute_error_min, 0.9), 3) AS p90_absolute_error_min,
                round(median(prediction_error_min), 3) AS median_signed_error_min
            FROM eta_accuracy
            GROUP BY ALL
            ORDER BY route_short_name, weekday_order, local_hour
        ) TO '{route_time_out}' (HEADER, DELIMITER ',');
        """
    )

    metrics: dict[str, int | float] = {
        "prediction_files": len(prediction_files),
        "matched_prediction_rows": matched_rows,
        "trip_stop_instances": clusters,
    }
    write_dictionary(output_dir)
    write_readme(output_dir, metrics)
    (output_dir / "eta_accuracy_manifest.json").write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    if public_output is not None:
        # 中文：网页只发布汇总，不上传乘客可能误解为独立样本的全部重复快照。
        # English: Publish aggregates, not the full archive of correlated snapshots.
        query = con.execute("""
            SELECT route_short_name, prediction_horizon_bucket,
                   count(*) AS prediction_count,
                   count(DISTINCT trip_stop_instance_id) AS trip_stop_instance_count,
                   round(median(absolute_error_min), 3) AS median_absolute_error_min,
                   round(quantile_cont(absolute_error_min, 0.9), 3) AS p90_absolute_error_min,
                   round(median(prediction_error_min), 3) AS median_signed_error_min
            FROM eta_accuracy GROUP BY ALL
            ORDER BY route_short_name, prediction_horizon_bucket
        """)
        columns = [description[0] for description in query.description]
        summary = [dict(zip(columns, row)) for row in query.fetchall()]
        start, end = con.execute("SELECT min(service_date), max(service_date) FROM eta_accuracy").fetchone()
        payload = {
            "schema_version": 1, "status": "available",
            "published_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "selected_routes": list(SELECTED_ROUTES),
            "service_date_start": str(start), "service_date_end": str(end),
            "source": "511 GTFS-Realtime snapshots matched to 511 historical stop observations",
            **metrics, "summary": summary,
        }
        for key, filename in (
            ("calibration", "eta_calibration_curve.csv"),
            ("stops", "eta_stop_summary.csv"),
            ("route_time", "eta_route_time_summary.csv"),
        ):
            with (output_dir / filename).open(encoding="utf-8") as handle:
                payload[key] = list(csv.DictReader(handle))
        public_output.parent.mkdir(parents=True, exist_ok=True)
        public_output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    con.close()
    return metrics


def main() -> int:
    args = parse_args()
    try:
        metrics = build_outputs(
            Path(args.predictions_dir),
            Path(args.actual_arrivals),
            Path(args.output_dir),
            Path(args.work_dir),
            Path(args.public_output) if args.public_output else None,
        )
    except (RuntimeError, duckdb.Error) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps(metrics, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
