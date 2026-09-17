#!/usr/bin/env python3
"""Build small Tableau-ready Muni reliability tables from one 511 historic feed.

The source ZIP remains local to the job. Only aggregated, credential-free CSVs are
written to the output directory. The 511 API key is read from the environment and
is never printed or copied into an output file.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import sys
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

import duckdb


REQUIRED_FILES = {
    "agency.txt",
    "routes.txt",
    "trips.txt",
    "stops.txt",
    "stop_observations.txt",
}
OPTIONAL_FILES = {"shapes.txt"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--month", default="2026-08", help="Historic month in YYYY-MM format")
    parser.add_argument("--output-dir", default="tableau-output")
    parser.add_argument("--work-dir", default=".tableau-history-work")
    parser.add_argument("--feed-zip", help="Use an existing historic feed ZIP instead of downloading")
    parser.add_argument(
        "--network-json",
        default="site/data/network.json",
        help="Static GTFS network fallback used only when the historic ZIP omits shapes.txt",
    )
    return parser.parse_args()


def validate_month(value: str) -> str:
    if not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", value):
        raise ValueError("--month must use YYYY-MM, for example 2026-08")
    return value


def download_feed(month: str, destination: Path) -> None:
    api_key = os.environ.get("SF_TRANSIT_511_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("SF_TRANSIT_511_API_KEY is not configured")

    query = urllib.parse.urlencode(
        {
            "api_key": api_key,
            "operator_id": "RG",
            "historic": f"{month}-so",
        }
    )
    url = f"https://api.511.org/transit/datafeeds?{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "SF-Transit-Pulse-Tableau/1.0"})
    print(f"Downloading official 511 historic Regional GTFS for {month}...")
    with urllib.request.urlopen(request, timeout=300) as response, destination.open("wb") as output:
        shutil.copyfileobj(response, output, length=1024 * 1024)
    print(f"Downloaded {destination.stat().st_size / (1024 * 1024):,.1f} MB")


def extract_required(zip_path: Path, extract_dir: Path) -> dict[str, Path]:
    extract_dir.mkdir(parents=True, exist_ok=True)
    found: dict[str, Path] = {}
    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            basename = Path(member.filename).name.lower()
            if basename not in REQUIRED_FILES | OPTIONAL_FILES or basename in found:
                continue
            target = extract_dir / basename
            print(f"Extracting {basename}...")
            with archive.open(member) as source, target.open("wb") as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
            found[basename] = target

    missing = sorted(REQUIRED_FILES - set(found))
    if missing:
        raise RuntimeError(f"Historic ZIP is missing required files: {', '.join(missing)}")
    return found


def sql_path(path: Path) -> str:
    return str(path.resolve()).replace("'", "''")


def columns(con: duckdb.DuckDBPyConnection, path: Path) -> set[str]:
    description = con.execute(
        f"DESCRIBE SELECT * FROM read_csv_auto('{sql_path(path)}', all_varchar=true, sample_size=-1)"
    ).fetchall()
    return {row[0].lower() for row in description}


def write_dictionary(output_dir: Path) -> None:
    rows = [
        ("routes.csv", "One row per Muni route", "Route filters and labels"),
        ("route_shapes.csv", "One row per ordered shape point", "Route line map"),
        ("stops.csv", "One row per route-direction-stop", "Stop map and route filtering"),
        ("trip_performance.csv", "One row per observed trip instance", "Travel-time boxplot and trip detail"),
        ("route_daily.csv", "One row per service date, route and direction", "Daily KPI cards and trends"),
        ("route_hourly.csv", "One row per weekday, hour, route and direction", "Day-by-hour reliability heatmap"),
    ]
    with (output_dir / "data_dictionary.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["file", "grain", "tableau_use"])
        writer.writerows(rows)


def write_readme(output_dir: Path, month: str, agency_ids: list[str]) -> None:
    text = f"""# SF Transit Pulse Tableau historical data

