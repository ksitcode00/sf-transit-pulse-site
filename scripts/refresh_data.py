#!/usr/bin/env python3
"""Build the public SF Transit Pulse snapshot without exposing API credentials.

The browser never calls 511 directly. GitHub Actions runs this module on a
schedule, reads SF_TRANSIT_511_API_KEY from an encrypted repository secret, and
writes a credential-free JSON snapshot for GitHub Pages.
"""

from __future__ import annotations

import csv
from bisect import bisect_left, bisect_right
import io
import json
import math
import os
import re
import statistics
import sys
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

import requests
from google.transit import gtfs_realtime_pb2


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "site" / "data" / "latest.json"
NETWORK_PATH = ROOT / "site" / "data" / "network.json"
LIVE_TRANSIT_PATH = ROOT / "site" / "data" / "live-transit.json"
ALERTS_ROADS_PATH = ROOT / "site" / "data" / "alerts-roads.json"
PARKING_CONTEXT_PATH = ROOT / "site" / "data" / "parking-context.json"
SAFETY_CONTEXT_PATH = ROOT / "site" / "data" / "safety-context.json"
REFRESH_HEALTH_PATH = ROOT / "site" / "data" / "refresh-health.json"
PARKING_INVENTORY_PATH = ROOT / "data" / "parking-inventory.json"
STATIC_INDEX_PATH = ROOT / "data" / "static-index.json"
PIPELINE_VERSION = "1.8.1"
PARKING_INVENTORY_SCHEMA_VERSION = 2
PARKING_MIN_MATCH_COVERAGE = 0.70
USER_AGENT = "SF-Transit-Pulse/1.0 (+https://github.com/ksitcode00/sf-transit-pulse)"
SF_BOUNDS = {"south": 37.68, "north": 37.84, "west": -122.55, "east": -122.33}
REQUEST_BUDGET = {
    "default_limit_per_hour": 60,
    "core_runs_per_hour": 12,
    "core_requests_per_run": 2,
    "context_runs_per_hour": 4,
    "context_extra_requests_per_run": 2,
    "static_requests_per_day": 1,
}


def load_previous() -> dict[str, Any]:
    if OUTPUT_PATH.exists():
        with OUTPUT_PATH.open(encoding="utf-8") as handle:
            return json.load(handle)
    return {}


def write_json(payload: dict[str, Any], destination: Path, *, compact: bool = False) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(
            payload,
            handle,
            ensure_ascii=False,
            indent=None if compact else 2,
            separators=(",", ":") if compact else None,
            sort_keys=False,
        )
        handle.write("\n")
    temporary.replace(destination)


def write_snapshot(payload: dict[str, Any]) -> None:
    # 中文：Feature 20 会增加班次级站点预测；压缩 JSON 可减少 GitHub Pages
    # 下载量，但不改变公开数据契约或浏览器读取方式。
    # English: Trip-level stop predictions add useful rows, so compact the public
    # payload to reduce page weight without changing its JSON contract.
    write_json(payload, OUTPUT_PATH, compact=True)
    source_status = payload.get("meta", {}).get("source_status", {})
    # Feature 30 · Source-sized public files / 按数据源拆分公开快照
    # 中文：兼容用的 latest.json 仍保留，但页面的 5 分钟刷新只需下载
    # 公交核心文件。道路、停车和安全文件只在各自版本变化时重新读取。
    # English: Keep latest.json for compatibility, while the browser's frequent
    # refresh downloads only transit data and reloads slower contexts on change.
    write_json(
        {
            "meta": payload.get("meta", {}),
            "system": payload.get("system", {}),
            "vehicles": payload.get("vehicles", []),
            "routes": payload.get("routes", []),
            "trip_predictions": payload.get("trip_predictions", []),
            "journey": payload.get("journey", {}),
        },
        LIVE_TRANSIT_PATH,
        compact=True,
    )
    try:
        health = json.loads(REFRESH_HEALTH_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError, json.JSONDecodeError):
        health = {"history": []}
    history = health.get("history", [])
    generated_at = payload.get("meta", {}).get("generated_at")
    transit_observed_at = payload.get("meta", {}).get("source_status", {}).get("transit", {}).get("observed_at")
    gap_seconds = None
    transit_observed_gap_seconds = None
    if history and generated_at:
        try:
            current_time = datetime.fromisoformat(str(generated_at).replace("Z", "+00:00"))
            prior_time = datetime.fromisoformat(str(history[-1]["generated_at"]).replace("Z", "+00:00"))
            gap_seconds = max(0, round((current_time - prior_time).total_seconds()))
        except (KeyError, TypeError, ValueError):
            gap_seconds = None
    if history and transit_observed_at and history[-1].get("transit_observed_at"):
        try:
            current_observed = datetime.fromisoformat(str(transit_observed_at).replace("Z", "+00:00"))
            prior_observed = datetime.fromisoformat(str(history[-1]["transit_observed_at"]).replace("Z", "+00:00"))
            if current_observed > prior_observed:
                transit_observed_gap_seconds = round((current_observed - prior_observed).total_seconds())
        except (TypeError, ValueError):
            transit_observed_gap_seconds = None
    transit_age_seconds = None
    if generated_at and transit_observed_at:
        try:
            generated_time = datetime.fromisoformat(str(generated_at).replace("Z", "+00:00"))
            observed_time = datetime.fromisoformat(str(transit_observed_at).replace("Z", "+00:00"))
            transit_age_seconds = max(0, round((generated_time - observed_time).total_seconds()))
        except (TypeError, ValueError):
            transit_age_seconds = None
    entry = {
        "generated_at": generated_at,
        "transit_observed_at": transit_observed_at,
        "gap_seconds": gap_seconds,
        "transit_observed_gap_seconds": transit_observed_gap_seconds,
        "transit_age_seconds_at_refresh": transit_age_seconds,
        "status": payload.get("meta", {}).get("status"),
    }
    if not history or history[-1].get("generated_at") != generated_at:
        history.append(entry)
    history = history[-288:]
    observed_gaps = [row.get("gap_seconds") for row in history if isinstance(row.get("gap_seconds"), (int, float))]
    transit_gaps = [
        row.get("transit_observed_gap_seconds")
        for row in history
        if isinstance(row.get("transit_observed_gap_seconds"), (int, float))
    ]
    current_is_healthy = (
        payload.get("meta", {}).get("status") == "live"
        and isinstance(transit_age_seconds, (int, float))
        and transit_age_seconds <= 10 * 60
    )
    write_json(
        {
            "status": "HEALTHY" if current_is_healthy else "CHECK_REQUIRED",
            "latest_generated_at": generated_at,
            "latest_transit_observed_at": transit_observed_at,
            "largest_recorded_gap_seconds": max(observed_gaps, default=None),
            "largest_transit_observation_gap_seconds": max(transit_gaps, default=None),
            "latest_transit_age_seconds_at_refresh": transit_age_seconds,
            "history_window": "last 288 refresh attempts",
            "history": history,
        },
        REFRESH_HEALTH_PATH,
        compact=True,
    )
    write_json(
        {
            "source_status": {
                "alerts": source_status.get("alerts", {}),
                "roads": source_status.get("roads", {}),
            },
            "alerts": payload.get("alerts", []),
            "road_events": payload.get("road_events", []),
        },
        ALERTS_ROADS_PATH,
        compact=True,
    )
    write_json(
        {
            "source_status": {"parking": source_status.get("parking", {})},
            "parking": payload.get("parking", {}),
        },
        PARKING_CONTEXT_PATH,
        compact=True,
    )
    write_json(
        {
            "source_status": {"safety": source_status.get("safety", {})},
            "safety": payload.get("safety", {}),
        },
        SAFETY_CONTEXT_PATH,
        compact=True,
    )


def request(url: str, *, params: dict[str, Any] | None = None, timeout: int = 45) -> requests.Response:
    response = requests.get(
        url,
        params=params,
        headers={"User-Agent": USER_AGENT, "Accept": "*/*"},
        timeout=timeout,
    )
    response.raise_for_status()
    return response


def message_text(translated: Any) -> str:
    translations = getattr(translated, "translation", [])
    for item in translations:
        text = str(getattr(item, "text", "")).strip()
        if text:
            return text
    return ""


def event_timestamp(update: Any) -> int | None:
    for name in ("arrival", "departure"):
        if update.HasField(name):
            value = int(getattr(update, name).time or 0)
            if value:
                return value
    return None


def read_gtfs_table(archive: zipfile.ZipFile, name: str) -> list[dict[str, str]]:
    with archive.open(name) as binary:
        text = io.TextIOWrapper(binary, encoding="utf-8-sig", newline="")
        return list(csv.DictReader(text))


def route_sort_key(route_id: str) -> list[tuple[int, Any]]:
    parts = re.split(r"(\d+)", str(route_id))
    return [(0, int(part)) if part.isdigit() else (1, part.casefold()) for part in parts if part]


