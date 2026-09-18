#!/usr/bin/env python3
"""Build a compact public historical-analytics payload from Tableau source tables.

The browser receives only route, direction, distribution, heatmap, and simplified
geometry summaries.  Raw trip-level records remain in the Tableau artifact.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
from collections import defaultdict
from pathlib import Path

import duckdb


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--month", required=True)
    return parser.parse_args()


def validate_month(value: str) -> str:
    """Accept only a complete calendar month suitable for public replacement."""
    try:
        return dt.datetime.strptime(value, "%Y-%m").strftime("%Y-%m")
    except ValueError as error:
        raise SystemExit("--month must use YYYY-MM, for example 2026-09") from error


def existing_source_month(output: Path) -> str | None:
    """Return the current public month, without treating an unreadable file as data."""
    if not output.exists():
        return None
    try:
        value = json.loads(output.read_text(encoding="utf-8")).get("source_month")
        return validate_month(str(value)) if value else None
    except (json.JSONDecodeError, OSError, SystemExit):
        return None


def sql_path(path: Path) -> str:
    return str(path.resolve()).replace("'", "''")


def rows_as_dicts(cursor: duckdb.DuckDBPyConnection) -> list[dict[str, object]]:
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def rounded_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            key: round(value, 3) if isinstance(value, float) and math.isfinite(value) else value
            for key, value in row.items()
        }
        for row in rows
    ]


def simplify_geometries(shape_csv: Path) -> list[dict[str, object]]:
    grouped: dict[tuple[str, str, str], list[list[float]]] = defaultdict(list)
    con = duckdb.connect()
    records = con.execute(
        f"""
        SELECT route_short_name, direction_id, path_id, point_sequence, latitude, longitude
        FROM read_csv_auto('{sql_path(shape_csv)}', header=true)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY route_short_name, direction_id, path_id, point_sequence
        """
    ).fetchall()
    con.close()
    for route, direction, path, _sequence, latitude, longitude in records:
        grouped[(str(route), str(direction), str(path))].append(
            [round(float(latitude), 6), round(float(longitude), 6)]
        )

    by_route_direction: dict[tuple[str, str], list[list[list[float]]]] = defaultdict(list)
    for (route, direction, _path), points in grouped.items():
        stride = max(1, math.ceil(len(points) / 180))
        simplified = points[::stride]
        if points[-1] != simplified[-1]:
            simplified.append(points[-1])
        by_route_direction[(route, direction)].append(simplified)
    return [
        {"route_short_name": route, "direction_id": direction, "paths": paths}
        for (route, direction), paths in sorted(by_route_direction.items())
    ]


def main() -> int:
    args = parse_args()
    args.month = validate_month(args.month)
    input_dir = Path(args.input_dir)
    output = Path(args.output)
    trips = input_dir / "trip_performance.csv"
    routes = input_dir / "routes.csv"
    shapes = input_dir / "route_shapes.csv"
    missing = [path.name for path in (trips, routes, shapes) if not path.exists()]
    if missing:
        raise SystemExit("Missing source table(s): " + ", ".join(missing))
    previous_month = existing_source_month(output)
    if previous_month and args.month < previous_month:
        raise SystemExit(
            f"Refusing to replace public {previous_month} data with older {args.month} data."
        )

    con = duckdb.connect()
    con.execute(
        f"""
        CREATE TABLE trips AS
        SELECT
            cast(service_date AS DATE) AS service_date,
            cast(route_short_name AS VARCHAR) AS route_short_name,
            cast(route_long_name AS VARCHAR) AS route_long_name,
            cast(direction_id AS VARCHAR) AS direction_id,
            try_cast(actual_duration_min AS DOUBLE) AS actual_duration_min,
            try_cast(end_delay_min AS DOUBLE) AS end_delay_min,
            try_cast(absolute_end_delay_min AS DOUBLE) AS absolute_end_delay_min,
            try_cast(late_trip_flag AS DOUBLE) AS late_trip_flag,
            try_cast(scheduled_start_hour AS INTEGER) AS scheduled_start_hour,
            cast(weekday AS VARCHAR) AS weekday,
            try_cast(weekday_order AS INTEGER) AS weekday_order
        FROM read_csv_auto('{sql_path(trips)}', header=true)
        WHERE try_cast(actual_duration_min AS DOUBLE) IS NOT NULL
          AND try_cast(absolute_end_delay_min AS DOUBLE) IS NOT NULL
          AND try_cast(scheduled_start_hour AS INTEGER) BETWEEN 0 AND 23;
        """
    )
    # These summaries are recalculated from trip instances. They deliberately do
    # not sum daily medians or percentiles from the Tableau convenience tables.
    reliability = rows_as_dicts(
        con.execute(
            f"""
            WITH expanded AS (
                SELECT route_short_name, route_long_name, direction_id,
                       actual_duration_min, end_delay_min, absolute_end_delay_min, late_trip_flag
                FROM trips
                UNION ALL
                SELECT route_short_name, route_long_name, 'all',
                       actual_duration_min, end_delay_min, absolute_end_delay_min, late_trip_flag
                FROM trips
            )
            SELECT route_short_name, any_value(route_long_name) AS route_long_name, direction_id,
                   count(*) AS trip_count,
                   quantile_cont(actual_duration_min, 0.05) AS travel_time_p05_min,
                   quantile_cont(actual_duration_min, 0.25) AS travel_time_p25_min,
                   median(actual_duration_min) AS travel_time_median_min,
                   quantile_cont(actual_duration_min, 0.75) AS travel_time_p75_min,
                   quantile_cont(actual_duration_min, 0.95) AS travel_time_p95_min,
                   median(end_delay_min) AS median_end_delay_min,
                   median(absolute_end_delay_min) AS median_absolute_delay_min,
                   quantile_cont(absolute_end_delay_min, 0.9) AS p90_absolute_delay_min,
                   avg(late_trip_flag) * 100 AS late_trip_pct
            FROM expanded
            GROUP BY route_short_name, direction_id
            ORDER BY route_short_name, direction_id
            """
        )
    )
    heatmap = rows_as_dicts(
        con.execute(
            """
            WITH expanded AS (
                SELECT route_short_name, route_long_name, direction_id, weekday, weekday_order,
                       scheduled_start_hour, absolute_end_delay_min
                FROM trips
                UNION ALL
                SELECT route_short_name, route_long_name, 'all', weekday, weekday_order,
                       scheduled_start_hour, absolute_end_delay_min
                FROM trips
            )
            SELECT route_short_name, any_value(route_long_name) AS route_long_name, direction_id,
                   weekday, weekday_order, scheduled_start_hour AS hour,
                   count(*) AS trip_count,
                   median(absolute_end_delay_min) AS median_absolute_delay_min,
                   quantile_cont(absolute_end_delay_min, 0.9) AS p90_absolute_delay_min
            FROM expanded
            GROUP BY route_short_name, direction_id, weekday, weekday_order, scheduled_start_hour
            ORDER BY route_short_name, direction_id, weekday_order, hour
            """
        )
    )
    route_catalog = rows_as_dicts(
        con.execute(
            f"""
            SELECT cast(route_short_name AS VARCHAR) AS route_short_name,
                   cast(route_long_name AS VARCHAR) AS route_long_name
            FROM read_csv_auto('{sql_path(routes)}', header=true)
            ORDER BY route_short_name
            """
        )
    )
    date_range = con.execute("SELECT min(service_date), max(service_date), count(*) FROM trips").fetchone()
    con.close()
    payload = {
        "schema_version": 1,
        "status": "available",
        "source_month": args.month,
        "service_date_start": str(date_range[0]),
        "service_date_end": str(date_range[1]),
        "trip_instance_count": int(date_range[2]),
        "source": "511 SF Bay Historic Regional GTFS stop observations",
        "definitions": {
            "delay": "observed final-stop arrival minus scheduled final-stop arrival",
            "late": "final observed arrival more than five minutes late",
            "p90": "90th percentile; a worse-than-usual outcome, not a guarantee",
        },
        "routes": route_catalog,
        "reliability": rounded_rows(reliability),
        # Compact positional records keep the public page light enough to load on
        # a phone. Field order: route, direction, weekday order, hour, trips,
        # median absolute delay, P90 absolute delay.
        "heatmap_columns": [
            "route_short_name", "direction_id", "weekday_order", "hour",
            "trip_count", "median_absolute_delay_min", "p90_absolute_delay_min",
        ],
        "heatmap": [
            [
                row["route_short_name"], row["direction_id"], row["weekday_order"],
                row["hour"], row["trip_count"], row["median_absolute_delay_min"],
                row["p90_absolute_delay_min"],
            ]
            for row in rounded_rows(heatmap)
        ],
        "geometries": simplify_geometries(shapes),
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "bytes": output.stat().st_size, "trip_instance_count": payload["trip_instance_count"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
