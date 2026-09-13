#!/usr/bin/env python3
"""Build the public SF Transit Pulse snapshot without exposing API credentials.

The browser never calls 511 directly. GitHub Actions runs this module on a
schedule, reads SF_TRANSIT_511_API_KEY from an encrypted repository secret, and
writes a credential-free JSON snapshot for GitHub Pages.
"""

from __future__ import annotations

import csv
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
PIPELINE_VERSION = "1.3.0"
USER_AGENT = "SF-Transit-Pulse/1.0 (+https://github.com/ksitcode00/sf-transit-pulse)"
SF_BOUNDS = {"south": 37.68, "north": 37.84, "west": -122.55, "east": -122.33}
REQUEST_BUDGET = {
    "default_limit_per_hour": 60,
    "core_runs_per_hour": 12,
    "core_requests_per_run": 3,
    "context_runs_per_hour": 4,
    "context_extra_requests_per_run": 2,
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


def fetch_gtfs_rt(url: str, api_key: str) -> gtfs_realtime_pb2.FeedMessage:
    response = request(url, params={"api_key": api_key, "agency": "SF"})
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    return feed


def inside_sf(lat: float, lon: float) -> bool:
    return SF_BOUNDS["south"] <= lat <= SF_BOUNDS["north"] and SF_BOUNDS["west"] <= lon <= SF_BOUNDS["east"]


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


def geometry_center(raw: dict[str, Any]) -> tuple[float | None, float | None]:
    geometry = raw.get("geometry") if isinstance(raw.get("geometry"), dict) else {}
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
    if points:
        return statistics.median(point[0] for point in points), statistics.median(point[1] for point in points)
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
        rows.append(
            {
                "route_ids": route_ids,
                "route_match_status": "MATCHED" if route_ids else "UNAVAILABLE",
                "title": str(title)[:180],
                "description": (f"{road_label} · " if road_label else "") + str(description)[:500],
                "lat": round(lat, 6) if lat is not None else None,
                "lon": round(lon, 6) if lon is not None else None,
            }
        )
    return rows[:20]


def datasf_records(dataset_id: str, query: str, page_size: int) -> list[dict[str, Any]]:
    response = request(
        f"https://data.sf.gov/api/v3/views/{dataset_id}/query.json",
        params={"pageNumber": 1, "pageSize": page_size, "query": query},
        timeout=75,
    )
    payload = response.json()
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("data", "results", "rows"):
            if isinstance(payload.get(key), list):
                return payload[key]
    return []


def refresh_parking() -> dict[str, Any]:
    query = """
SELECT session_start_dt, session_end_dt, post_id, street_block
WHERE session_start_dt IS NOT NULL
ORDER BY session_start_dt DESC
LIMIT 5000
""".strip()
    rows = datasf_records("imvp-dq3v", query, 5000)
    parsed = []
    for row in rows:
        try:
            started = datetime.fromisoformat(str(row.get("session_start_dt", "")).replace("Z", "+00:00"))
        except ValueError:
            continue
        street = str(row.get("street_block") or "").strip()
        if not street or "GARAGE" in street.upper() or " LOT" in street.upper():
            continue
        parsed.append((started, street))
    if not parsed:
        return {"status": "Parking evidence limited", "detail": "No valid recent paid-session rows were returned."}
    newest = max(item[0] for item in parsed)
    window = newest - timedelta(hours=3)
    counts = Counter(street for started, street in parsed if started >= window)
    busiest = [{"street_block": street, "payments_3h": count} for street, count in counts.most_common(8)]
    return {
        "status": "Recent demand snapshot",
        "detail": f"{sum(counts.values()):,} paid-session starts in the latest three-hour feed window. Demand proxy only; not physical occupancy.",
        "source_snapshot_time": newest.isoformat(),
        "busiest_blocks": busiest,
    }


def refresh_safety() -> dict[str, Any]:
    since = (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%S")
    query = f"""
SELECT incident_category, count(*) AS incident_count
WHERE incident_datetime >= '{since}'
GROUP BY incident_category
ORDER BY incident_count DESC
LIMIT 50
""".strip()
    rows = datasf_records("wg3w-h783", query, 50)
    total = sum(int(float(row.get("incident_count", 0) or 0)) for row in rows)
    return {
        "status": "365-day relative context",
        "detail": f"{total:,} city incident rows summarized for context. This is not a crime forecast or a safe/unsafe label.",
        "category_count": len(rows),
    }


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
    parking_refreshed = False
    safety_refreshed = False
    api_key = os.environ.get("SF_TRANSIT_511_API_KEY", "").strip()
    local_gtfs_path = os.environ.get("SF_TRANSIT_GTFS_PATH", "").strip()
    refresh_context = os.environ.get("SF_TRANSIT_REFRESH_CONTEXT", "true").strip().lower() in {"1", "true", "yes"}
    previous_transit = previous.get("meta", {}).get("source_status", {}).get("transit", {})
    contains_demo = any(str(row.get("vehicle_id", "")).startswith("demo-") for row in payload.get("vehicles", []))
    transit_source = {
        "status": "retained_sample" if contains_demo else "retained",
        "observed_at": previous_transit.get("observed_at"),
    }

    if api_key:
        try:
            static = fetch_static_gtfs(api_key)
            write_json(static["network"], NETWORK_PATH, compact=True)
            vehicle_feed = fetch_gtfs_rt("https://api.511.org/transit/vehiclepositions", api_key)
            trip_feed = fetch_gtfs_rt("https://api.511.org/transit/tripupdates", api_key)
            vehicles = parse_vehicles(vehicle_feed, static["trip_lookup"])
            routes = parse_route_health(trip_feed, static["trip_lookup"], vehicles, static["stop_lookup"])
            trip_predictions = parse_trip_predictions(trip_feed, static["trip_lookup"])
            payload.update({"vehicles": vehicles, "routes": routes, "trip_predictions": trip_predictions})
            if refresh_context:
                alert_feed = fetch_gtfs_rt("https://api.511.org/transit/servicealerts", api_key)
                road_payload = request(
                    "https://api.511.org/traffic/events",
                    params={
                        "api_key": api_key,
                        "Bbox": "-122.52,37.70,-122.35,37.83",
                        "in_effect_on": "now",
                        "limit": 100,
                    },
                ).json()
                payload["alerts"] = parse_alerts(alert_feed)
                payload["road_events"] = parse_road_events(road_payload)
            payload["system"] = {
                "vehicle_count": len(vehicles),
                "route_count": len({row["route_id"] for row in routes}),
                "route_direction_count": len(routes),
                "predicted_trip_count": len(trip_predictions),
                "alert_count": len(payload.get("alerts", [])),
                "road_event_count": len(payload.get("road_events", [])),
            }
            transit_source = {
                "status": "live",
                "observed_at": datetime.now(timezone.utc).isoformat(),
            }
            configured_sources += 1
        except Exception as exc:  # Preserve last valid public snapshot on source failure.
            errors.append(f"511 refresh failed: {type(exc).__name__}: {exc}")
    else:
        errors.append("511_API_KEY is not configured; the last transit snapshot is retained.")
        if local_gtfs_path:
            try:
                static = load_static_gtfs(Path(local_gtfs_path))
                write_json(static["network"], NETWORK_PATH, compact=True)
            except Exception as exc:
                errors.append(f"Local static GTFS build failed: {type(exc).__name__}: {exc}")
        # The checked-in fallback contains a small presentation sample rather
        # than a complete fleet feed. Keep headline counts consistent with the
        # visible sample so the public page never implies that demo rows are a
        # current system-wide census.
        fallback_routes = payload.get("routes", [])
        payload["system"] = {
            "vehicle_count": len(payload.get("vehicles", [])),
            "route_count": len({str(row.get("route_id", "")) for row in fallback_routes if row.get("route_id")}),
            "route_direction_count": len(fallback_routes),
            "predicted_trip_count": len(payload.get("trip_predictions", [])),
            "alert_count": len(payload.get("alerts", [])),
            "road_event_count": len(payload.get("road_events", [])),
        }

    if refresh_context:
        try:
            payload["parking"] = refresh_parking()
            parking_refreshed = True
            configured_sources += 1
        except Exception as exc:
            errors.append(f"Parking refresh failed: {type(exc).__name__}: {exc}")

        try:
            payload["safety"] = refresh_safety()
            safety_refreshed = True
            configured_sources += 1
        except Exception as exc:
            errors.append(f"Safety refresh failed: {type(exc).__name__}: {exc}")

    status = "live" if api_key and not errors else "partial_live" if configured_sources else "demo"
    payload["meta"] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "pipeline_version": PIPELINE_VERSION,
        "errors": errors,
        "sources": ["511 SF Bay", "DataSF", "SFMTA"],
        "source_status": {
            "transit": transit_source,
            "parking": {
                "status": "refreshed" if parking_refreshed else "retained" if payload.get("parking") else "unavailable",
                "observed_at": payload.get("parking", {}).get("source_snapshot_time")
                or previous.get("meta", {}).get("source_status", {}).get("parking", {}).get("observed_at"),
            },
            "safety": {
                "status": "refreshed" if safety_refreshed else "retained" if payload.get("safety") else "unavailable",
                "observed_at": datetime.now(timezone.utc).isoformat()
                if safety_refreshed
                else previous.get("meta", {}).get("source_status", {}).get("safety", {}).get("observed_at"),
            },
        },
        "request_budget": {
            **REQUEST_BUDGET,
            "planned_requests_per_hour": (
                REQUEST_BUDGET["core_runs_per_hour"] * REQUEST_BUDGET["core_requests_per_run"]
                + REQUEST_BUDGET["context_runs_per_hour"] * REQUEST_BUDGET["context_extra_requests_per_run"]
            ),
        },
        "refresh_policy": "Vehicles and trip updates every 5 minutes; alerts and road context every 15 minutes via GitHub Actions",
    }
    write_snapshot(payload)
    print(json.dumps({"status": status, "errors": len(errors), "vehicles": len(payload.get("vehicles", [])), "routes": len(payload.get("routes", []))}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