def simplify_path(points: list[tuple[int, float, float]], max_points: int = 180) -> list[list[float]]:
    ordered = sorted(points, key=lambda row: row[0])
    if len(ordered) <= max_points:
        selected = ordered
    else:
        indices = sorted({round(index * (len(ordered) - 1) / (max_points - 1)) for index in range(max_points)})
        selected = [ordered[index] for index in indices]
    return [[round(lat, 6), round(lon, 6)] for _, lat, lon in selected]


def parse_static_gtfs(archive: zipfile.ZipFile) -> dict[str, Any]:
    trips = read_gtfs_table(archive, "trips.txt")
    routes = read_gtfs_table(archive, "routes.txt")
    stops = read_gtfs_table(archive, "stops.txt")
    shapes = read_gtfs_table(archive, "shapes.txt")
    directions = read_gtfs_table(archive, "directions.txt") if "directions.txt" in archive.namelist() else []
    feed_info = read_gtfs_table(archive, "feed_info.txt") if "feed_info.txt" in archive.namelist() else []

    trip_lookup = {
        row["trip_id"]: {
            "route_id": row.get("route_id", ""),
            "direction_id": row.get("direction_id", ""),
            "headsign": row.get("trip_headsign", ""),
            "shape_id": row.get("shape_id", ""),
        }
        for row in trips
        if row.get("trip_id")
    }
    route_lookup = {
        row.get("route_id", ""): row.get("route_short_name") or row.get("route_long_name") or row.get("route_id", "")
        for row in routes
    }
    stop_lookup = {
        row.get("stop_id", ""): {
            "stop_id": row.get("stop_id", ""),
            "name": row.get("stop_name", ""),
            "lat": float(row["stop_lat"]) if row.get("stop_lat") else None,
            "lon": float(row["stop_lon"]) if row.get("stop_lon") else None,
        }
        for row in stops
        if row.get("stop_id")
    }

    shape_points: dict[str, list[tuple[int, float, float]]] = defaultdict(list)
    shape_distance: dict[str, float] = defaultdict(float)
    for row in shapes:
        shape_id = str(row.get("shape_id") or "")
        if not shape_id or not row.get("shape_pt_lat") or not row.get("shape_pt_lon"):
            continue
        try:
            sequence = int(float(row.get("shape_pt_sequence") or 0))
            lat = float(row["shape_pt_lat"])
            lon = float(row["shape_pt_lon"])
            distance = float(row.get("shape_dist_traveled") or 0)
        except ValueError:
            continue
        shape_points[shape_id].append((sequence, lat, lon))
        shape_distance[shape_id] = max(shape_distance[shape_id], distance)

    shapes_by_route_direction: dict[tuple[str, str], set[str]] = defaultdict(set)
    trips_by_shape: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)
    for trip in trips:
        route_id = str(trip.get("route_id") or "")
        direction_id = str(trip.get("direction_id") or "")
        shape_id = str(trip.get("shape_id") or "")
        if not route_id or not shape_id:
            continue
        shapes_by_route_direction[(route_id, direction_id)].add(shape_id)
        trips_by_shape[(route_id, direction_id, shape_id)].append(trip)

    representative: dict[tuple[str, str], dict[str, str]] = {}
    for key, shape_ids in shapes_by_route_direction.items():
        usable = [shape_id for shape_id in shape_ids if shape_points.get(shape_id)]
        if not usable:
            continue
        shape_id = max(usable, key=lambda value: (shape_distance[value], len(shape_points[value]), value))
        candidates = trips_by_shape[(key[0], key[1], shape_id)]
        representative[key] = min(candidates, key=lambda row: str(row.get("trip_id") or ""))

    # Feature 19 · Preserve every physical shape pattern for journey routing.
    # 中文：route + direction 的最长 shape 继续服务 Network 地图，但 Planner 不再只看
    # 一条代表线；每个 active shape 都保留一个代表 trip 的完整站序，避免分支、短线和
    # 不同终点被最长 shape 吃掉。
    # English: Keep the longest route-direction shape for the overview map, while
    # exposing one stop sequence for every active shape to the journey graph.
    pattern_representative: dict[tuple[str, str, str], dict[str, str]] = {
        key: min(candidates, key=lambda row: str(row.get("trip_id") or ""))
        for key, candidates in trips_by_shape.items()
        if candidates and shape_points.get(key[2])
    }

    selected_trip_to_key = {
        str(trip.get("trip_id") or ""): key
        for key, trip in representative.items()
        if trip.get("trip_id")
    }
    selected_trip_to_pattern = {
        str(trip.get("trip_id") or ""): key
        for key, trip in pattern_representative.items()
        if trip.get("trip_id")
    }
    stop_rows: dict[tuple[str, str], list[tuple[int, str]]] = defaultdict(list)
    pattern_stop_rows: dict[tuple[str, str, str], list[tuple[int, str]]] = defaultdict(list)
    with archive.open("stop_times.txt") as binary:
        text = io.TextIOWrapper(binary, encoding="utf-8-sig", newline="")
        for row in csv.DictReader(text):
            trip_id = str(row.get("trip_id") or "")
            key = selected_trip_to_key.get(trip_id)
            pattern_key = selected_trip_to_pattern.get(trip_id)
            if key is None and pattern_key is None:
                continue
            try:
                sequence = int(float(row.get("stop_sequence") or 0))
            except ValueError:
                sequence = 0
            stop_id = str(row.get("stop_id") or "")
            if key is not None:
                stop_rows[key].append((sequence, stop_id))
            if pattern_key is not None:
                pattern_stop_rows[pattern_key].append((sequence, stop_id))

    direction_labels = {
        (str(row.get("route_id") or ""), str(row.get("direction_id") or "")): str(row.get("direction") or "")
        for row in directions
    }
    route_directions: dict[str, Any] = {}
    patterns: dict[str, Any] = {}
    directions_by_route: dict[str, list[dict[str, str]]] = defaultdict(list)
    for key in sorted(representative, key=lambda value: (route_sort_key(value[0]), value[1])):
        route_id, direction_id = key
        trip = representative[key]
        shape_id = str(trip.get("shape_id") or "")
        label = direction_labels.get(key) or (f"Direction {direction_id}" if direction_id else "Direction unavailable")
        headsign = str(trip.get("trip_headsign") or "")
        selected_stops = []
        seen_stops: set[str] = set()
        for _, stop_id in sorted(stop_rows.get(key, [])):
            stop = stop_lookup.get(stop_id)
            if not stop or stop_id in seen_stops or stop["lat"] is None or stop["lon"] is None:
                continue
            seen_stops.add(stop_id)
            selected_stops.append(stop)
        route_directions[f"{route_id}|{direction_id}"] = {
            "route_id": route_id,
            "direction_id": direction_id,
            "direction_label": label,
            "headsign": headsign,
            "shape_id": shape_id,
            "shape": simplify_path(shape_points[shape_id]),
            "stops": selected_stops,
        }
        directions_by_route[route_id].append(
            {"direction_id": direction_id, "direction_label": label, "headsign": headsign}
        )

    for key in sorted(pattern_representative, key=lambda value: (route_sort_key(value[0]), value[1], value[2])):
        route_id, direction_id, shape_id = key
        trip = pattern_representative[key]
        label = direction_labels.get((route_id, direction_id)) or (f"Direction {direction_id}" if direction_id else "Direction unavailable")
        selected_stops = []
        seen_stops: set[str] = set()
        for _, stop_id in sorted(pattern_stop_rows.get(key, [])):
            stop = stop_lookup.get(stop_id)
            if not stop or stop_id in seen_stops or stop["lat"] is None or stop["lon"] is None:
                continue
            seen_stops.add(stop_id)
            selected_stops.append(stop)
        if len(selected_stops) < 2:
            continue
        patterns[f"{route_id}|{direction_id}|{shape_id}"] = {
            "route_id": route_id,
            "direction_id": direction_id,
            "direction_label": label,
            "headsign": str(trip.get("trip_headsign") or ""),
            "shape_id": shape_id,
            "shape": simplify_path(shape_points[shape_id]),
            "stops": selected_stops,
        }

    route_catalog = []
    for row in sorted(routes, key=lambda item: route_sort_key(str(item.get("route_short_name") or item.get("route_id") or ""))):
        route_id = str(row.get("route_id") or "")
        if not route_id:
            continue
        route_catalog.append(
            {
                "route_id": route_id,
                "route_short_name": str(row.get("route_short_name") or route_id),
                "route_long_name": str(row.get("route_long_name") or ""),
                "route_description": str(row.get("route_desc") or ""),
                "route_type": str(row.get("route_type") or ""),
                "directions": directions_by_route.get(route_id, []),
            }
        )

    feed = feed_info[0] if feed_info else {}
    network = {
        "meta": {
            "source": "511 SF Bay static GTFS",
            "feed_start_date": str(feed.get("feed_start_date") or ""),
            "feed_end_date": str(feed.get("feed_end_date") or ""),
            "feed_version": str(feed.get("feed_version") or ""),
            "route_count": len(route_catalog),
            "route_direction_count": len(route_directions),
            "pattern_count": len(patterns),
        },
        "routes": route_catalog,
        "route_directions": route_directions,
        "patterns": patterns,
    }
    return {
        "trip_lookup": trip_lookup,
        "route_lookup": route_lookup,
        "stop_lookup": stop_lookup,
        "network": network,
    }


