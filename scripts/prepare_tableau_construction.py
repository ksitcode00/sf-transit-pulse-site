#!/usr/bin/env python3
"""Create a small, Tableau-ready daily snapshot for Feature 5.

The output is intentionally about *spatial exposure*, not causation: a closure
near a Muni route is context, never proof that it caused a delay.  It combines
official SFMTA permitted closures, 511 WZDx work zones, and DataSF utility
excavation permits.  Each source keeps its own evidence label.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from zoneinfo import ZoneInfo

import requests


ROOT = Path(__file__).resolve().parents[1]
SF_BOUNDS = {"south": 37.68, "north": 37.84, "west": -122.55, "east": -122.33}
DIRECT_METERS = 80
NEARBY_METERS = 250
DATASF_CLOSURES = "8x25-yybr"
DATASF_EXCAVATIONS = "smdf-6c45"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="feature5-output")
    parser.add_argument("--network-json", default="site/data/network.json")
    parser.add_argument("--snapshot-date", help="San Francisco date, YYYY-MM-DD; default is today")
    parser.add_argument("--closures-file", help="Fixture or saved DataSF closure JSON")
    parser.add_argument("--excavations-file", help="Fixture or saved DataSF excavation JSON")
    parser.add_argument("--wzdx-file", help="Fixture or saved 511 WZDx JSON")
    return parser.parse_args()


def sf_today() -> str:
    return str(datetime.now(ZoneInfo("America/Los_Angeles")).date())


def inside_sf(lat: float, lon: float) -> bool:
    return (
        SF_BOUNDS["south"] <= lat <= SF_BOUNDS["north"]
        and SF_BOUNDS["west"] <= lon <= SF_BOUNDS["east"]
    )


def normalized(row: dict[str, Any]) -> dict[str, Any]:
    return {str(key).strip().casefold(): value for key, value in row.items()}


def first(row: dict[str, Any], names: Iterable[str]) -> Any:
    for name in names:
        value = row.get(name.casefold())
        if value not in (None, "", []):
            return value
    return None


def records(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if not isinstance(payload, dict):
        raise ValueError(f"Expected a JSON object or list, received {type(payload).__name__}.")
    for key in ("features", "events", "data", "rows"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    raise ValueError("Source returned no recognized row collection.")


def json_value(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return None
    return value


def geometry_points(value: Any) -> list[list[float]]:
    geometry = json_value(value)
    if not isinstance(geometry, dict):
        return []
    coordinates = geometry.get("coordinates")
    points: list[list[float]] = []

    def walk(node: Any) -> None:
        if isinstance(node, (list, tuple)) and len(node) >= 2 and all(
            isinstance(item, (int, float)) for item in node[:2]
        ):
            lon, lat = float(node[0]), float(node[1])
            if inside_sf(lat, lon):
                points.append([round(lat, 6), round(lon, 6)])
            return
        if isinstance(node, (list, tuple)):
            for child in node:
                walk(child)

    walk(coordinates)
    return points


def source_geometry(raw: dict[str, Any], row: dict[str, Any]) -> list[list[float]]:
    properties = raw.get("properties") if isinstance(raw.get("properties"), dict) else {}
    candidates = [
        raw.get("geometry"), raw.get("shape"), raw.get("the_geom"),
        properties.get("geometry"), properties.get("shape"), properties.get("the_geom"),
        properties.get("geography"), properties.get("closure_geography"),
    ]
    for candidate in candidates:
        points = geometry_points(candidate)
        if points:
            return points
    try:
        lat, lon = float(first(row, ("latitude", "lat", "y"))), float(first(row, ("longitude", "lon", "lng", "x")))
    except (TypeError, ValueError):
        return []
    return [[round(lat, 6), round(lon, 6)]] if inside_sf(lat, lon) else []


def datasf_rows(dataset_id: str, query: str) -> list[dict[str, Any]]:
    token = os.environ.get("SF_TRANSIT_DATASF_APP_TOKEN", "").strip()
    headers = {"X-App-Token": token} if token else {}
    response = requests.get(
        f"https://data.sf.gov/api/v3/views/{dataset_id}/query.json",
        params={"pageNumber": 1, "pageSize": 5000, "query": query},
        headers=headers,
        timeout=90,
    )
    response.raise_for_status()
    return records(response.json())


def wzdx_rows() -> list[dict[str, Any]]:
    api_key = os.environ.get("SF_TRANSIT_511_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("SF_TRANSIT_511_API_KEY is not configured")
    response = requests.get(
        "https://api.511.org/traffic/wzdx",
        params={"api_key": api_key, "includeAllDefinedEnums": "true"},
        timeout=90,
    )
    response.raise_for_status()
    return records(response.json())


def read_or_fetch(path: str | None, fetcher: Any) -> list[dict[str, Any]]:
    if path:
        return records(json.loads(Path(path).read_text(encoding="utf-8")))
    return fetcher()


def normalize_event(source: str, raw: dict[str, Any], snapshot_date: str) -> dict[str, Any] | None:
    properties = raw.get("properties") if isinstance(raw.get("properties"), dict) else {}
    merged = {**raw, **properties}
    row = normalized(merged)
    geometry = source_geometry(raw, row)
    if not geometry:
        return None
    event_id = first(row, ("id", "objectid", "case_num", "permit_number", "unique_identifier", ":id"))
    if not event_id:
        return None
    event_type = first(row, ("work_zone_type", "event_type", "activity_type", "type", "permit_type"))
    status = first(row, ("status", "active", "event_status"))
    title = first(row, ("case_name", "headline", "name", "description", "info", "permit_purpose"))
    street = first(row, ("street", "streetname", "road_name", "road", "loc_desc", "location_description"))
    from_street = first(row, ("from_st", "cross_street_1", "from_street"))
    to_street = first(row, ("to_st", "cross_street_2", "to_street"))
    start = first(row, ("start_utc", "start_dt", "start_date", "effective_date", "beginning_date"))
    end = first(row, ("end_utc", "end_dt", "end_date", "expiration_date", "ending_date"))
    impact = first(row, ("veh_imp", "vehicle_impact", "impact", "lane_impact"))
    point = geometry[len(geometry) // 2]
    return {
        "snapshot_date": snapshot_date,
        "source": source,
        "evidence_type": "PERMITTED_CLOSURE" if source == "SFMTA_TEMPORARY_CLOSURE" else "WORK_ZONE" if source == "511_WZDX" else "EXCAVATION_PERMIT",
        "event_id": f"{source}:{event_id}",
        "event_type": str(event_type or "Unspecified"),
        "status": str(status or "Unknown"),
        "title": str(title or "No description")[:500],
        "street": str(street or "")[:180],
        "from_street": str(from_street or "")[:120],
        "to_street": str(to_street or "")[:120],
        "start_time": str(start or ""),
        "end_time": str(end or ""),
        "vehicle_impact": str(impact or "")[:180],
        "latitude": point[0],
        "longitude": point[1],
        "geometry_json": json.dumps(
            {"type": "LineString", "coordinates": [[lon, lat] for lat, lon in geometry]}
            if len(geometry) > 1
            else {"type": "Point", "coordinates": [geometry[0][1], geometry[0][0]]},
            separators=(",", ":"),
        ),
    }


def haversine_meters(a: list[float], b: list[float]) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    delta_lat, delta_lon = lat2 - lat1, lon2 - lon1
    value = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    return 6_371_000 * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def simplified(points: list[list[float]], maximum: int = 120) -> list[list[float]]:
    if len(points) <= maximum:
        return points
    step = math.ceil(len(points) / maximum)
    result = points[::step]
    return result if result[-1] == points[-1] else result + [points[-1]]


def route_shapes(network: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[tuple[str, str], list[list[float]]]]:
    routes = {str(row.get("route_id")): row for row in network.get("routes", [])}
    output: list[dict[str, Any]] = []
    lookup: dict[tuple[str, str], list[list[float]]] = {}
    for direction in network.get("route_directions", {}).values():
        route_id, direction_id = str(direction.get("route_id")), str(direction.get("direction_id"))
        shape = [point for point in direction.get("shape", []) if isinstance(point, list) and len(point) >= 2]
        if not shape:
            continue
        shape = simplified([[float(point[0]), float(point[1])] for point in shape])
        lookup[(route_id, direction_id)] = shape
        route = routes.get(route_id, {})
        for sequence, (lat, lon) in enumerate(shape, start=1):
            output.append({
                "route_id": route_id,
                "route_short_name": str(route.get("route_short_name", route_id)),
                "route_long_name": str(route.get("route_long_name", "")),
                "direction_id": direction_id,
                "direction_label": str(direction.get("direction_label", "")),
                "point_sequence": sequence,
                "latitude": round(lat, 6),
                "longitude": round(lon, 6),
            })
    return output, lookup


def exposure_rows(events: list[dict[str, Any]], network: dict[str, Any]) -> list[dict[str, Any]]:
    routes = {str(row.get("route_id")): row for row in network.get("routes", [])}
    _shapes, lookup = route_shapes(network)
    output = []
    for event in events:
        payload = json.loads(event["geometry_json"])
        coordinates = payload["coordinates"]
        if payload.get("type") == "Point":
            geometry = [[float(coordinates[1]), float(coordinates[0])]]
        else:
            geometry = [[float(lat), float(lon)] for lon, lat in coordinates]
        geometry = simplified(geometry, 80)
        for (route_id, direction_id), shape in lookup.items():
            distance = min(haversine_meters(event_point, route_point) for event_point in geometry for route_point in shape)
            if distance > NEARBY_METERS:
                continue
            route = routes.get(route_id, {})
            output.append({
                "snapshot_date": event["snapshot_date"],
                "event_id": event["event_id"],
                "source": event["source"],
                "evidence_type": event["evidence_type"],
                "route_id": route_id,
                "route_short_name": str(route.get("route_short_name", route_id)),
                "route_long_name": str(route.get("route_long_name", "")),
                "direction_id": direction_id,
                "exposure_level": "DIRECT_OVERLAP" if distance <= DIRECT_METERS else "NEARBY_CONTEXT",
                "minimum_distance_m": round(distance, 1),
                "event_type": event["event_type"],
                "status": event["status"],
                "start_time": event["start_time"],
                "end_time": event["end_time"],
            })
    return output


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_guides(output: Path, snapshot_date: str) -> None:
    write_csv(output / "feature5_data_dictionary.csv", [
        {"file": "feature5_events_current.csv", "grain": "One source event on one snapshot date", "tableau_use": "Map marks, source/type/status filters, event detail"},
        {"file": "feature5_route_shapes.csv", "grain": "One ordered point per route direction", "tableau_use": "Route line geometry"},
        {"file": "feature5_route_exposure_current.csv", "grain": "One event × route direction spatial match", "tableau_use": "Exposure counts, route ranking, route-event map"},
    ], ["file", "grain", "tableau_use"])
    (output / "README.md").write_text(
        f"""# Feature 5 Tableau data\n\nSnapshot date: **{snapshot_date}**\n\n## Start here\n\n1. Connect Tableau to `feature5_route_exposure_current.csv`.\n2. Join `feature5_events_current.csv` to it on `event_id`.\n3. Add `feature5_route_shapes.csv` only for a route-line map.\n\n## Evidence rules\n\n- `DIRECT_OVERLAP` means an event geometry is within {DIRECT_METERS} metres of sampled route geometry.\n- `NEARBY_CONTEXT` means {DIRECT_METERS}–{NEARBY_METERS} metres away.\n- This is spatial context, not evidence that the event caused delay or rerouting.\n- `PERMITTED_CLOSURE` and `WORK_ZONE` describe closure/work-zone sources. `EXCAVATION_PERMIT` is a permit background signal and is not proof of a closure.\n\n## Sources\n\n- 511 SF Bay WZDx: planned and active work zones, closures, and detours.\n- SFMTA Temporary Street Closures: current/upcoming permitted SFMTA closures.\n- DataSF Utility Excavation Permits: active/approved excavation permits.\n\nDaily workflow artifacts keep snapshots for 90 days. Do not combine snapshots before deduplicating `snapshot_date + event_id`; one multi-day event may correctly appear on several days.\n""",
        encoding="utf-8",
    )