Source month: **{month}**  
Transit agencies retained: **{', '.join(agency_ids)}**  
Source: 511 SF Bay Historic Regional GTFS with `stop_observations.txt`

## Files

- `routes.csv`: Muni route catalog for the historical feed.
- `route_shapes.csv`: ordered coordinates for every Muni route-direction-shape used in the month.
- `stops.csv`: observed Muni stops linked to route and direction.
- `trip_performance.csv`: one row per trip instance with matched scheduled and observed travel time.
- `route_daily.csv`: daily reliability metrics by route and direction.
- `route_hourly.csv`: reliability metrics by weekday, trip-start hour, route and direction.

## Definitions

- `delay_min` is observed arrival minus scheduled arrival.
- `absolute_delay_min` is the absolute value of `delay_min`.
- A trip is marked late when its final observed stop is more than 5 minutes late.
- P90 is the 90th percentile. It describes a worse-than-usual result without using only the maximum.
- Trip duration uses the first and last valid observed stop available for that trip instance. The scheduled duration uses the same two stops.
- Observations with missing times, malformed times, or an absolute delay above 6 hours are excluded as invalid records.

## Important limitation

Stop observations are inferred from GTFS-Realtime data and can contain measurement error. These files support service reliability analysis; they do not measure ETA prediction accuracy at a specific prediction horizon.
"""
    (output_dir / "README.md").write_text(text, encoding="utf-8")


def write_fallback_shapes(
    output_dir: Path,
    network_json: Path,
    route_rows: list[tuple[str, str, str]],
) -> None:
    if not network_json.exists():
        raise RuntimeError(
            "Historic ZIP omitted shapes.txt and the static network fallback does not exist: "
            f"{network_json}"
        )
    with network_json.open(encoding="utf-8") as handle:
        network = json.load(handle)

    current_routes = {
        str(route.get("route_id", "")): route for route in network.get("routes", [])
    }
    historical_by_short_name = {
        str(route_short_name): (str(route_id), str(route_long_name or ""))
        for route_id, route_short_name, route_long_name in route_rows
    }
    output_rows = []
    for direction in network.get("route_directions", {}).values():
        current_route_id = str(direction.get("route_id", ""))
        current_route = current_routes.get(current_route_id, {})
        short_name = str(current_route.get("route_short_name", current_route_id))
        historical_route = historical_by_short_name.get(short_name)
        if not historical_route:
            continue
        route_id, route_long_name = historical_route
        direction_id = str(direction.get("direction_id", ""))
        shape_id = str(direction.get("shape_id", ""))
        path_id = f"{route_id}|{direction_id}|{shape_id}"
        for sequence, point in enumerate(direction.get("shape", []), start=1):
            if not isinstance(point, list) or len(point) < 2:
                continue
            output_rows.append(
                {
                    "path_id": path_id,
                    "route_id": route_id,
                    "route_short_name": short_name,
                    "route_long_name": route_long_name,
                    "direction_id": direction_id,
                    "shape_id": shape_id,
                    "point_sequence": sequence,
                    "latitude": point[0],
                    "longitude": point[1],
                }
            )

    if not output_rows:
        raise RuntimeError("Static network fallback did not match any historical Muni routes")
    with (output_dir / "route_shapes.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(output_rows[0]))
        writer.writeheader()
        writer.writerows(output_rows)
    print("Historic ZIP omitted shapes.txt; used the current official static GTFS network fallback.")


def build_tables(
    files: dict[str, Path],
    output_dir: Path,
    work_dir: Path,
    month: str,
    network_json: Path,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (work_dir / "duckdb-tmp").mkdir(parents=True, exist_ok=True)
    database_path = work_dir / "tableau_history.duckdb"
    con = duckdb.connect(str(database_path))
    con.execute("PRAGMA threads=4")
    con.execute("PRAGMA memory_limit='4GB'")
    con.execute(f"PRAGMA temp_directory='{sql_path(work_dir / 'duckdb-tmp')}'")

    required_observation_columns = {
        "trip_id",
        "trip_start_date",
        "stop_id",
        "stop_sequence",
        "scheduled_arrival_time",
        "observed_arrival_time",
    }
    observed_columns = columns(con, files["stop_observations.txt"])
    missing_observation_columns = sorted(required_observation_columns - observed_columns)
    if missing_observation_columns:
        raise RuntimeError(
            "stop_observations.txt is missing expected columns: "
            + ", ".join(missing_observation_columns)
        )

    con.execute(
        f"""
        CREATE TABLE agency AS
        SELECT * FROM read_csv_auto('{sql_path(files['agency.txt'])}', all_varchar=true, sample_size=-1);

        CREATE TABLE routes_raw AS
        SELECT * FROM read_csv_auto('{sql_path(files['routes.txt'])}', all_varchar=true, sample_size=-1);

        CREATE TABLE trips_raw AS
        SELECT * FROM read_csv_auto('{sql_path(files['trips.txt'])}', all_varchar=true, sample_size=-1);
        """
    )

    agency_ids = [
        str(row[0])
        for row in con.execute(
            """
            SELECT agency_id
            FROM agency
            WHERE lower(coalesce(agency_name, '')) LIKE '%san francisco%'
               OR lower(coalesce(agency_name, '')) LIKE '%sfmta%'
               OR lower(coalesce(agency_name, '')) LIKE '%municipal transportation%'
            ORDER BY agency_id
            """
        ).fetchall()
    ]
    if not agency_ids:
        route_agencies = {str(row[0]) for row in con.execute("SELECT DISTINCT agency_id FROM routes_raw").fetchall()}
        agency_ids = sorted(route_agencies & {"SF", "SFMTA"})
    if not agency_ids:
        raise RuntimeError("Could not identify the SFMTA agency_id in the historic Regional GTFS feed")
    print("Using transit agency IDs: " + ", ".join(agency_ids))
    agency_sql = ", ".join("'" + value.replace("'", "''") + "'" for value in agency_ids)

    con.execute(
        f"""
        CREATE TABLE sf_routes AS
        SELECT
            route_id,
            coalesce(route_short_name, route_id) AS route_short_name,
            coalesce(route_long_name, '') AS route_long_name,
            coalesce(route_type, '') AS route_type,
            agency_id
        FROM routes_raw
        WHERE agency_id IN ({agency_sql});

        CREATE TABLE sf_trips AS
        SELECT
            t.trip_id,
            t.route_id,
            coalesce(t.direction_id, '') AS direction_id,
            coalesce(t.shape_id, '') AS shape_id,
            coalesce(t.trip_headsign, '') AS trip_headsign,
            r.route_short_name,
            r.route_long_name,
            r.route_type
        FROM trips_raw t
        INNER JOIN sf_routes r USING (route_id);
        """
    )

    observations_path = sql_path(files["stop_observations.txt"])
    con.execute(
        f"""
        CREATE TABLE sf_observations AS
        WITH source AS (
            SELECT
                o.trip_id,
                o.trip_start_date,
                o.stop_id,
                try_cast(o.stop_sequence AS INTEGER) AS stop_sequence,
                o.scheduled_arrival_time,
                o.observed_arrival_time,
                CASE
                    WHEN regexp_matches(o.scheduled_arrival_time, '^[0-9]{{1,3}}:[0-5][0-9]:[0-5][0-9]$')
                    THEN try_cast(split_part(o.scheduled_arrival_time, ':', 1) AS INTEGER) * 3600
                       + try_cast(split_part(o.scheduled_arrival_time, ':', 2) AS INTEGER) * 60
                       + try_cast(split_part(o.scheduled_arrival_time, ':', 3) AS INTEGER)
                END AS scheduled_seconds,
                CASE
                    WHEN regexp_matches(o.observed_arrival_time, '^[0-9]{{1,3}}:[0-5][0-9]:[0-5][0-9]$')
                    THEN try_cast(split_part(o.observed_arrival_time, ':', 1) AS INTEGER) * 3600
                       + try_cast(split_part(o.observed_arrival_time, ':', 2) AS INTEGER) * 60
                       + try_cast(split_part(o.observed_arrival_time, ':', 3) AS INTEGER)
                END AS observed_seconds
            FROM read_csv_auto(
                '{observations_path}',
                all_varchar=true,
                sample_size=20480,
                ignore_errors=true,
                null_padding=true
            ) o
        )
        SELECT
            try_strptime(s.trip_start_date, '%Y%m%d')::DATE AS service_date,
            s.trip_id,
            t.route_id,
            t.route_short_name,
            t.route_long_name,
            t.direction_id,
            t.shape_id,
            t.trip_headsign,
            s.stop_id,
            s.stop_sequence,
            s.scheduled_arrival_time,
            s.observed_arrival_time,
            s.scheduled_seconds,
            s.observed_seconds,
            (s.observed_seconds - s.scheduled_seconds) / 60.0 AS delay_min,
            abs(s.observed_seconds - s.scheduled_seconds) / 60.0 AS absolute_delay_min
        FROM source s
        INNER JOIN sf_trips t USING (trip_id)
        WHERE try_strptime(s.trip_start_date, '%Y%m%d') IS NOT NULL
          AND s.stop_sequence IS NOT NULL
          AND s.scheduled_seconds IS NOT NULL
          AND s.observed_seconds IS NOT NULL
          AND abs(s.observed_seconds - s.scheduled_seconds) <= 21600;
        """
    )
    observation_count = con.execute("SELECT count(*) FROM sf_observations").fetchone()[0]
    if observation_count == 0:
        raise RuntimeError("No valid SFMTA stop observations were found after filtering")
    print(f"Valid Muni stop observations: {observation_count:,}")

    con.execute(
        """
        CREATE TABLE trip_performance AS
        WITH grouped AS (
            SELECT
                service_date,
                trip_id,
                route_id,
                route_short_name,
                route_long_name,
                direction_id,
                shape_id,
                trip_headsign,
                count(*) AS observed_stop_count,
                min(stop_sequence) AS first_stop_sequence,
                max(stop_sequence) AS last_stop_sequence,
                arg_min(stop_id, stop_sequence) AS first_stop_id,
                arg_max(stop_id, stop_sequence) AS last_stop_id,
                arg_min(scheduled_arrival_time, stop_sequence) AS scheduled_start_time,
                arg_max(scheduled_arrival_time, stop_sequence) AS scheduled_end_time,
                arg_min(observed_arrival_time, stop_sequence) AS observed_start_time,
                arg_max(observed_arrival_time, stop_sequence) AS observed_end_time,
                arg_min(scheduled_seconds, stop_sequence) AS scheduled_start_seconds,
                arg_max(scheduled_seconds, stop_sequence) AS scheduled_end_seconds,
                arg_min(observed_seconds, stop_sequence) AS observed_start_seconds,
                arg_max(observed_seconds, stop_sequence) AS observed_end_seconds,
                arg_min(delay_min, stop_sequence) AS start_delay_min,
                arg_max(delay_min, stop_sequence) AS end_delay_min
            FROM sf_observations
            GROUP BY ALL
        )
        SELECT
            service_date,
            strftime(service_date, '%A') AS weekday,
            isodow(service_date) AS weekday_order,
            floor(scheduled_start_seconds / 3600)::INTEGER % 24 AS scheduled_start_hour,
            trip_id,
            route_id,
            route_short_name,
            route_long_name,
            direction_id,
            shape_id,
            trip_headsign,
            observed_stop_count,
            first_stop_sequence,
            last_stop_sequence,
            first_stop_id,
            last_stop_id,
            scheduled_start_time,
            scheduled_end_time,
            observed_start_time,
            observed_end_time,
            round((scheduled_end_seconds - scheduled_start_seconds) / 60.0, 3) AS scheduled_duration_min,
            round((observed_end_seconds - observed_start_seconds) / 60.0, 3) AS actual_duration_min,
            round((observed_end_seconds - observed_start_seconds - scheduled_end_seconds + scheduled_start_seconds) / 60.0, 3) AS travel_time_difference_min,
            round(start_delay_min, 3) AS start_delay_min,
            round(end_delay_min, 3) AS end_delay_min,
            round(abs(end_delay_min), 3) AS absolute_end_delay_min,
            CASE WHEN end_delay_min > 5 THEN 1 ELSE 0 END AS late_trip_flag
        FROM grouped
        WHERE observed_stop_count >= 2
          AND scheduled_end_seconds > scheduled_start_seconds
          AND observed_end_seconds > observed_start_seconds
          AND (scheduled_end_seconds - scheduled_start_seconds) BETWEEN 60 AND 18000
          AND (observed_end_seconds - observed_start_seconds) BETWEEN 60 AND 21600;
        """
    )
    trip_count = con.execute("SELECT count(*) FROM trip_performance").fetchone()[0]
    if trip_count == 0:
        raise RuntimeError("No valid trip-performance records were produced")
    print(f"Trip instances: {trip_count:,}")

    routes_out = sql_path(output_dir / "routes.csv")
    shapes_out = sql_path(output_dir / "route_shapes.csv")
    stops_out = sql_path(output_dir / "stops.csv")
    trips_out = sql_path(output_dir / "trip_performance.csv")
    daily_out = sql_path(output_dir / "route_daily.csv")
    hourly_out = sql_path(output_dir / "route_hourly.csv")

    con.execute(
        f"""
        COPY (
            SELECT route_id, route_short_name, route_long_name, route_type, agency_id
            FROM sf_routes ORDER BY route_short_name, route_id
        ) TO '{routes_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT
                o.route_id,
                o.route_short_name,
                o.route_long_name,
                o.direction_id,
                o.stop_id,
                coalesce(s.stop_name, '') AS stop_name,
                try_cast(s.stop_lat AS DOUBLE) AS latitude,
                try_cast(s.stop_lon AS DOUBLE) AS longitude,
                min(o.stop_sequence) AS first_stop_sequence,
                count(DISTINCT concat(o.service_date::VARCHAR, '|', o.trip_id)) AS observed_trip_instances
            FROM sf_observations o
            LEFT JOIN read_csv_auto('{sql_path(files['stops.txt'])}', all_varchar=true, sample_size=-1) s
              USING (stop_id)
            GROUP BY ALL
            ORDER BY o.route_short_name, o.direction_id, first_stop_sequence, o.stop_id
        ) TO '{stops_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT * FROM trip_performance
            ORDER BY service_date, route_short_name, direction_id, scheduled_start_time
        ) TO '{trips_out}' (HEADER, DELIMITER ',');

        COPY (
            WITH trip_metrics AS (
                SELECT
                    service_date,
                    route_id,
                    route_short_name,
                    route_long_name,
                    direction_id,
                    count(*) AS trip_count,
                    round(median(actual_duration_min), 3) AS median_travel_time_min,
                    round(quantile_cont(actual_duration_min, 0.9), 3) AS p90_travel_time_min,
                    round(quantile_cont(actual_duration_min, 0.75) - quantile_cont(actual_duration_min, 0.25), 3) AS travel_time_iqr_min,
                    round(stddev_samp(actual_duration_min), 3) AS travel_time_stddev_min,
                    round(median(end_delay_min), 3) AS median_delay_min,
                    round(quantile_cont(end_delay_min, 0.9), 3) AS p90_delay_min,
                    round(median(absolute_end_delay_min), 3) AS median_absolute_delay_min,
                    round(avg(late_trip_flag) * 100, 3) AS late_trip_pct
                FROM trip_performance
                GROUP BY ALL
            ), observation_metrics AS (
                SELECT service_date, route_id, direction_id, count(*) AS stop_observation_count
                FROM sf_observations
                GROUP BY ALL
            )
            SELECT t.*, o.stop_observation_count, 5 AS late_threshold_min
            FROM trip_metrics t
            LEFT JOIN observation_metrics o USING (service_date, route_id, direction_id)
            ORDER BY service_date, route_short_name, direction_id
        ) TO '{daily_out}' (HEADER, DELIMITER ',');

        COPY (
            SELECT
                weekday,
                weekday_order,
                scheduled_start_hour AS hour,
                route_id,
                route_short_name,
                route_long_name,
                direction_id,
                count(*) AS trip_count,
                round(median(actual_duration_min), 3) AS median_travel_time_min,
                round(quantile_cont(actual_duration_min, 0.9), 3) AS p90_travel_time_min,
                round(median(end_delay_min), 3) AS median_delay_min,
                round(quantile_cont(end_delay_min, 0.9), 3) AS p90_delay_min,
                round(median(absolute_end_delay_min), 3) AS median_absolute_delay_min,
                round(avg(late_trip_flag) * 100, 3) AS late_trip_pct,
                5 AS late_threshold_min
            FROM trip_performance
            GROUP BY ALL
            ORDER BY weekday_order, hour, route_short_name, direction_id
        ) TO '{hourly_out}' (HEADER, DELIMITER ',');
        """
    )

    if "shapes.txt" in files:
        con.execute(
            f"""
            COPY (
                SELECT
                    concat(t.route_id, '|', t.direction_id, '|', t.shape_id) AS path_id,
                    t.route_id,
                    t.route_short_name,
                    t.route_long_name,
                    t.direction_id,
                    t.shape_id,
                    try_cast(s.shape_pt_sequence AS INTEGER) AS point_sequence,
                    try_cast(s.shape_pt_lat AS DOUBLE) AS latitude,
                    try_cast(s.shape_pt_lon AS DOUBLE) AS longitude
                FROM read_csv_auto('{sql_path(files['shapes.txt'])}', all_varchar=true, sample_size=-1) s
                INNER JOIN (
                    SELECT DISTINCT route_id, route_short_name, route_long_name, direction_id, shape_id
                    FROM sf_trips WHERE shape_id <> ''
                ) t USING (shape_id)
                WHERE try_cast(s.shape_pt_sequence AS INTEGER) IS NOT NULL
                  AND try_cast(s.shape_pt_lat AS DOUBLE) IS NOT NULL
                  AND try_cast(s.shape_pt_lon AS DOUBLE) IS NOT NULL
                ORDER BY path_id, point_sequence
            ) TO '{shapes_out}' (HEADER, DELIMITER ',');
            """
        )
    else:
        route_rows = con.execute(
            "SELECT route_id, route_short_name, route_long_name FROM sf_routes"
        ).fetchall()
        write_fallback_shapes(output_dir, network_json, route_rows)

    write_dictionary(output_dir)
    write_readme(output_dir, month, agency_ids)
    for path in sorted(output_dir.iterdir()):
        if path.is_file():
            print(f"Created {path.name}: {path.stat().st_size / (1024 * 1024):,.2f} MB")
    con.close()


def main() -> int:
    args = parse_args()
    month = validate_month(args.month)
    output_dir = Path(args.output_dir).resolve()
    work_dir = Path(args.work_dir).resolve()
    work_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.feed_zip:
        zip_path = Path(args.feed_zip).resolve()
        if not zip_path.exists():
            raise FileNotFoundError(zip_path)
    else:
        zip_path = work_dir / f"regional-{month}-so.zip"
        if not zip_path.exists():
            download_feed(month, zip_path)

    if not zipfile.is_zipfile(zip_path):
        raise RuntimeError("The downloaded file is not a valid ZIP archive")
    files = extract_required(zip_path, work_dir / "extracted")
    build_tables(files, output_dir, work_dir, month, Path(args.network_json).resolve())
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