def fetch_static_gtfs(api_key: str) -> dict[str, Any]:
    response = request(
        "https://api.511.org/transit/datafeeds",
        params={"api_key": api_key, "operator_id": "SF", "status": "active"},
        timeout=90,
    )
    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        return parse_static_gtfs(archive)


def load_static_gtfs(path: Path) -> dict[str, Any]:
    with zipfile.ZipFile(path) as archive:
        return parse_static_gtfs(archive)


def write_static_index(static: dict[str, Any]) -> None:
    """Persist routing lookups outside site/ so Pages visitors never download them."""

    write_json(
        {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "feed_version": static.get("network", {}).get("meta", {}).get("feed_version"),
            "trip_lookup": static["trip_lookup"],
            "route_lookup": static["route_lookup"],
            "stop_lookup": static["stop_lookup"],
        },
        STATIC_INDEX_PATH,
        compact=True,
    )


def load_static_index() -> dict[str, Any]:
    cached = json.loads(STATIC_INDEX_PATH.read_text(encoding="utf-8"))
    network = json.loads(NETWORK_PATH.read_text(encoding="utf-8"))
    return {
        "trip_lookup": cached["trip_lookup"],
        "route_lookup": cached["route_lookup"],
        "stop_lookup": cached["stop_lookup"],
        "network": network,
    }


def fetch_gtfs_rt(url: str, api_key: str) -> gtfs_realtime_pb2.FeedMessage:
    response = request(url, params={"api_key": api_key, "agency": "SF"})
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    return feed


def inside_sf(lat: float, lon: float) -> bool:
    return SF_BOUNDS["south"] <= lat <= SF_BOUNDS["north"] and SF_BOUNDS["west"] <= lon <= SF_BOUNDS["east"]


def geographic_distance_m(left: tuple[float, float], right: tuple[float, float]) -> float:
    """Return great-circle distance for local evidence windows."""

    lat1, lon1 = left
    lat2, lon2 = right
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * 6_371_000 * math.asin(math.sqrt(value))


def midpoint_percentile_rank(ordered: list[float], value: float) -> float:
    """Place tied values at the middle of their percentile interval."""

    if not ordered:
        return 0.0
    below = bisect_left(ordered, value)
    at_or_below = bisect_right(ordered, value)
    return 100 * (below + (at_or_below - below) / 2) / len(ordered)


def parse_vehicles(feed: gtfs_realtime_pb2.FeedMessage, trip_lookup: dict[str, Any]) -> list[dict[str, Any]]:
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    vehicles: list[dict[str, Any]] = []
    for entity in feed.entity:
        if not entity.HasField("vehicle") or not entity.vehicle.HasField("position"):
            continue
        vehicle = entity.vehicle
        lat = float(vehicle.position.latitude)
        lon = float(vehicle.position.longitude)
        if not inside_sf(lat, lon):
            continue
        trip_id = str(vehicle.trip.trip_id or "")
        static = trip_lookup.get(trip_id, {})
        route_id = str(vehicle.trip.route_id or static.get("route_id") or "").strip()
        direction_id = str(vehicle.trip.direction_id) if vehicle.trip.HasField("direction_id") else str(static.get("direction_id", ""))
        timestamp = int(vehicle.timestamp or 0)
        vehicles.append(
            {
                "vehicle_id": str(vehicle.vehicle.id or entity.id),
                "trip_id": trip_id,
                "route_id": route_id or "UNKNOWN",
                "direction_id": direction_id,
                "direction_label": f"Direction {direction_id}" if direction_id != "" else "Direction unavailable",
                "lat": round(lat, 6),
                "lon": round(lon, 6),
                "bearing": round(float(vehicle.position.bearing), 1) if vehicle.position.HasField("bearing") else None,
                "speed_mps": round(float(vehicle.position.speed), 2) if vehicle.position.HasField("speed") else None,
                "age_seconds": max(0, now_epoch - timestamp) if timestamp else None,
            }
        )
    return vehicles


def health_label(predictions: list[int]) -> tuple[str, float | None, int, int, int, str]:
    times = sorted(set(predictions))
    if len(times) < 3:
        return "LIMITED_REALTIME_DATA", None, 0, 0, 0, "LIMITED"
    gaps = [(b - a) / 60 for a, b in zip(times, times[1:]) if 0 < b - a <= 7200]
    if len(gaps) < 2:
        return "LIMITED_REALTIME_DATA", None, 0, 0, 0, "LIMITED"
    median_gap = statistics.median(gaps)
    bunching = sum(gap < 4 for gap in gaps)
    large = sum(gap > max(15, median_gap * 1.8) for gap in gaps)
    severe = sum(gap > max(25, median_gap * 2.5) for gap in gaps)
    quality = "GOOD" if len(times) >= 6 else "MODERATE"
    if severe or large >= 2:
        health = "UNSTABLE"
    elif bunching or large:
        health = "WATCH"
    else:
        health = "STABLE"
    return health, round(median_gap, 1), bunching, large, severe, quality


def build_spacing_events(
    predictions: list[int],
    reference_stop_id: str | None,
    stop_lookup: dict[str, Any],
) -> list[dict[str, Any]]:
    """Return explainable bunching/gap observations at the reference stop.

    These are prediction-spacing events at one stop, not inferred vehicle
    locations. Publishing that distinction prevents the map from pretending
    to know where an anomaly physically began.
    """

    times = sorted(set(predictions))
    gaps = [
        ((later - earlier) / 60, later)
        for earlier, later in zip(times, times[1:])
        if 0 < later - earlier <= 7200
    ]
    if len(gaps) < 2:
        return []
    typical_gap = statistics.median(gap for gap, _ in gaps)
    stop = stop_lookup.get(str(reference_stop_id or ""), {})
    events = []
    for gap_min, observed_for in gaps:
        event_type = None
        if gap_min > max(25, typical_gap * 2.5):
            event_type = "SEVERE_GAP"
        elif gap_min > max(15, typical_gap * 1.8):
            event_type = "SERVICE_GAP"
        elif gap_min < 4:
            event_type = "BUNCHING"
        if event_type is None:
            continue
        events.append(
            {
                "type": event_type,
                "gap_min": round(gap_min, 1),
                "typical_gap_min": round(typical_gap, 1),
                "reference_stop_id": reference_stop_id,
                "location_name": stop.get("name") or None,
                "lat": stop.get("lat"),
                "lon": stop.get("lon"),
                "observation_scope": "PREDICTION_REFERENCE_STOP",
                "prediction_time": datetime.fromtimestamp(observed_for, timezone.utc).isoformat(),
            }
        )
    return events


def parse_route_health(
    feed: gtfs_realtime_pb2.FeedMessage,
    trip_lookup: dict[str, Any],
    vehicles: list[dict[str, Any]],
    stop_lookup: dict[str, Any],
) -> list[dict[str, Any]]:
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    horizon = now_epoch + 2 * 3600
    by_reference: dict[tuple[str, str, str], list[int]] = defaultdict(list)
    for entity in feed.entity:
        if not entity.HasField("trip_update"):
            continue
        update = entity.trip_update
        trip_id = str(update.trip.trip_id or "")
        static = trip_lookup.get(trip_id, {})
        route_id = str(update.trip.route_id or static.get("route_id") or "").strip()
        direction_id = str(update.trip.direction_id) if update.trip.HasField("direction_id") else str(static.get("direction_id", ""))
        if not route_id:
            continue
        for stop_update in update.stop_time_update:
            timestamp = event_timestamp(stop_update)
            stop_id = str(stop_update.stop_id or "")
            if timestamp and stop_id and now_epoch - 300 <= timestamp <= horizon:
                by_reference[(route_id, direction_id, stop_id)].append(timestamp)

    selected: dict[tuple[str, str], tuple[str, list[int]]] = {}
    for (route_id, direction_id, stop_id), predictions in by_reference.items():
        key = (route_id, direction_id)
        if key not in selected or len(predictions) > len(selected[key][1]):
            selected[key] = (stop_id, predictions)

    vehicle_counts = Counter((row["route_id"], row["direction_id"]) for row in vehicles)
    keys = set(selected) | set(vehicle_counts)
    rows = []
    for route_id, direction_id in keys:
        reference_stop, predictions = selected.get((route_id, direction_id), (None, []))
        health, median_gap, bunching, large, severe, quality = health_label(predictions)
        reference_stop_detail = stop_lookup.get(str(reference_stop or ""), {})
        rows.append(
            {
                "route_id": route_id,
                "direction_id": direction_id,
                "direction_label": f"Direction {direction_id}" if direction_id != "" else "Direction unavailable",
                "vehicle_count": vehicle_counts[(route_id, direction_id)],
                "health": health,
                "median_headway_min": median_gap,
                "predictions_observed": len(set(predictions)),
                "reference_stop_id": reference_stop,
                "reference_stop_name": reference_stop_detail.get("name") or None,
                "bunching_events": bunching,
                "large_gap_events": large,
                "severe_gap_events": severe,
                "evidence_quality": quality,
                "spacing_events": build_spacing_events(predictions, reference_stop, stop_lookup),
            }
        )
    return sorted(rows, key=lambda row: (-row["vehicle_count"], row["route_id"], row["direction_id"]))