def main() -> int:
    args = parse_args()
    snapshot_date = args.snapshot_date or sf_today()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    network = json.loads(Path(args.network_json).read_text(encoding="utf-8"))
    closures = read_or_fetch(args.closures_file, lambda: datasf_rows(DATASF_CLOSURES, "SELECT * LIMIT 5000"))
    excavations = read_or_fetch(args.excavations_file, lambda: datasf_rows(DATASF_EXCAVATIONS, "SELECT * LIMIT 5000"))
    wzdx = read_or_fetch(args.wzdx_file, wzdx_rows)
    source_rows = [
        ("SFMTA_TEMPORARY_CLOSURE", row) for row in closures
    ] + [
        ("DATASF_UTILITY_EXCAVATION", row) for row in excavations
    ] + [
        ("511_WZDX", row) for row in wzdx
    ]
    events = [event for source, row in source_rows if (event := normalize_event(source, row, snapshot_date))]
    events.sort(key=lambda row: (row["source"], row["event_id"]))
    shape_rows, _ = route_shapes(network)
    exposures = exposure_rows(events, network)
    event_fields = ["snapshot_date", "source", "evidence_type", "event_id", "event_type", "status", "title", "street", "from_street", "to_street", "start_time", "end_time", "vehicle_impact", "latitude", "longitude", "geometry_json"]
    shape_fields = ["route_id", "route_short_name", "route_long_name", "direction_id", "direction_label", "point_sequence", "latitude", "longitude"]
    exposure_fields = ["snapshot_date", "event_id", "source", "evidence_type", "route_id", "route_short_name", "route_long_name", "direction_id", "exposure_level", "minimum_distance_m", "event_type", "status", "start_time", "end_time"]
    write_csv(output / "feature5_events_current.csv", events, event_fields)
    write_csv(output / "feature5_route_shapes.csv", shape_rows, shape_fields)
    write_csv(output / "feature5_route_exposure_current.csv", exposures, exposure_fields)
    write_guides(output, snapshot_date)
    print(json.dumps({"snapshot_date": snapshot_date, "event_count": len(events), "route_shape_points": len(shape_rows), "exposure_count": len(exposures)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