def parse_trip_predictions(
    feed: gtfs_realtime_pb2.FeedMessage,
    trip_lookup: dict[str, Any],
) -> list[dict[str, Any]]:
    """Keep concrete GTFS-RT trips for routing without exposing credentials.

    Feature 20 · Trip-level realtime routing / 班次级实时规划

    中文：之前 Trip Updates 只被汇总成线路车距，导致 trip_id 和每一站的
    arrival/departure 在写入 latest.json 前丢失。这里复用同一次 511 请求，保留
    未来两小时内的具体班次和站点预测；不会增加 API 请求数。只保存规划所需字段，
    既能让后端计算真实换乘时间，也避免把完整 protobuf 原样公开。

    English: Route-health aggregation used to discard the concrete trip and
    stop timestamps needed by the journey planner. Reuse the existing feed call
    and publish only the next two hours of routing fields. This adds zero API
    requests and keeps the public cache intentionally compact.
    """

    now_epoch = int(datetime.now(timezone.utc).timestamp())
    horizon = now_epoch + 2 * 3600
    rows: list[dict[str, Any]] = []
    for entity in feed.entity:
        if not entity.HasField("trip_update"):
            continue
        update = entity.trip_update
        trip_id = str(update.trip.trip_id or "").strip()
        static = trip_lookup.get(trip_id, {})
        route_id = str(update.trip.route_id or static.get("route_id") or "").strip()
        direction_id = (
            str(update.trip.direction_id)
            if update.trip.HasField("direction_id")
            else str(static.get("direction_id", ""))
        )
        if not trip_id or not route_id:
            continue

        stops = []
        for stop_update in update.stop_time_update:
            stop_id = str(stop_update.stop_id or "").strip()
            arrival_time = (
                int(stop_update.arrival.time or 0)
                if stop_update.HasField("arrival")
                else 0
            )
            departure_time = (
                int(stop_update.departure.time or 0)
                if stop_update.HasField("departure")
                else 0
            )
            usable_time = departure_time or arrival_time
            if not stop_id or not usable_time:
                continue
            if usable_time < now_epoch - 300 or usable_time > horizon:
                continue
            stops.append(
                {
                    "stop_id": stop_id,
                    "stop_sequence": int(stop_update.stop_sequence or 0),
                    "arrival_time": arrival_time or None,
                    "departure_time": departure_time or None,
                }
            )
        stops.sort(key=lambda row: (row["stop_sequence"], row["arrival_time"] or row["departure_time"] or 0))
        if not stops:
            continue
        rows.append(
            {
                "trip_id": trip_id,
                "route_id": route_id,
                "direction_id": direction_id,
                "shape_id": str(static.get("shape_id") or ""),
                "vehicle_id": str(update.vehicle.id or "") if update.HasField("vehicle") else "",
                "update_timestamp": int(update.timestamp or 0) or None,
                "stops": stops,
            }
        )
    return sorted(
        rows,
        key=lambda row: (
            row["stops"][0]["departure_time"] or row["stops"][0]["arrival_time"] or 0,
            row["route_id"],
            row["trip_id"],
        ),
    )


def active_now(periods: Iterable[Any], now_epoch: int) -> bool:
    periods = list(periods)
    if not periods:
        return True
    for period in periods:
        start = int(period.start or 0)
        end = int(period.end or 0)
        if (not start or start <= now_epoch) and (not end or now_epoch <= end):
            return True
    return False


def parse_alerts(feed: gtfs_realtime_pb2.FeedMessage) -> list[dict[str, Any]]:
    now_epoch = int(datetime.now(timezone.utc).timestamp())
    alerts = []
    for entity in feed.entity:
        if not entity.HasField("alert") or not active_now(entity.alert.active_period, now_epoch):
            continue
        alert = entity.alert
        route_ids = sorted({str(item.route_id) for item in alert.informed_entity if item.route_id})
        direction_ids = sorted(
            {
                str(item.direction_id)
                for item in alert.informed_entity
                if item.HasField("direction_id")
            }
        )
        title = message_text(alert.header_text) or "Muni service notice"
        description = message_text(alert.description_text) or "See the official service alert for details."
        alerts.append(
            {
                "id": str(entity.id),
                "route_ids": route_ids,
                "direction_id": direction_ids[0] if len(direction_ids) == 1 else None,
                "route_match_status": "MATCHED" if route_ids else "NETWORK_WIDE",
                "title": title[:180],
                "description": description[:600],
            }
        )
    return alerts[:20]


def flatten_events(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if not isinstance(payload, dict):
        return []
    for key in ("events", "Events", "traffic_events", "features"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    return []


def road_event_collection(payload: Any) -> list[Any]:
    """Return the raw 511 event collection or reject an unknown schema.

    中文：合法的空列表代表“这次确实返回 0 条”；找不到列表字段则代表响应
    结构异常。两者必须分开，避免 API 故障被网页误写成“没有道路事件”。

    English: A valid empty collection means zero reported events. A payload
    without a recognized collection is a source failure, not an empty result.
    """

    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        raise ValueError(f"511 road feed returned {type(payload).__name__}, not an event collection.")
    for key in ("events", "Events", "traffic_events", "features", "data", "results"):
        if key not in payload:
            continue
        value = payload[key]
        if not isinstance(value, list):
            raise ValueError(f"511 road feed field {key!r} is not a list.")
        return value
    raise ValueError("511 road feed returned no recognized event collection.")


def first_value(item: dict[str, Any], keys: Iterable[str]) -> Any:
    for key in keys:
        if key in item and item[key] not in (None, "", []):
            return item[key]
    return None


def identifier_list(value: Any) -> list[str]:
    if isinstance(value, list):
        values = []
        for item in value:
            if isinstance(item, dict):
                values.extend(identifier_list(first_value(item, ("route_id", "route", "id", "name"))))
            else:
                values.extend(identifier_list(item))
        return sorted(set(values))
    if value in (None, ""):
        return []
    return sorted({part.strip() for part in re.split(r"[,;/|]", str(value)) if part.strip()})


def geometry_points(raw: dict[str, Any], max_points: int = 80) -> list[list[float]]:
    """Return an ordered, compact SF-only road-event geometry."""

    properties = raw.get("properties") if isinstance(raw.get("properties"), dict) else {}
    # GeoJSON/WZDx uses `geometry`; Open511 Traffic Events uses `geography`.
    # Enhanced closure shapes have appeared under both closure spellings.
    geometry = next(
        (
            candidate
            for container in (raw, properties)
            for key in ("geometry", "geography", "closure_geography", "closure_geometry")
            if isinstance((candidate := container.get(key)), dict)
        ),
        {},
    )
    coordinates = geometry.get("coordinates")
    points: list[tuple[float, float]] = []

    def collect(value: Any) -> None:
        if isinstance(value, (list, tuple)) and len(value) >= 2 and all(isinstance(item, (int, float)) for item in value[:2]):
            lon, lat = float(value[0]), float(value[1])
            if inside_sf(lat, lon):
                points.append((lat, lon))
            return
        if isinstance(value, (list, tuple)):
            for child in value:
                collect(child)

    collect(coordinates)
    if len(points) > max_points:
        indices = sorted(
            {
                round(index * (len(points) - 1) / (max_points - 1))
                for index in range(max_points)
            }
        )
        points = [points[index] for index in indices]
    return [[round(lat, 6), round(lon, 6)] for lat, lon in points]


def geometry_center(raw: dict[str, Any]) -> tuple[float | None, float | None]:
    points = geometry_points(raw)
    if points:
        return (
            statistics.median(point[0] for point in points),
            statistics.median(point[1] for point in points),
        )
    properties = raw.get("properties") if isinstance(raw.get("properties"), dict) else raw
    lat = first_value(properties, ("lat", "latitude", "y"))
    lon = first_value(properties, ("lon", "lng", "longitude", "x"))
    try:
        lat_number, lon_number = float(lat), float(lon)
    except (TypeError, ValueError):
        return None, None
    return (lat_number, lon_number) if inside_sf(lat_number, lon_number) else (None, None)


def parse_road_events(payload: Any) -> list[dict[str, Any]]:
    rows = []
    for raw in flatten_events(payload):
        properties = raw.get("properties") if isinstance(raw.get("properties"), dict) else raw
        title = first_value(properties, ("headline", "event_type", "eventType", "type", "name")) or "Road event"
        description = first_value(properties, ("description", "event_description", "details", "status")) or "Active Bay Area road context"
        roads = first_value(properties, ("roads", "road_names", "roadName", "road"))
        if isinstance(roads, list):
            names = []
            for value in roads:
                if isinstance(value, dict):
                    names.append(str(first_value(value, ("name", "road_name", "roadName")) or ""))
                else:
                    names.append(str(value))
            road_label = ", ".join(filter(None, names))
        else:
            road_label = str(roads or "")
        route_ids = identifier_list(
            first_value(properties, ("route_ids", "affected_route_ids", "affected_transit_routes", "transit_routes"))
        )
        lat, lon = geometry_center(raw)
        geometry = geometry_points(raw)
        # Keep every spatially relevant SF event. Items with no SF geometry and
        # no explicit transit route cannot affect a journey and only inflate the cache.
        if not route_ids and lat is None and not geometry:
            continue
        rows.append(
            {
                "route_ids": route_ids,
                "route_match_status": "MATCHED" if route_ids else "UNAVAILABLE",
                "title": str(title)[:180],
                "description": (f"{road_label} · " if road_label else "") + str(description)[:500],
                "lat": round(lat, 6) if lat is not None else None,
                "lon": round(lon, 6) if lon is not None else None,
                "geometry": geometry,
            }
        )
    return rows


def datasf_records(
    dataset_id: str,
    query: str,
    page_size: int,
    *,
    max_pages: int = 1,
) -> list[dict[str, Any]]:
    """Read one or more DataSF v3 pages and surface silent API errors.

    中文：DataSF 对单页过大的查询有时不会返回标准 HTTP 错误，而是给一个没有
    rows 的说明对象。Feature 23/24 改成 5,000 行一页，并在响应结构异常时直接
    报错，避免把“查询失败”误判为“城市里没有数据”。

    English: DataSF can return a message object instead of rows for oversized or
    invalid queries. Small pages plus explicit payload validation keep a source
    failure from being misread as an empty city dataset.
    """

    records: list[dict[str, Any]] = []
    for page_number in range(1, max_pages + 1):
        response = request(
            f"https://data.sf.gov/api/v3/views/{dataset_id}/query.json",
            params={"pageNumber": page_number, "pageSize": page_size, "query": query},
            timeout=75,
        )
        payload = response.json()
        page_rows: list[dict[str, Any]] | None = payload if isinstance(payload, list) else None
        if isinstance(payload, dict):
            for key in ("data", "results", "rows"):
                if isinstance(payload.get(key), list):
                    page_rows = payload[key]
                    break
        if page_rows is None:
            detail = payload.get("message") if isinstance(payload, dict) else None
            raise ValueError(f"DataSF {dataset_id} returned no row collection: {detail or type(payload).__name__}")
        records.extend(row for row in page_rows if isinstance(row, dict))
        if len(page_rows) < page_size:
            break
    return records


def canonical_meter_id(value: Any) -> str:
    """Normalize formatting differences without inventing a meter identity."""

    return re.sub(r"[^A-Z0-9]", "", str(value or "").strip().upper())


def load_parking_inventory() -> list[dict[str, Any]]:
    """Cache weekly meter-space locations used to geolocate paid sessions."""

    if PARKING_INVENTORY_PATH.exists():
        try:
            cached = json.loads(PARKING_INVENTORY_PATH.read_text(encoding="utf-8"))
            generated = datetime.fromisoformat(
                str(cached.get("generated_at") or "").replace("Z", "+00:00")
            )
            if generated.tzinfo is None:
                generated = generated.replace(tzinfo=timezone.utc)
            if (
                cached.get("schema_version") == PARKING_INVENTORY_SCHEMA_VERSION
                and datetime.now(timezone.utc) - generated <= timedelta(days=7)
            ):
                return list(cached.get("meters", []))
        except (OSError, TypeError, ValueError, json.JSONDecodeError):
            pass

    query = """
SELECT post_id, parking_space_id, latitude, longitude, street_name, street_num,
       active_meter_flag, on_offstreet_type, data_as_of
WHERE post_id IS NOT NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
LIMIT 40000
""".strip()
    rows = datasf_records("8vzz-qzz9", query, 5000, max_pages=8)
    meters = []
    seen_spaces = set()
    for source_row in rows:
        # DataSF v3 may preserve display-name casing for this older inventory.
        # Normalize keys once so both POST_ID and post_id satisfy the same contract.
        row = {str(key).strip().casefold(): value for key, value in source_row.items()}
        # Some DataSF v3 responses currently omit PARKING_SPACE_ID even though
        # the field remains in the published schema. The stable Socrata row id
        # still identifies one inventory record, so it is a safe fallback for
        # deduplicating spaces; POST_ID remains the transaction join key.
        space_id = str(row.get("parking_space_id") or row.get(":id") or "")
        post_id = canonical_meter_id(row.get("post_id"))
        active_flag = str(row.get("active_meter_flag") or "").strip().upper()
        street_type = str(row.get("on_offstreet_type") or "").strip().upper()
        try:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        if (
            not space_id
            or not post_id
            or active_flag not in {"M", "P", "T"}
            or street_type != "ON"
            or space_id in seen_spaces
            or not inside_sf(lat, lon)
        ):
            continue
        seen_spaces.add(space_id)
        meters.append(
            {
                "post_id": post_id,
                "parking_space_id": space_id,
                "lat": round(lat, 6),
                "lon": round(lon, 6),
                "street": " ".join(
                    filter(
                        None,
                        [str(row.get("street_num") or ""), str(row.get("street_name") or "")],
                    )
                ),
                "active_meter_flag": active_flag,
            }
        )
    if not meters:
        first_keys = sorted(rows[0].keys()) if rows else []
        raise ValueError(
            "Parking meter inventory returned no usable on-street spaces "
            f"from {len(rows)} rows; first-row fields: {first_keys}."
        )
    write_json(
        {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "schema_version": PARKING_INVENTORY_SCHEMA_VERSION,
            "source": "DataSF Parking Meters 8vzz-qzz9",
            "meter_count": len(meters),
            "meters": meters,
        },
        PARKING_INVENTORY_PATH,
        compact=True,
    )
    return meters


def build_parking_pressure(
    rows: list[dict[str, Any]],
    meters: list[dict[str, Any]],
) -> dict[str, Any]:
    """Create destination-level paid-parking pressure cells."""

    positions_by_post: dict[str, list[dict[str, Any]]] = defaultdict(list)
    cells: dict[tuple[float, float], dict[str, Any]] = {}
    for meter in meters:
        try:
            lat, lon = float(meter["lat"]), float(meter["lon"])
        except (KeyError, TypeError, ValueError):
            continue
        post_id = canonical_meter_id(meter.get("post_id"))
        if not post_id:
            continue
        positions_by_post[post_id].append(meter)
        key = (round(round(lat / 0.002) * 0.002, 3), round(round(lon / 0.002) * 0.002, 3))
        cell = cells.setdefault(
            key,
            {
                "lat": key[0],
                "lon": key[1],
                "metered_spaces": 0,
                "active_paid_sessions_proxy": 0,
                "starts_15m": 0,
                "starts_30m": 0,
                "starts_60m": 0,
                "starts_90m": 0,
                "previous_30m_starts": 0,
            },
        )
        cell["metered_spaces"] += 1

    parsed = []
    for row in rows:
        try:
            started = datetime.fromisoformat(
                str(row.get("session_start_dt", "")).replace("Z", "+00:00")
            )
        except ValueError:
            continue
        if started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        ended = None
        try:
            ended = datetime.fromisoformat(
                str(row.get("session_end_dt", "")).replace("Z", "+00:00")
            )
            if ended.tzinfo is None:
                ended = ended.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
        parsed.append((started, ended, canonical_meter_id(row.get("post_id")), str(row.get("street_block") or "")))
    if not parsed or not cells:
        return {
            "status": "PARKING_PRESSURE_UNAVAILABLE",
            "detail": "Parking sessions or meter inventory could not be matched.",
            "cells": [],
        }

    raw_session_count = len(parsed)
    # Feature 29 · Parking renewal deduplication / 停车续费去重
    # 中文：旧版把所有相同 post_id 的重叠记录都当作续费，但一个付费站可能服务
    # 多个车位，会误删两辆车各自的合法付费。现在只有明确“一 post 对一普通车位”
    # 时才合并；多车位或 P 类按车牌付费站保留原始记录。
    # English: The old rule merged every overlapping post_id, but one paystation
    # can serve multiple spaces. Merge only verified one-post/one-space meters;
    # retain concurrent records for multi-space and P-type paystations.
    sessions_by_post: dict[str, list[tuple[datetime, datetime | None, str]]] = defaultdict(list)
    for started, ended, post_id, street in sorted(parsed, key=lambda row: (row[2], row[0])):
        existing = sessions_by_post[post_id]
        positions = positions_by_post.get(post_id, [])
        one_space_meter = (
            len(positions) == 1
            and str(positions[0].get("active_meter_flag") or "M").upper() != "P"
        )
        if one_space_meter and existing and existing[-1][1] is not None and started <= existing[-1][1]:
            prior_start, prior_end, prior_street = existing[-1]
            merged_end = max(value for value in (prior_end, ended) if value is not None)
            existing[-1] = (prior_start, merged_end, prior_street or street)
        else:
            existing.append((started, ended, street))
    parsed = [
        (started, ended, post_id, street)
        for post_id, sessions in sessions_by_post.items()
        for started, ended, street in sessions
    ]

    newest = max(row[0] for row in parsed)
    block_counts = Counter()
    unmatched = 0
    matched_posts = set()
    for started, ended, post_id, street in parsed:
        positions = positions_by_post.get(post_id, [])
        if not positions:
            unmatched += 1
            continue
        matched_posts.add(post_id)
        mean_lat = statistics.mean(float(row["lat"]) for row in positions)
        mean_lon = statistics.mean(float(row["lon"]) for row in positions)
        key = (
            round(round(mean_lat / 0.002) * 0.002, 3),
            round(round(mean_lon / 0.002) * 0.002, 3),
        )
        cell = cells.get(key)
        if cell is None:
            continue
        age_min = (newest - started).total_seconds() / 60
        if 0 <= age_min <= 15:
            cell["starts_15m"] += 1
        if 0 <= age_min <= 30:
            cell["starts_30m"] += 1
        elif 30 < age_min <= 60:
            cell["previous_30m_starts"] += 1
        if 0 <= age_min <= 60:
            cell["starts_60m"] += 1
        if 0 <= age_min <= 90:
            cell["starts_90m"] += 1
        if ended is not None and started <= newest <= ended:
            cell["active_paid_sessions_proxy"] += 1
        if street and 0 <= age_min <= 180:
            block_counts[street] += 1

    ratios = []
    for cell in cells.values():
        inventory = max(1, int(cell["metered_spaces"]))
        ratio = cell["active_paid_sessions_proxy"] / inventory
        cell["paid_session_pressure_ratio"] = round(ratio, 3)
        recent = cell["starts_30m"]
        previous = cell["previous_30m_starts"]
        if recent >= previous + 2 and recent >= previous * 1.2:
            cell["trend"] = "RISING"
        elif previous >= recent + 2 and recent <= previous * 0.8:
            cell["trend"] = "FALLING"
        else:
            cell["trend"] = "STEADY"
        ratios.append(ratio)
    ratio_distribution = sorted(value for value in ratios if value > 0) or [0.0]
    for cell in cells.values():
        percentile_value = (
            round(
                100
                * bisect_right(ratio_distribution, cell["paid_session_pressure_ratio"])
                / len(ratio_distribution)
            )
            if cell["paid_session_pressure_ratio"] > 0
            else 0
        )
        cell["relative_pressure_percentile"] = percentile_value
        if not cell["active_paid_sessions_proxy"] and not cell["starts_60m"]:
            # Zero transactions may mean the meter is outside charging hours;
            # it is not evidence that parking demand is low.
            cell["pressure_label"] = "NO_RECENT_PAID_ACTIVITY"
        elif percentile_value >= 90:
            cell["pressure_label"] = "VERY_HIGH"
        elif percentile_value >= 70:
            cell["pressure_label"] = "HIGH"
        elif percentile_value >= 35:
            cell["pressure_label"] = "MODERATE"
        else:
            cell["pressure_label"] = "LOW"

    cell_rows = sorted(cells.values(), key=lambda row: (row["lat"], row["lon"]))
    match_coverage_ratio = round((len(parsed) - unmatched) / max(1, len(parsed)), 3)
    return {
        "status": "DESTINATION_PAID_PARKING_PRESSURE",
        "detail": (
            "Active paid-session and recent-start proxies near on-street meter inventory. "
            "This does not measure physical occupancy or open spaces."
        ),
        "source_snapshot_time": newest.isoformat(),
        "raw_session_count": raw_session_count,
        "deduplicated_session_count": len(parsed),
        "meter_inventory_count": len(meters),
        "matched_transaction_count": len(parsed) - unmatched,
        "unmatched_transaction_count": unmatched,
        "matched_post_count": len(matched_posts),
        "match_coverage_ratio": match_coverage_ratio,
        "minimum_match_coverage_ratio": PARKING_MIN_MATCH_COVERAGE,
        "mapping_quality": (
            "SUFFICIENT_FOR_RELATIVE_GUIDANCE"
            if match_coverage_ratio >= PARKING_MIN_MATCH_COVERAGE
            else "LIMITED_EVIDENCE"
        ),
        "renewal_records_merged": raw_session_count - len(parsed),
        "multi_space_or_paystation_post_count": sum(
            1
            for post_id, positions in positions_by_post.items()
            if len(positions) > 1
            or any(str(row.get("active_meter_flag") or "").upper() == "P" for row in positions)
        ),
        "recent_3h_transaction_count": sum(block_counts.values()),
        "busiest_blocks": [
            {"street_block": street, "payments_3h": count}
            for street, count in block_counts.most_common(8)
        ],
        "cells": cell_rows,
    }


def refresh_parking() -> dict[str, Any]:
    latest_rows = datasf_records(
        "imvp-dq3v",
        "SELECT max(session_start_dt) AS latest_session_start WHERE session_start_dt IS NOT NULL",
        1,
    )
    latest_value = next(
        (
            value
            for key, value in (latest_rows[0] if latest_rows else {}).items()
            if "latest" in str(key).casefold() and value
        ),
        None,
    )
    if not latest_value:
        raise ValueError("Parking source did not report its latest session timestamp.")
    latest = datetime.fromisoformat(str(latest_value).replace("Z", "+00:00"))
    if latest.tzinfo is None:
        latest = latest.replace(tzinfo=timezone.utc)
    # DataSF exposes this field as a floating timestamp and rejects a `+00:00`
    # suffix in its v3 query endpoint, even when the returned value is parsed as UTC.
    since = (latest - timedelta(hours=3)).replace(tzinfo=None).isoformat(timespec="seconds")
    query = f"""
SELECT session_start_dt, session_end_dt, post_id, street_block
WHERE session_start_dt >= '{since}'
ORDER BY session_start_dt DESC
LIMIT 50000
""".strip()
    rows = datasf_records("imvp-dq3v", query, 5000, max_pages=10)
    result = build_parking_pressure(rows, load_parking_inventory())
    source_lag_minutes = max(
        0,
        round((datetime.now(timezone.utc) - latest).total_seconds() / 60),
    )
    result["source_lag_minutes_at_check"] = source_lag_minutes
    result["timeliness_status"] = (
        "DELAYED_SOURCE" if source_lag_minutes > 180 else "CURRENT_SOURCE_WINDOW"
    )
    result["availability_label"] = "LATEST_AVAILABLE_PAID_PARKING_ACTIVITY"
    return result


SAFETY_CATEGORY_WEIGHTS = {
    "homicide": 5.0,
    "rape": 5.0,
    "robbery": 4.0,
    "assault": 3.0,
    "weapons": 3.0,
    "arson": 3.0,
    "burglary": 2.0,
    "motor vehicle theft": 2.0,
    "larceny theft": 1.0,
    "vandalism": 1.0,
}


def safety_category_weight(category: Any) -> float:
    normalized = str(category or "").strip().casefold()
    return next(
        (weight for label, weight in SAFETY_CATEGORY_WEIGHTS.items() if label in normalized),
        1.0,
    )


def build_safety_context(
    rows: list[dict[str, Any]],
    muni_stops: Iterable[tuple[float, float]] | None = None,
) -> dict[str, Any]:
    """Create deduplicated, multi-window historical context for journey comparison."""

    # Feature 31 · Safety methodology upgrade / 历史事件方法升级
    # 中文：原版本只有 365 天事件数量，重复记录、近期变化和事件类别都无法区分。
    # 新版本优先按 incident_id 去重，计算 30/90/365 天窗口与类别权重，再聚合到
    # 约 100 米网格。权重只用于相对比较，不代表伤害概率或个人安全风险。
    # English: Deduplicate by incident ID, preserve 30/90/365-day windows, and
    # apply a transparent category weight before aggregating to ~100 m cells.
    # The score is relative historical context, never a personal-risk estimate.
    raw_count = len(rows)
    parsed_records: dict[str, tuple[tuple[float, float], datetime, float]] = {}
    aggregate_rows = []
    latest_values: list[datetime] = []
    for index, row in enumerate(rows):
        try:
            key = (round(float(row["latitude"]), 3), round(float(row["longitude"]), 3))
        except (KeyError, TypeError, ValueError):
            continue
        if not inside_sf(*key):
            continue
        raw_time = row.get("incident_datetime") or row.get("latest_incident_datetime")
        occurred = None
        if raw_time:
            try:
                occurred = datetime.fromisoformat(str(raw_time).replace("Z", "+00:00"))
                if occurred.tzinfo is None:
                    occurred = occurred.replace(tzinfo=timezone.utc)
                latest_values.append(occurred)
            except ValueError:
                occurred = None
        # DataSF can publish more than one source row for the same incident.
        # incident_id is the event identity; row_id is only the last-resort row identity.
        incident_id = str(row.get("incident_id") or row.get("row_id") or "").strip()
        if incident_id and occurred:
            parsed_records.setdefault(
                incident_id,
                (key, occurred, safety_category_weight(row.get("incident_category"))),
            )
            continue
        try:
            count = int(float(row.get("incident_count", 0) or 0))
        except (TypeError, ValueError):
            count = 0
        if count > 0:
            aggregate_rows.append((key, count))

    metrics: dict[tuple[float, float], dict[str, float]] = defaultdict(
        lambda: {"count_30": 0, "count_90": 0, "count_365": 0, "weighted_365": 0.0}
    )
    reference_time = datetime.now(timezone.utc)
    for key, occurred, weight in parsed_records.values():
        age_days = (reference_time - occurred).total_seconds() / 86400
        if age_days < 0 or age_days > 365:
            continue
        metrics[key]["count_365"] += 1
        metrics[key]["weighted_365"] += weight
        if age_days <= 90:
            metrics[key]["count_90"] += 1
        if age_days <= 30:
            metrics[key]["count_30"] += 1
    # Backward-compatible input used by tests and retained snapshots built from
    # the older grouped query. It receives neutral weight and no invented trend.
    for key, count in aggregate_rows:
        metrics[key]["count_365"] += count
        metrics[key]["weighted_365"] += count

    if not metrics:
        return {
            "status": "CITY_CONTEXT_ONLY",
            "detail": "No usable location cells were returned for journey comparison.",
            "cells": [],
        }

    nearby: dict[tuple[float, float], dict[str, float]] = {}
    for lat, lon in metrics:
        nearby_metrics = {name: 0.0 for name in ("count_30", "count_90", "count_365", "weighted_365")}
        for lat_offset in range(-2, 3):
            for lon_offset in range(-3, 4):
                if math.hypot(lat_offset * 110.54, lon_offset * 88.0) > 250:
                    continue
                neighbor = metrics.get((round(lat + lat_offset / 1000, 3), round(lon + lon_offset / 1000, 3)))
                if neighbor:
                    for name in nearby_metrics:
                        nearby_metrics[name] += neighbor[name]
        # Recent windows are deliberately bounded additions to the long-term
        # score so a short spike matters without erasing the 365-day baseline.
        nearby_metrics["context_score"] = (
            nearby_metrics["weighted_365"]
            + nearby_metrics["count_90"] * 0.75
            + nearby_metrics["count_30"] * 1.5
        )
        nearby[(lat, lon)] = nearby_metrics

    local_context_scores = {
        key: (
            value["weighted_365"]
            + value["count_90"] * 0.75
            + value["count_30"] * 1.5
        )
        for key, value in metrics.items()
    }

    def context_score_at(lat: float, lon: float) -> float:
        score = 0.0
        rounded_lat, rounded_lon = round(lat, 3), round(lon, 3)
        for lat_offset in range(-3, 4):
            for lon_offset in range(-4, 5):
                key = (
                    round(rounded_lat + lat_offset / 1000, 3),
                    round(rounded_lon + lon_offset / 1000, 3),
                )
                cell_score = local_context_scores.get(key)
                if cell_score is None or geographic_distance_m((lat, lon), key) > 250:
                    continue
                score += cell_score
        return round(score, 2)

    stop_points = list(muni_stops or [])
    if stop_points:
        distribution = sorted(context_score_at(float(lat), float(lon)) for lat, lon in stop_points)
        baseline = "ALL_MUNI_STOPS"
    else:
        # Backward-compatible fallback for isolated unit tests and older tools.
        distribution = sorted(value["context_score"] for value in nearby.values())
        baseline = "OBSERVED_INCIDENT_CELLS_FALLBACK"
    cells = []
    for lat, lon in sorted(metrics):
        local = metrics[(lat, lon)]
        area = nearby[(lat, lon)]
        recent_30 = area["count_30"]
        prior_monthly = max(0.0, area["count_90"] - recent_30) / 2
        trend = "RISING" if recent_30 >= prior_monthly + 2 and recent_30 >= prior_monthly * 1.25 \
            else "FALLING" if prior_monthly >= recent_30 + 2 and recent_30 <= prior_monthly * 0.75 \
            else "STEADY"
        cells.append({
            "lat": lat,
            "lon": lon,
            "reported_incidents_30d_cell": int(local["count_30"]),
            "reported_incidents_90d_cell": int(local["count_90"]),
            "reported_incidents_365d_cell": int(local["count_365"]),
            "reported_incidents_30d_nearby": int(area["count_30"]),
            "reported_incidents_90d_nearby": int(area["count_90"]),
            "reported_incidents_365d_nearby": int(area["count_365"]),
            "severity_weighted_365d_cell": round(local["weighted_365"], 2),
            "severity_weighted_365d_nearby": round(area["weighted_365"], 2),
            "historical_context_score_cell": round(
                local["weighted_365"] + local["count_90"] * 0.75 + local["count_30"] * 1.5,
                2,
            ),
            "historical_context_score": round(area["context_score"], 2),
            "recent_trend": trend,
            "relative_percentile": round(
                midpoint_percentile_rank(distribution, area["context_score"])
            ),
        })

    total = int(sum(value["count_365"] for value in metrics.values()))
    return {
        "status": "JOURNEY_RELATIVE_CONTEXT",
        "method_version": "3.0",
        "detail": (
            f"{total:,} unique reported incidents summarized into {len(cells):,} location cells. "
            "Relative historical context only; not a crime forecast or safe/unsafe label."
        ),
        "source_snapshot_time": max(latest_values).isoformat() if latest_values else None,
        "lookback_days": 365,
        "windows_days": [30, 90, 365],
        "raw_record_count": raw_count,
        "deduplicated_record_count": len(parsed_records) if parsed_records else total,
        "severity_weight_basis": "Transparent category groups from 1.0 to 5.0; descriptive comparison only.",
        "percentile_baseline": baseline,
        "baseline_stop_count": len(stop_points),
        "stop_context_distribution": distribution,
        "cell_precision_degrees": 0.001,
        "nearby_window": "approximately 250 meters",
        "cell_count": len(cells),
        "cells": cells,
    }


def load_muni_stop_points() -> list[tuple[float, float]]:
    """Load one coordinate per Muni stop from the checked-in public GTFS network."""

    network = json.loads(NETWORK_PATH.read_text(encoding="utf-8"))
    patterns = network.get("patterns") or network.get("route_directions") or {}
    stops: dict[str, tuple[float, float]] = {}
    for pattern in patterns.values():
        for row in pattern.get("stops", []):
            stop_id = str(row.get("stop_id") or "")
            try:
                point = (float(row["lat"]), float(row["lon"]))
            except (KeyError, TypeError, ValueError):
                continue
            if stop_id and inside_sf(*point):
                stops.setdefault(stop_id, point)
    if not stops:
        raise ValueError("Public Muni network contains no usable stop coordinates.")
    return list(stops.values())


def refresh_safety() -> dict[str, Any]:
    since = (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%S")
    query = f"""
SELECT
  row_id,
  incident_id,
  incident_datetime,
  incident_category,
  latitude,
  longitude
WHERE incident_datetime >= '{since}'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
ORDER BY incident_datetime DESC
LIMIT 100000
""".strip()
    return build_safety_context(
        datasf_records("wg3w-h783", query, 5000, max_pages=20),
        load_muni_stop_points(),
    )


def source_refresh_due(
    previous: dict[str, Any],
    source_name: str,
    interval: timedelta,
    *,
    force: bool = False,
) -> bool:
    """Use the last check time, not the source's own delayed observation time."""

    if force:
        return True
    status = previous.get("meta", {}).get("source_status", {}).get(source_name, {})
    raw = status.get("checked_at") or status.get("refreshed_at")
    if not raw:
        return True
    try:
        checked = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        if checked.tzinfo is None:
            checked = checked.replace(tzinfo=timezone.utc)
    except ValueError:
        return True
    return datetime.now(timezone.utc) - checked >= interval


def main() -> int:
    previous = load_previous()
    payload = previous or {
        "system": {},
        "vehicles": [],
        "routes": [],
        "trip_predictions": [],
        "alerts": [],
        "road_events": [],
        "journey": {},
    }
    errors: list[str] = []
    configured_sources = 0
    alerts_refreshed = False
    roads_refreshed = False
    roads_failed = False
    road_feed_counts: dict[str, int | None] = {
        "raw_event_count": None,
        "parsed_event_count": None,
    }
    parking_refreshed = False
    safety_refreshed = False
    api_key = os.environ.get("SF_TRANSIT_511_API_KEY", "").strip()
    local_gtfs_path = os.environ.get("SF_TRANSIT_GTFS_PATH", "").strip()
    static_only = os.environ.get("SF_TRANSIT_STATIC_ONLY", "false").strip().lower() in {"1", "true", "yes"}
    force_context = os.environ.get("SF_TRANSIT_FORCE_CONTEXT", "false").strip().lower() in {"1", "true", "yes"}
    refresh_service_context = source_refresh_due(previous, "alerts", timedelta(minutes=15), force=force_context)
    refresh_parking_context = source_refresh_due(previous, "parking", timedelta(minutes=30), force=force_context)
    previous_safety_method = str(previous.get("safety", {}).get("method_version", ""))
    refresh_safety_context = (
        previous_safety_method != "3.0"
        or source_refresh_due(previous, "safety", timedelta(hours=24), force=force_context)
    )
    previous_transit = previous.get("meta", {}).get("source_status", {}).get("transit", {})
    if static_only:
        if not api_key:
            raise RuntimeError("SF_TRANSIT_511_API_KEY is required for the daily static GTFS refresh.")
        static = fetch_static_gtfs(api_key)
        write_json(static["network"], NETWORK_PATH, compact=True)
        write_static_index(static)
        print(json.dumps({"status": "static_refreshed", "trips": len(static["trip_lookup"])}))
        return 0

    contains_demo = any(str(row.get("vehicle_id", "")).startswith("demo-") for row in payload.get("vehicles", []))
    transit_source = {
        "status": "retained_sample" if contains_demo else "retained",
        "observed_at": previous_transit.get("observed_at"),
    }

    if api_key:
        try:
            try:
                static = load_static_index()
            except (OSError, KeyError, ValueError, json.JSONDecodeError):
                static = fetch_static_gtfs(api_key)
                write_json(static["network"], NETWORK_PATH, compact=True)
                write_static_index(static)
            vehicle_feed = fetch_gtfs_rt("https://api.511.org/transit/vehiclepositions", api_key)
            trip_feed = fetch_gtfs_rt("https://api.511.org/transit/tripupdates", api_key)
            vehicles = parse_vehicles(vehicle_feed, static["trip_lookup"])
            routes = parse_route_health(trip_feed, static["trip_lookup"], vehicles, static["stop_lookup"])
            trip_predictions = parse_trip_predictions(trip_feed, static["trip_lookup"])
            payload.update({"vehicles": vehicles, "routes": routes, "trip_predictions": trip_predictions})
            feed_timestamps = [
                int(feed.header.timestamp or 0)
                for feed in (vehicle_feed, trip_feed)
                if int(feed.header.timestamp or 0) > 0
            ]
            observed_at = datetime.fromtimestamp(
                min(feed_timestamps), tz=timezone.utc
            ).isoformat() if feed_timestamps else datetime.now(timezone.utc).isoformat()
            transit_source = {
                "status": "live",
                "observed_at": observed_at,
            }
            configured_sources += 1
        except Exception as exc:  # Preserve last valid public snapshot on source failure.
            errors.append(f"511 refresh failed: {type(exc).__name__}: {exc}")

        if refresh_service_context:
            try:
                alert_feed = fetch_gtfs_rt("https://api.511.org/transit/servicealerts", api_key)
                payload["alerts"] = parse_alerts(alert_feed)
                alerts_refreshed = True
                configured_sources += 1
            except Exception as exc:
                errors.append(f"511 alerts refresh failed: {type(exc).__name__}: {exc}")

            try:
                road_payload = request(
                    "https://api.511.org/traffic/events",
                    params={
                        "api_key": api_key,
                        "Bbox": "-122.52,37.70,-122.35,37.83",
                        "in_effect_on": "now",
                        "limit": 100,
                    },
                ).json()
                raw_road_events = road_event_collection(road_payload)
                parsed_road_events = parse_road_events(raw_road_events)
                if raw_road_events and not parsed_road_events:
                    raise ValueError(
                        f"511 road feed returned {len(raw_road_events)} events, but none passed spatial parsing."
                    )
                road_feed_counts = {
                    "raw_event_count": len(raw_road_events),
                    "parsed_event_count": len(parsed_road_events),
                }
                payload["road_events"] = parsed_road_events
                roads_refreshed = True
                configured_sources += 1
            except Exception as exc:
                roads_failed = True
                errors.append(f"511 roads refresh failed: {type(exc).__name__}: {exc}")
    else:
        errors.append("511_API_KEY is not configured; the last transit snapshot is retained.")
        if local_gtfs_path:
            try:
                static = load_static_gtfs(Path(local_gtfs_path))
                write_json(static["network"], NETWORK_PATH, compact=True)
            except Exception as exc:
                errors.append(f"Local static GTFS build failed: {type(exc).__name__}: {exc}")

    if refresh_parking_context:
        try:
            payload["parking"] = refresh_parking()
            parking_refreshed = True
            configured_sources += 1
        except Exception as exc:
            errors.append(f"Parking refresh failed: {type(exc).__name__}: {exc}")

    if refresh_safety_context:
        try:
            payload["safety"] = refresh_safety()
            safety_refreshed = True
            configured_sources += 1
        except Exception as exc:
            errors.append(f"Safety refresh failed: {type(exc).__name__}: {exc}")

    current_routes = payload.get("routes", [])
    payload["system"] = {
        "vehicle_count": len(payload.get("vehicles", [])),
        "route_count": len({str(row.get("route_id", "")) for row in current_routes if row.get("route_id")}),
        "route_direction_count": len(current_routes),
        "predicted_trip_count": len(payload.get("trip_predictions", [])),
        "alert_count": len(payload.get("alerts", [])),
        "road_event_count": len(payload.get("road_events", [])),
    }

    status = "live" if api_key and not errors else "partial_live" if configured_sources else "demo"
    checked_at = datetime.now(timezone.utc).isoformat()
    previous_sources = previous.get("meta", {}).get("source_status", {})
    payload["meta"] = {
        "generated_at": checked_at,
        "status": status,
        "pipeline_version": PIPELINE_VERSION,
        "errors": errors,
        "sources": ["511 SF Bay", "DataSF", "SFMTA"],
        "source_status": {
            "transit": {**transit_source, "checked_at": checked_at},
            "alerts": {
                "status": "refreshed" if alerts_refreshed else "retained" if payload.get("alerts") else "unavailable",
                "observed_at": checked_at if alerts_refreshed else previous_sources.get("alerts", {}).get("observed_at") or previous_transit.get("observed_at"),
                "checked_at": checked_at if refresh_service_context else previous_sources.get("alerts", {}).get("checked_at"),
            },
            "roads": {
                "status": "unavailable" if roads_failed else "refreshed" if roads_refreshed else "retained" if payload.get("road_events") else "unavailable",
                "observed_at": checked_at if roads_refreshed else previous_sources.get("roads", {}).get("observed_at"),
                "checked_at": checked_at if refresh_service_context else previous_sources.get("roads", {}).get("checked_at"),
                **(
                    road_feed_counts
                    if refresh_service_context
                    else {
                        "raw_event_count": previous_sources.get("roads", {}).get("raw_event_count"),
                        "parsed_event_count": previous_sources.get("roads", {}).get("parsed_event_count"),
                    }
                ),
            },
            "parking": {
                "status": "refreshed" if parking_refreshed else "retained" if payload.get("parking") else "unavailable",
                "observed_at": payload.get("parking", {}).get("source_snapshot_time")
                or previous_sources.get("parking", {}).get("observed_at"),
                "checked_at": checked_at if refresh_parking_context else previous_sources.get("parking", {}).get("checked_at"),
            },
            "safety": {
                "status": "refreshed" if safety_refreshed else "retained" if payload.get("safety") else "unavailable",
                "observed_at": checked_at
                if safety_refreshed
                else previous_sources.get("safety", {}).get("observed_at"),
                "checked_at": checked_at if refresh_safety_context else previous_sources.get("safety", {}).get("checked_at"),
            },
        },
        "request_budget": {
            **REQUEST_BUDGET,
            "planned_requests_per_hour": (
                REQUEST_BUDGET["core_runs_per_hour"] * REQUEST_BUDGET["core_requests_per_run"]
                + REQUEST_BUDGET["context_runs_per_hour"] * REQUEST_BUDGET["context_extra_requests_per_run"]
            ),
        },
        "refresh_policy": "Vehicles and trip updates every 5 minutes; alerts/roads every 15 minutes; parking every 30 minutes; safety and static GTFS daily",
    }
    write_snapshot(payload)
    print(json.dumps({"status": status, "errors": len(errors), "vehicles": len(payload.get("vehicles", [])), "routes": len(payload.get("routes", []))}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
