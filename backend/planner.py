"""Cache-backed Muni journey planner used by the FastAPI service.

中文：这个模块把 Notebook Feature 12 的核心产品规则整理成可部署的服务层：
同一批候选行程分别按 FASTEST、BALANCED、SAFETY_FIRST 排序，但绝不修改真实 ETA。

English: This module turns the core Feature 12 product contract into a deployable
service layer. The same candidate set is ranked for three modes, while actual ETA
remains an observable estimate rather than a preference-adjusted number.
"""

from __future__ import annotations

from bisect import bisect_left, bisect_right
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
from statistics import median
from typing import Any, Iterable


# -----------------------------------------------------------------------------
# Feature 16A · Calculation policy / 计算规则
#
# 中文：步行范围让用户选择“地点附近的 Muni 站”而不是必须选中完全相同的站台。
# 换乘范围只允许很短的站间步行，避免把两个相距很远的站误当作一次换乘。
# English: Access radii let an anchor stop reach nearby platforms. The smaller
# transfer radius prevents distant stops from being presented as one transfer.
# -----------------------------------------------------------------------------
WALK_SPEED_M_PER_MIN = 75.0
ACCESS_RADIUS_M = 250.0
TRANSFER_RADIUS_M = 180.0
MAX_ALTERNATIVES = 12
BOARDING_BUFFER_MIN = 1.0
PARKING_MIN_MATCH_COVERAGE = 0.70
SAFETY_MIDPOINT_PERCENTILE = 50.0
BALANCED_SAFETY_MIN_PER_POINT = 0.03
SAFETY_FIRST_MIN_PER_POINT = 0.15
ENGINE_VERSION = "24.3-beta"


def midpoint_percentile_rank(ordered: list[float], value: float) -> float | None:
    """Rank tied values at the middle of their percentile interval."""

    if not ordered:
        return None
    below = bisect_left(ordered, value)
    at_or_below = bisect_right(ordered, value)
    return 100 * (below + (at_or_below - below) / 2) / len(ordered)

HEALTH_SEVERITY = {
    "STABLE": 0,
    "WATCH": 1,
    "LIMITED_REALTIME_DATA": 2,
    "NO_DATA": 2,
    "UNSTABLE": 3,
}
RELIABILITY_PENALTY_MIN = {
    "STABLE": 0.0,
    "WATCH": 3.0,
    "LIMITED_REALTIME_DATA": 4.0,
    "NO_DATA": 5.0,
    "UNSTABLE": 8.0,
}
ROUTE_COLORS = ("#0066cc", "#34a853")


class PlannerError(ValueError):
    """Base class for user-correctable planning errors."""


class UnsupportedStopError(PlannerError):
    """Raised when a requested stop is not present in the public GTFS cache."""


class NoJourneyError(PlannerError):
    """Raised when the current one-transfer search cannot connect two anchors."""


@dataclass(frozen=True)
class Stop:
    """One physical GTFS stop used by the routing graph."""

    stop_id: str
    name: str
    lat: float
    lon: float

    def public(self) -> dict[str, Any]:
        return {
            "stop_id": self.stop_id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
        }


@dataclass
class Pattern:
    """One physical route + direction + shape stop pattern and geometry."""

    key: str
    route_id: str
    direction_id: str
    direction_label: str
    headsign: str
    stops: tuple[Stop, ...]
    shape: tuple[tuple[float, float], ...]
    stop_index: dict[str, int]
    prefix_distance_m: tuple[float, ...]


@dataclass(frozen=True)
class PredictedStop:
    """One absolute GTFS-RT arrival/departure prediction."""

    stop_id: str
    stop_sequence: int
    arrival_epoch: int | None
    departure_epoch: int | None


@dataclass(frozen=True)
class PredictedTrip:
    """A concrete realtime trip retained in the public snapshot."""

    trip_id: str
    route_id: str
    direction_id: str
    shape_id: str
    vehicle_id: str
    update_timestamp: int | None
    stops: tuple[PredictedStop, ...]


def haversine_m(a: Stop | tuple[float, float], b: Stop | tuple[float, float]) -> float:
    """Return great-circle distance in meters without a geospatial dependency."""

    lat1, lon1 = (a.lat, a.lon) if isinstance(a, Stop) else a
    lat2, lon2 = (b.lat, b.lon) if isinstance(b, Stop) else b
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    value = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * 6_371_000 * math.asin(math.sqrt(value))


def point_to_polyline_m(
    point: tuple[float, float],
    polyline: Iterable[tuple[float, float]],
) -> float:
    """Approximate the shortest point-to-line distance in local meters."""

    points = list(polyline)
    if not points:
        return math.inf
    if len(points) == 1:
        return haversine_m(point, points[0])
    reference_lat = math.radians(point[0])
    meters_per_lon_degree = 111_320 * math.cos(reference_lat)
    meters_per_lat_degree = 110_540

    def local(candidate: tuple[float, float]) -> tuple[float, float]:
        return (
            (candidate[1] - point[1]) * meters_per_lon_degree,
            (candidate[0] - point[0]) * meters_per_lat_degree,
        )

    best = math.inf
    for left, right in zip(points, points[1:]):
        left_x, left_y = local(left)
        right_x, right_y = local(right)
        delta_x, delta_y = right_x - left_x, right_y - left_y
        denominator = delta_x * delta_x + delta_y * delta_y
        if denominator == 0:
            distance = math.hypot(left_x, left_y)
        else:
            fraction = max(
                0.0,
                min(1.0, -(left_x * delta_x + left_y * delta_y) / denominator),
            )
            distance = math.hypot(
                left_x + fraction * delta_x,
                left_y + fraction * delta_y,
            )
        best = min(best, distance)
    return best


def percentile(values: Iterable[float], fraction: float) -> float | None:
    """Small dependency-free percentile helper used for speed evidence."""

    ordered = sorted(float(value) for value in values if math.isfinite(float(value)))
    if not ordered:
        return None
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    return ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)


def build_pattern(key: str, raw: dict[str, Any]) -> Pattern | None:
    """Validate and normalize one cached route-direction record."""

    stops = []
    seen = set()
    for row in raw.get("stops", []):
        stop_id = str(row.get("stop_id") or "")
        if not stop_id or stop_id in seen:
            continue
        try:
            stop = Stop(
                stop_id=stop_id,
                name=str(row.get("name") or "Muni stop"),
                lat=float(row["lat"]),
                lon=float(row["lon"]),
            )
        except (KeyError, TypeError, ValueError):
            continue
        seen.add(stop_id)
        stops.append(stop)
    if len(stops) < 2:
        return None

    prefix = [0.0]
    for left, right in zip(stops, stops[1:]):
        # 中文：站点直线距离乘 1.16，近似道路/轨道不是完全直线的实际行驶路径。
        # English: A modest path factor avoids treating every vehicle leg as a straight line.
        prefix.append(prefix[-1] + haversine_m(left, right) * 1.16)

    shape = []
    for point in raw.get("shape", []):
        try:
            shape.append((float(point[0]), float(point[1])))
        except (IndexError, TypeError, ValueError):
            continue

    return Pattern(
        key=key,
        route_id=str(raw.get("route_id") or key.split("|", 1)[0]),
        direction_id=str(raw.get("direction_id") or ""),
        direction_label=str(raw.get("direction_label") or "Direction unavailable"),
        headsign=str(raw.get("headsign") or ""),
        stops=tuple(stops),
        shape=tuple(shape),
        stop_index={stop.stop_id: index for index, stop in enumerate(stops)},
        prefix_distance_m=tuple(prefix),
    )


class PlannerEngine:
    """Plan direct and one-transfer journeys from credential-free cache files."""

    def __init__(self, network: dict[str, Any], realtime: dict[str, Any]):
        self.network = network
        self.realtime = realtime
        self.transit_source_status = str(
            realtime.get("meta", {}).get("source_status", {}).get("transit", {}).get("status")
            or "live"
        ).lower()
        self.route_catalog = {
            str(row.get("route_id")): row for row in network.get("routes", [])
        }
        # Feature 19: prefer the full physical pattern catalog. Older snapshots
        # remain readable through the route-direction representative fallback.
        raw_patterns = network.get("patterns") or network.get("route_directions", {})
        self.patterns = tuple(
            pattern
            for key, row in raw_patterns.items()
            for pattern in [build_pattern(str(key), row)]
            if pattern is not None
        )
        self.pattern_by_key = {pattern.key: pattern for pattern in self.patterns}
        self.stops = self._build_stop_catalog()
        self.health = {
            (str(row.get("route_id")), str(row.get("direction_id"))): row
            for row in realtime.get("routes", [])
        }
        self.vehicle_speeds = self._build_vehicle_speed_lookup()
        self.predicted_trips = self._build_trip_prediction_lookup()
        safety_payload = realtime.get("safety", {})
        self.safety_cells = {
            (round(float(row["lat"]), 3), round(float(row["lon"]), 3)): {
                "count30": float(row.get("reported_incidents_30d_cell", 0) or 0),
                "count90": float(row.get("reported_incidents_90d_cell", 0) or 0),
                "count365": float(row.get("reported_incidents_365d_cell", 0) or 0),
                "weighted365": float(
                    row.get("severity_weighted_365d_cell", row.get("reported_incidents_365d_cell", 0)) or 0
                ),
                "context_score": float(
                    row.get("historical_context_score_cell", row.get("reported_incidents_365d_cell", 0)) or 0
                ),
            }
            for row in realtime.get("safety", {}).get("cells", [])
            if row.get("lat") is not None and row.get("lon") is not None
        }
        network_distribution = safety_payload.get("stop_context_distribution", [])
        self.safety_distribution = sorted(
            float(value)
            for value in (
                network_distribution
                or [
                    row.get("historical_context_score", row.get("reported_incidents_365d_nearby", 0)) or 0
                    for row in safety_payload.get("cells", [])
                ]
            )
        )
        self.safety_baseline = (
            "ALL_MUNI_STOPS" if network_distribution else "OBSERVED_INCIDENT_CELLS_FALLBACK"
        )
        self._safety_stop_cache: dict[str, dict[str, Any]] = {}
        self.parking_cells = list(realtime.get("parking", {}).get("cells", []))
        raw_parking_coverage = realtime.get("parking", {}).get("match_coverage_ratio")
        try:
            self.parking_mapping_coverage = float(raw_parking_coverage)
        except (TypeError, ValueError):
            self.parking_mapping_coverage = None
        self.parking_evidence_sufficient = (
            self.parking_mapping_coverage is None
            or self.parking_mapping_coverage >= PARKING_MIN_MATCH_COVERAGE
        )
        self.parking_pressure_distribution = sorted(
            float(row.get("paid_session_pressure_ratio") or 0)
            for row in self.parking_cells
            if float(row.get("paid_session_pressure_ratio") or 0) > 0
        )
        self._parking_stop_cache: dict[str, dict[str, Any]] = {}

    def _concrete_timing_status(self) -> str:
        """Name fresh retained evidence honestly without discarding it."""

        return (
            "RECENT_CACHED_PREDICTION"
            if self.transit_source_status.startswith("retained")
            else "REALTIME_TRIP_PREDICTION"
        )

    @classmethod
    def from_files(cls, network_path: Path, realtime_path: Path) -> "PlannerEngine":
        """Load both cache layers. No upstream API request occurs here."""

        network = json.loads(network_path.read_text(encoding="utf-8"))
        realtime = json.loads(realtime_path.read_text(encoding="utf-8"))
        return cls(network, realtime)

    def _build_stop_catalog(self) -> dict[str, Stop]:
        stops: dict[str, Stop] = {}
        for pattern in self.patterns:
            for stop in pattern.stops:
                stops.setdefault(stop.stop_id, stop)
        return stops

    def _build_vehicle_speed_lookup(self) -> dict[tuple[str, str], float]:
        grouped: dict[tuple[str, str], list[float]] = {}
        for row in self.realtime.get("vehicles", []):
            try:
                speed_mps = float(row.get("speed_mps"))
            except (TypeError, ValueError):
                continue
            # Ignore stopped/noisy points and impossible GPS spikes per vehicle.
            # Keep the route median itself uncapped so a real 2.8 mph slowdown
            # is not silently raised to the old 5 mph floor.
            if speed_mps < 1 or speed_mps > 22.35:
                continue
            key = (str(row.get("route_id")), str(row.get("direction_id")))
            grouped.setdefault(key, []).append(speed_mps * 2.23694)
        return {key: median(values) for key, values in grouped.items()}

    def _build_trip_prediction_lookup(self) -> dict[tuple[str, str], list[PredictedTrip]]:
        """Index concrete trips by route + direction for fast candidate lookup.

        中文：Feature 20 的输入来自公开 latest.json，不会在用户查询时调用 511。
        shape_id 会在下一步用于排除同一路线、同方向但不同分支的错误班次。

        English: Feature 20 reads the public cache only. The shape id prevents a
        prediction for a different branch from being attached to this pattern.
        """

        grouped: dict[tuple[str, str], list[PredictedTrip]] = {}
        for raw in self.realtime.get("trip_predictions", []):
            trip_id = str(raw.get("trip_id") or "")
            route_id = str(raw.get("route_id") or "")
            direction_id = str(raw.get("direction_id") or "")
            if not trip_id or not route_id:
                continue
            stops = []
            for row in raw.get("stops", []):
                stop_id = str(row.get("stop_id") or "")
                if not stop_id:
                    continue
                try:
                    arrival = int(row["arrival_time"]) if row.get("arrival_time") else None
                    departure = int(row["departure_time"]) if row.get("departure_time") else None
                    sequence = int(row.get("stop_sequence") or 0)
                except (TypeError, ValueError):
                    continue
                if arrival is None and departure is None:
                    continue
                stops.append(PredictedStop(stop_id, sequence, arrival, departure))
            stops.sort(key=lambda stop: (stop.stop_sequence, stop.arrival_epoch or stop.departure_epoch or 0))
            if not stops:
                continue
            try:
                update_timestamp = int(raw["update_timestamp"]) if raw.get("update_timestamp") else None
            except (TypeError, ValueError):
                update_timestamp = None
            trip = PredictedTrip(
                trip_id=trip_id,
                route_id=route_id,
                direction_id=direction_id,
                shape_id=str(raw.get("shape_id") or ""),
                vehicle_id=str(raw.get("vehicle_id") or ""),
                update_timestamp=update_timestamp,
                stops=tuple(stops),
            )
            grouped.setdefault((route_id, direction_id), []).append(trip)
        for trips in grouped.values():
            trips.sort(key=lambda trip: trip.stops[0].departure_epoch or trip.stops[0].arrival_epoch or 0)
        return grouped

    def _trip_for_leg(
        self,
        pattern: Pattern,
        board_stop_id: str,
        alight_stop_id: str,
        ready_epoch: float,
    ) -> dict[str, Any] | None:
        """Return the first concrete trip that boards after the rider is ready."""

        route_trips = self.predicted_trips.get((pattern.route_id, pattern.direction_id), [])
        exact_shape = [trip for trip in route_trips if trip.shape_id == pattern.key.rsplit("|", 1)[-1]]
        candidates = exact_shape or [trip for trip in route_trips if not trip.shape_id]
        best = None
        for trip in candidates:
            for board_index, board in enumerate(trip.stops):
                if board.stop_id != board_stop_id:
                    continue
                board_epoch = board.departure_epoch or board.arrival_epoch
                if board_epoch is None or board_epoch < ready_epoch:
                    continue
                for alight in trip.stops[board_index + 1 :]:
                    if alight.stop_id != alight_stop_id:
                        continue
                    alight_epoch = alight.arrival_epoch or alight.departure_epoch
                    if alight_epoch is None or alight_epoch <= board_epoch:
                        continue
                    result = {
                        "trip": trip,
                        "board_epoch": board_epoch,
                        "alight_epoch": alight_epoch,
                    }
                    if best is None or board_epoch < best["board_epoch"]:
                        best = result
                    break
        return best

    @staticmethod
    def _iso_time(epoch: int | float | None) -> str | None:
        if epoch is None:
            return None
        return datetime.fromtimestamp(epoch, timezone.utc).isoformat()

    # -------------------------------------------------------------------------
    # Feature 16A · Public catalogs / 前端搜索目录
    # -------------------------------------------------------------------------
    def list_stops(self, query: str = "", limit: int = 50) -> list[dict[str, Any]]:
        """Return searchable stops plus the routes observed at each stop."""

        query_folded = query.strip().casefold()
        routes_by_stop: dict[str, set[str]] = {}
        for pattern in self.patterns:
            for stop in pattern.stops:
                routes_by_stop.setdefault(stop.stop_id, set()).add(pattern.route_id)
        rows = []
        for stop in self.stops.values():
            if query_folded and query_folded not in stop.name.casefold() and query_folded not in stop.stop_id.casefold():
                continue
            rows.append(
                {
                    **stop.public(),
                    "route_ids": sorted(routes_by_stop.get(stop.stop_id, set())),
                    "search_label": f"{stop.name} · {stop.stop_id}",
                }
            )
        rows.sort(key=lambda row: (row["name"].casefold(), row["stop_id"]))
        return rows[: max(1, min(int(limit), 200))]

    def list_routes(self) -> list[dict[str, Any]]:
        return list(self.network.get("routes", []))

    def route_detail(self, route_id: str) -> dict[str, Any]:
        route_id = str(route_id)
        route = self.route_catalog.get(route_id)
        if route is None:
            raise PlannerError(f"Unsupported route_id: {route_id}")
        return {
            "route": route,
            "directions": [
                self.network["route_directions"].get(f"{route_id}|{row.get('direction_id')}")
                for row in route.get("directions", [])
            ],
            "realtime": [
                row for row in self.realtime.get("routes", [])
                if str(row.get("route_id")) == route_id
            ],
        }

    # -------------------------------------------------------------------------
    # Feature 16A · Candidate generation / 候选行程生成
    # -------------------------------------------------------------------------
    def _nearby_stops(self, anchor: Stop) -> list[tuple[Stop, float]]:
        nearby = [
            (stop, haversine_m(anchor, stop))
            for stop in self.stops.values()
            if haversine_m(anchor, stop) <= ACCESS_RADIUS_M
        ]
        nearby.sort(key=lambda item: (item[1], item[0].name, item[0].stop_id))
        return nearby

    def _pattern_access(
        self,
        nearby: list[tuple[Stop, float]],
        *,
        boarding: bool,
    ) -> dict[str, list[tuple[Stop, int, float]]]:
        results: dict[str, list[tuple[Stop, int, float]]] = {}
        for pattern in self.patterns:
            matches = []
            for stop, distance_m in nearby:
                index = pattern.stop_index.get(stop.stop_id)
                if index is None:
                    continue
                if boarding and index >= len(pattern.stops) - 1:
                    continue
                if not boarding and index <= 0:
                    continue
                matches.append((stop, index, distance_m))
            if matches:
                results[pattern.key] = sorted(matches, key=lambda item: item[2])
        return results

    def _route_speed_mph(self, pattern: Pattern) -> float:
        observed = self.vehicle_speeds.get((pattern.route_id, pattern.direction_id))
        if observed is not None:
            return observed
        return self._comparison_speed_mph(pattern)

    def _comparison_speed_mph(self, pattern: Pattern) -> float:
        """Return a transparent vehicle-mode comparison level, not history."""

        route_type = str(self.route_catalog.get(pattern.route_id, {}).get("route_type") or "3")
        if route_type in {"0", "1"}:
            return 11.5
        if route_type == "5":
            return 5.5
        if pattern.route_id.endswith(("R", "X")):
            return 11.0
        return 8.5

    def _wait_minutes(self, pattern: Pattern) -> float:
        row = self.health.get((pattern.route_id, pattern.direction_id), {})
        try:
            headway = float(row.get("median_headway_min"))
        except (TypeError, ValueError):
            headway = 13.0
        return round(max(2.0, min(15.0, headway / 2)), 1)

    def _health_for(self, pattern: Pattern) -> str:
        value = self.health.get((pattern.route_id, pattern.direction_id), {}).get("health")
        return str(value or "NO_DATA")

    def _distance_between(self, pattern: Pattern, start_index: int, end_index: int) -> float:
        return max(0.0, pattern.prefix_distance_m[end_index] - pattern.prefix_distance_m[start_index])

    def _ride_minutes(self, pattern: Pattern, start_index: int, end_index: int) -> float:
        meters = self._distance_between(pattern, start_index, end_index)
        meters_per_min = self._route_speed_mph(pattern) * 1609.344 / 60
        # 中文：每个站增加少量停站时间；这仍是估算值，UI 会明确标注。
        # English: Add a small dwell allowance per stop; the UI labels the result as estimated.
        dwell = max(0, end_index - start_index - 1) * 0.22
        return max(1.0, meters / meters_per_min + dwell)

    def _shape_slice(self, pattern: Pattern, start: Stop, end: Stop) -> list[list[float]]:
        if len(pattern.shape) < 2:
            return [[start.lat, start.lon], [end.lat, end.lon]]
        start_index = min(
            range(len(pattern.shape)),
            key=lambda index: haversine_m(pattern.shape[index], (start.lat, start.lon)),
        )
        end_index = min(
            range(len(pattern.shape)),
            key=lambda index: haversine_m(pattern.shape[index], (end.lat, end.lon)),
        )
        if start_index <= end_index:
            points = pattern.shape[start_index : end_index + 1]
        else:
            points = tuple(reversed(pattern.shape[end_index : start_index + 1]))
        if len(points) < 2:
            points = ((start.lat, start.lon), (end.lat, end.lon))
        return [[round(lat, 6), round(lon, 6)] for lat, lon in points]

    def _leg_disruption(
        self,
        pattern: Pattern,
        start: Stop,
        end: Stop,
    ) -> dict[str, Any]:
        """Explain live movement and nearby road context without claiming cause.

        Feature 22 · Per-leg disruption analysis / 逐段运行与道路背景

        中文：当前速度来自该 route + direction 的车辆回报中位数。对照值只是按
        交通方式设置的透明参考线，不是假装存在的历史平均速度。道路事件只有在明确
        匹配线路或距离本段走廊很近时才显示；即使两者同时出现，也只写“可能有关”，
        绝不写成道路事件已经造成延误。

        English: Current speed is the median reported for this route-direction.
        The comparison level is a documented mode heuristic, not invented
        historical data. Road proximity is context; even when a slowdown and an
        overlap coexist, the result remains corroborating evidence, not causality.
        """

        current_speed = self.vehicle_speeds.get((pattern.route_id, pattern.direction_id))
        comparison_speed = self._comparison_speed_mph(pattern)
        if current_speed is None:
            movement_status = "NO_LIVE_SPEED"
            speed_ratio = None
        else:
            speed_ratio = current_speed / comparison_speed
            if speed_ratio < 0.7:
                movement_status = "SLOWER_THAN_COMPARISON"
            elif speed_ratio < 0.9:
                movement_status = "SLIGHTLY_BELOW_COMPARISON"
            else:
                movement_status = "NEAR_COMPARISON"

        leg_line = [tuple(point) for point in self._shape_slice(pattern, start, end)]
        road_context = []
        roads_status = str(
            self.realtime.get("meta", {}).get("source_status", {}).get("roads", {}).get("status") or ""
        ).lower()
        road_events = [] if roads_status in {"unavailable", "failed", "error"} else self.realtime.get("road_events", [])
        for event in road_events:
            route_ids = {str(value) for value in event.get("route_ids", [])}
            relation = None
            distance_m = None
            if pattern.route_id in route_ids:
                relation = "DIRECT_ROUTE_MATCH"
            else:
                event_points = []
                for point in event.get("geometry", []):
                    try:
                        event_points.append((float(point[0]), float(point[1])))
                    except (IndexError, TypeError, ValueError):
                        continue
                if not event_points:
                    try:
                        event_points = [(float(event["lat"]), float(event["lon"]))]
                    except (KeyError, TypeError, ValueError):
                        event_points = []
                if event_points:
                    distance_m = min(
                        point_to_polyline_m(point, leg_line) for point in event_points
                    )
                    if distance_m <= 60:
                        relation = "DIRECT_OVERLAP"
                    elif distance_m <= 250:
                        relation = "NEARBY"
            if relation:
                road_context.append(
                    {
                        "title": str(event.get("title") or "Road event"),
                        "relation": relation,
                        "distance_m": round(distance_m) if distance_m is not None else None,
                    }
                )

        service_notices = []
        for alert in self.realtime.get("alerts", []):
            route_ids = {str(value) for value in alert.get("route_ids", [])}
            alert_direction = alert.get("direction_id")
            if pattern.route_id not in route_ids:
                continue
            if alert_direction not in (None, "", pattern.direction_id):
                continue
            service_notices.append(
                {
                    "title": str(alert.get("title") or "Muni service update"),
                    "route_match_status": "MATCHED",
                }
            )

        slower = movement_status == "SLOWER_THAN_COMPARISON"
        strong_road_match = any(
            row["relation"] in {"DIRECT_OVERLAP", "DIRECT_ROUTE_MATCH"}
            for row in road_context
        )
        if slower and strong_road_match:
            evidence_status = "SLOWDOWN_WITH_MATCHED_ROAD_CONTEXT"
        elif slower:
            evidence_status = "TRANSIT_SLOWDOWN_ONLY"
        elif road_context:
            evidence_status = "ROAD_CONTEXT_WITHOUT_DETECTED_SLOWDOWN"
        else:
            evidence_status = "NO_MATCHED_DISRUPTION"

        return {
            "route_id": pattern.route_id,
            "direction_id": pattern.direction_id,
            "from_stop_id": start.stop_id,
            "to_stop_id": end.stop_id,
            "current_speed_mph": round(current_speed, 1) if current_speed is not None else None,
            "comparison_speed_mph": round(comparison_speed, 1),
            "comparison_basis": "Vehicle-mode heuristic; not a historical average.",
            "speed_ratio": round(speed_ratio, 2) if speed_ratio is not None else None,
            "movement_status": movement_status,
            "evidence_status": evidence_status,
            "road_context": road_context[:3],
            "service_notices": service_notices[:3],
            "causality_note": (
                "A matched road event may be relevant, but proximity and slowdown "
                "do not prove that the event caused the delay."
            ),
        }

    def _reliability(self, patterns: Iterable[Pattern]) -> tuple[str, float, list[dict[str, Any]]]:
        evidence = []
        worst = "STABLE"
        for pattern in patterns:
            health = self._health_for(pattern)
            if HEALTH_SEVERITY.get(health, 2) > HEALTH_SEVERITY.get(worst, 0):
                worst = health
            row = self.health.get((pattern.route_id, pattern.direction_id), {})
            evidence.append(
                {
                    "route_id": pattern.route_id,
                    "direction_id": pattern.direction_id,
                    "health": health,
                    "median_headway_min": row.get("median_headway_min"),
                    "bunching_events": int(row.get("bunching_events") or 0),
                    "large_gap_events": int(row.get("large_gap_events") or 0),
                    "severe_gap_events": int(row.get("severe_gap_events") or 0),
                    "predictions_observed": int(row.get("predictions_observed") or 0),
                }
            )
        return worst, RELIABILITY_PENALTY_MIN.get(worst, 5.0), evidence

    def _candidate_id(self, parts: Iterable[str]) -> str:
        digest = hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:12]
        return f"journey-{digest}"

    def _area_safety_context(self, stop: Stop) -> dict[str, Any]:
        cached = self._safety_stop_cache.get(stop.stop_id)
        if cached is not None:
            return cached
        nearby = {
            "count30": 0.0,
            "count90": 0.0,
            "count365": 0.0,
            "weighted365": 0.0,
            "context_score": 0.0,
        }
        for lat_offset in range(-3, 4):
            for lon_offset in range(-4, 5):
                key = (
                    round(round(stop.lat, 3) + lat_offset / 1000, 3),
                    round(round(stop.lon, 3) + lon_offset / 1000, 3),
                )
                cell = self.safety_cells.get(key)
                if not cell:
                    continue
                if haversine_m(stop, key) <= 250:
                    for field in nearby:
                        nearby[field] += float(cell.get(field, 0) or 0)
        percentile_rank = midpoint_percentile_rank(
            self.safety_distribution,
            nearby["context_score"],
        )
        percentile_value = round(percentile_rank) if percentile_rank is not None else None
        prior_monthly = max(0.0, nearby["count90"] - nearby["count30"]) / 2
        recent_trend = (
            "RISING"
            if nearby["count30"] >= prior_monthly + 2 and nearby["count30"] >= prior_monthly * 1.25
            else "FALLING"
            if prior_monthly >= nearby["count30"] + 2 and nearby["count30"] <= prior_monthly * 0.75
            else "STEADY"
        )
        result = {
            "stop_id": stop.stop_id,
            "name": stop.name,
            "reported_incidents_30d_nearby": round(nearby["count30"]),
            "reported_incidents_90d_nearby": round(nearby["count90"]),
            "reported_incidents_365d_nearby": round(nearby["count365"]),
            "severity_weighted_365d_nearby": round(nearby["weighted365"], 2),
            "historical_context_score": round(nearby["context_score"], 2),
            "recent_trend": recent_trend,
            "percentile": percentile_value,
            "radius_m": 250,
        }
        self._safety_stop_cache[stop.stop_id] = result
        return result

    @staticmethod
    def _relative_context_label(value: float | None) -> str:
        if value is None:
            return "NOT_RATED"
        if value >= 90:
            return "VERY_HIGHER_REPORTED_CONTEXT"
        if value >= 75:
            return "HIGHER_REPORTED_CONTEXT"
        if value <= 25:
            return "LOWER_REPORTED_CONTEXT"
        return "MID_RANGE_REPORTED_CONTEXT"

    def _journey_safety_context(
        self,
        origin: Stop,
        board: Stop,
        route_stops: Iterable[Stop],
        transfer_stops: Iterable[Stop],
        destination: Stop,
    ) -> dict[str, Any]:
        """Build comparative historical context for one journey.

        中文：这是 Feature 23 的决策层。起点、上车、沿线、换乘和目的地都用同一
        250 米规则计算；沿线取多个站点的中位百分位，再按直达或换乘权重合成。
        这个数字只用于路线排序，不修改 ETA，也不预测个人安全。

        English: Apply one 250 m rule to origin, boarding, route, transfer, and
        destination areas. Route values use medians; journey areas use the
        documented direct or transfer weights with an extreme-value cap. This
        comparison never changes the ETA and never predicts personal safety.
        """

        if not self.safety_distribution:
            return self._safety_context()
        origin_context = self._area_safety_context(origin)
        boarding_context = self._area_safety_context(board)
        route_contexts = [self._area_safety_context(stop) for stop in route_stops]
        transfer_contexts = [self._area_safety_context(stop) for stop in transfer_stops]
        destination_context = self._area_safety_context(destination)

        route_values = [row["percentile"] for row in route_contexts if row["percentile"] is not None]
        transfer_values = [
            row["percentile"] for row in transfer_contexts if row["percentile"] is not None
        ]
        route_percentile = round(median(route_values)) if route_values else None
        transfer_percentile = round(median(transfer_values)) if transfer_values else None
        origin_boarding_values = [
            value
            for value in (origin_context["percentile"], boarding_context["percentile"])
            if value is not None
        ]
        origin_boarding_percentile = (
            round(median(origin_boarding_values)) if origin_boarding_values else None
        )
        is_transfer = bool(transfer_contexts)
        weighted_components = (
            [
                {"key": "origin_boarding", "percentile": origin_boarding_percentile, "weight": 20},
                {"key": "along_route", "percentile": route_percentile, "weight": 35},
                {"key": "transfer", "percentile": transfer_percentile, "weight": 30},
                {"key": "destination", "percentile": destination_context["percentile"], "weight": 15},
            ]
            if is_transfer
            else [
                {"key": "origin_boarding", "percentile": origin_boarding_percentile, "weight": 45},
                {"key": "along_route", "percentile": route_percentile, "weight": 40},
                {"key": "destination", "percentile": destination_context["percentile"], "weight": 15},
            ]
        )
        weighted_components = [
            row for row in weighted_components if row["percentile"] is not None
        ]
        weight_total = sum(row["weight"] for row in weighted_components)
        overall = (
            round(
                sum(min(95, row["percentile"]) * row["weight"] for row in weighted_components)
                / weight_total
            )
            if weight_total
            else None
        )
        safety_excess = max(0.0, float(overall or 0) - SAFETY_MIDPOINT_PERCENTILE)
        return {
            "status": "JOURNEY_RELATIVE_CONTEXT",
            "overall_percentile": overall,
            "origin_percentile": origin_context["percentile"],
            "boarding_percentile": boarding_context["percentile"],
            "route_percentile": route_percentile,
            "transfer_percentile": transfer_percentile,
            "destination_percentile": destination_context["percentile"],
            "segments": weighted_components,
            "extreme_value_cap_percentile": 95,
            "weighting_basis": (
                "One transfer: origin/boarding 20%, along route 35%, transfer 30%, "
                "destination 15%; available segments are renormalized."
                if is_transfer
                else "Direct: origin/boarding 45%, along route 40%, destination 15%; "
                "available segments are renormalized."
            ),
            "percentile_baseline": self.safety_baseline,
            "ranking_effect": {
                "midpoint_percentile": SAFETY_MIDPOINT_PERCENTILE,
                "excess_percentile_points": safety_excess,
                "balanced_penalty_min": round(
                    safety_excess * BALANCED_SAFETY_MIN_PER_POINT, 2
                ),
                "safety_first_penalty_min": round(
                    safety_excess * SAFETY_FIRST_MIN_PER_POINT, 2
                ),
            },
            "label": self._relative_context_label(overall),
            "lookback_days": self.realtime.get("safety", {}).get("lookback_days", 365),
            "radius_m": 250,
            "detail": (
                "Relative 30/90/365-day reported-incident context near journey areas, "
                "compared with all Muni stops."
            ),
            "disclaimer": (
                "Historical reported incidents do not predict crime, label a place "
                "safe or unsafe, or guarantee personal safety."
            ),
        }

    def _safety_context(self) -> dict[str, Any]:
        safety = self.realtime.get("safety", {})
        return {
            "status": "CITY_CONTEXT_ONLY",
            "overall_percentile": None,
            "boarding_percentile": None,
            "transfer_percentile": None,
            "destination_percentile": None,
            "label": "Stop-level evidence unavailable",
            "detail": safety.get("detail") or (
                "Citywide historical context is available, but this journey is not assigned a safety score."
            ),
            "disclaimer": "Historical incident context is not a crime forecast or a safe/unsafe label.",
        }

    def _destination_parking_context(self, destination: Stop) -> dict[str, Any]:
        """Summarize paid-parking pressure within 400 m of the destination.

        Feature 24 · Destination parking pressure / 目的地停车压力

        中文：把目的地 400 米内的路边收费车位、仍在付费有效期内的 session、
        最近 15/30/60 分钟新开始的付费记录和前后半小时趋势合并。它是“付费停车
        压力代理值”，不是实际占用率，更不能推算还剩几个空位。

        English: Combine nearby on-street meter inventory, active paid-session
        proxies, recent starts, and a short trend. This is a demand signal—not
        physical occupancy and never a count of available spaces.
        """

        cached = self._parking_stop_cache.get(destination.stop_id)
        if cached is not None:
            return cached
        if not self.parking_evidence_sufficient:
            result = {
                "status": "LIMITED_EVIDENCE",
                "radius_m": 400,
                "pressure_label": "NOT_RATED",
                "relative_pressure_percentile": None,
                "metered_spaces_represented": 0,
                "active_paid_sessions_proxy": 0,
                "starts_15m": 0,
                "starts_30m": 0,
                "starts_60m": 0,
                "trend": "UNAVAILABLE",
                "match_coverage_ratio": self.parking_mapping_coverage,
                "minimum_match_coverage_ratio": PARKING_MIN_MATCH_COVERAGE,
                "detail": (
                    "Too few recent paid sessions could be matched to mapped meters, "
                    "so no high/low rating is shown."
                ),
                "disclaimer": "This does not measure physical occupancy or open spaces.",
            }
            self._parking_stop_cache[destination.stop_id] = result
            return result
        matched = []
        for row in self.parking_cells:
            try:
                point = (float(row["lat"]), float(row["lon"]))
            except (KeyError, TypeError, ValueError):
                continue
            if haversine_m(destination, point) <= 400:
                matched.append(row)
        if not matched:
            result = {
                "status": "UNAVAILABLE",
                "radius_m": 400,
                "pressure_label": "NOT_RATED",
                "relative_pressure_percentile": None,
                "metered_spaces_represented": 0,
                "active_paid_sessions_proxy": 0,
                "starts_15m": 0,
                "starts_30m": 0,
                "starts_60m": 0,
                "trend": "UNAVAILABLE",
                "detail": "No matched on-street meter evidence near this destination.",
                "disclaimer": "This does not measure physical occupancy or open spaces.",
            }
            self._parking_stop_cache[destination.stop_id] = result
            return result

        inventory = sum(int(row.get("metered_spaces") or 0) for row in matched)
        active = sum(int(row.get("active_paid_sessions_proxy") or 0) for row in matched)
        starts_15 = sum(int(row.get("starts_15m") or 0) for row in matched)
        starts_30 = sum(int(row.get("starts_30m") or 0) for row in matched)
        starts_60 = sum(int(row.get("starts_60m") or 0) for row in matched)
        previous_30 = sum(int(row.get("previous_30m_starts") or 0) for row in matched)
        ratio = active / max(1, inventory)
        percentile_value = (
            round(
                100
                * bisect_right(self.parking_pressure_distribution, ratio)
                / len(self.parking_pressure_distribution)
            )
            if ratio > 0 and self.parking_pressure_distribution
            else 0
        )
        if percentile_value >= 90:
            pressure_label = "VERY_HIGH"
        elif percentile_value >= 70:
            pressure_label = "HIGH"
        elif percentile_value >= 35:
            pressure_label = "MODERATE"
        else:
            pressure_label = "LOW"
        if starts_30 >= previous_30 + 2 and starts_30 >= previous_30 * 1.2:
            trend = "RISING"
        elif previous_30 >= starts_30 + 2 and starts_30 <= previous_30 * 0.8:
            trend = "FALLING"
        else:
            trend = "STEADY"
        result = {
            "status": "PAID_PARKING_PRESSURE_PROXY",
            "radius_m": 400,
            "pressure_label": pressure_label,
            "relative_pressure_percentile": percentile_value,
            "metered_spaces_represented": inventory,
            "active_paid_sessions_proxy": active,
            "paid_session_pressure_ratio": round(ratio, 3),
            "starts_15m": starts_15,
            "starts_30m": starts_30,
            "starts_60m": starts_60,
            "previous_30m_starts": previous_30,
            "trend": trend,
            "detail": (
                "Paid-session activity near on-street meter inventory; useful for "
                "relative demand context only."
            ),
            "disclaimer": (
                "A paid session does not prove a vehicle is present. This does not "
                "measure physical occupancy or open spaces."
            ),
        }
        self._parking_stop_cache[destination.stop_id] = result
        return result

    def _direct_candidate(
        self,
        origin: Stop,
        destination: Stop,
        pattern: Pattern,
        board: Stop,
        board_index: int,
        origin_walk_m: float,
        alight: Stop,
        alight_index: int,
        destination_walk_m: float,
        planning_epoch: float,
    ) -> dict[str, Any]:
        origin_walk_min = origin_walk_m / WALK_SPEED_M_PER_MIN
        destination_walk_min = destination_walk_m / WALK_SPEED_M_PER_MIN
        realtime_trip = self._trip_for_leg(
            pattern,
            board.stop_id,
            alight.stop_id,
            planning_epoch + origin_walk_min * 60,
        )
        if realtime_trip:
            trip = realtime_trip["trip"]
            wait_min = max(
                0.0,
                (realtime_trip["board_epoch"] - planning_epoch - origin_walk_min * 60) / 60,
            )
            ride_min = (realtime_trip["alight_epoch"] - realtime_trip["board_epoch"]) / 60
            eta_status = self._concrete_timing_status()
        else:
            trip = None
            wait_min = self._wait_minutes(pattern)
            ride_min = self._ride_minutes(pattern, board_index, alight_index)
            eta_status = "ESTIMATED"
        walking_min = origin_walk_min + destination_walk_min
        eta_min = walking_min + wait_min + ride_min
        health, reliability_penalty, evidence = self._reliability([pattern])
        disruption = self._leg_disruption(pattern, board, alight)
        safety = self._journey_safety_context(
            origin,
            board,
            pattern.stops[board_index : alight_index + 1],
            [],
            destination,
        )
        balanced_safety_penalty = float(
            safety.get("ranking_effect", {}).get("balanced_penalty_min") or 0
        )
        safety_first_penalty = float(
            safety.get("ranking_effect", {}).get("safety_first_penalty_min") or 0
        )
        journey_id = self._candidate_id(["direct", pattern.key, board.stop_id, alight.stop_id])
        trip_instance_id = self._candidate_id(
            [journey_id, trip.trip_id if trip else "estimate"]
        )
        return {
            "journey_id": journey_id,
            "itinerary_id": journey_id,
            "trip_instance_id": trip_instance_id,
            "journey_type": "DIRECT",
            "route_sequence": pattern.route_id,
            "eta_min": round(eta_min, 1),
            "walking_min": round(walking_min, 1),
            "eta_status": eta_status,
            "transfer_count": 0,
            "reliability": health,
            "reliability_detail": evidence,
            "disruption_analysis": [disruption],
            "exposure": safety["label"],
            "safety": safety,
            "destination_parking": self._destination_parking_context(destination),
            "transfer": None,
            "costs": {
                "fastest": round(eta_min, 3),
                "balanced": round(
                    eta_min + reliability_penalty + walking_min * 0.15
                    + balanced_safety_penalty,
                    3,
                ),
                "safety_first": round(
                    eta_min + reliability_penalty + walking_min * 0.15
                    + safety_first_penalty,
                    3,
                ),
            },
            "legs": [
                {
                    "type": "WALK",
                    "from": origin.public(),
                    "to": board.public(),
                    "duration_min": round(origin_walk_min, 1),
                    "distance_m": round(origin_walk_m),
                },
                {
                    "type": "WAIT",
                    "at": board.public(),
                    "duration_min": round(wait_min, 1),
                    "route_id": pattern.route_id,
                    "trip_id": trip.trip_id if trip else None,
                    "predicted_departure": self._iso_time(realtime_trip["board_epoch"]) if realtime_trip else None,
                    "timing_status": eta_status,
                },
                {
                    "type": "RIDE",
                    "route_id": pattern.route_id,
                    "direction_id": pattern.direction_id,
                    "direction_label": pattern.direction_label,
                    "headsign": pattern.headsign,
                    "from": board.public(),
                    "to": alight.public(),
                    "duration_min": round(ride_min, 1),
                    "stop_count": alight_index - board_index,
                    "trip_id": trip.trip_id if trip else None,
                    "vehicle_id": trip.vehicle_id if trip else None,
                    "predicted_departure": self._iso_time(realtime_trip["board_epoch"]) if realtime_trip else None,
                    "predicted_arrival": self._iso_time(realtime_trip["alight_epoch"]) if realtime_trip else None,
                    "prediction_age_seconds": (
                        max(0, round(planning_epoch - trip.update_timestamp))
                        if trip and trip.update_timestamp
                        else None
                    ),
                    "timing_status": eta_status,
                    "disruption": disruption,
                },
                {
                    "type": "WALK",
                    "from": alight.public(),
                    "to": destination.public(),
                    "duration_min": round(destination_walk_min, 1),
                    "distance_m": round(destination_walk_m),
                },
            ],
            "map": {
                "route_paths": [
                    {
                        "route_id": pattern.route_id,
                        "direction_id": pattern.direction_id,
                        "color": ROUTE_COLORS[0],
                        "points": self._shape_slice(pattern, board, alight),
                    }
                ],
                "walk_paths": [
                    [[origin.lat, origin.lon], [board.lat, board.lon]],
                    [[alight.lat, alight.lon], [destination.lat, destination.lon]],
                ],
                "points": [
                    {**origin.public(), "role": "ORIGIN"},
                    {**board.public(), "role": "BOARD"},
                    {**alight.public(), "role": "ALIGHT"},
                    {**destination.public(), "role": "DESTINATION"},
                ],
            },
        }

    def _best_transfer_pair(
        self,
        first: Pattern,
        first_board_index: int,
        second: Pattern,
        second_alight_index: int,
    ) -> tuple[Stop, int, Stop, int, float] | None:
        best = None
        best_score = math.inf
        for first_index in range(first_board_index + 1, len(first.stops)):
            first_stop = first.stops[first_index]
            for second_index in range(0, second_alight_index):
                second_stop = second.stops[second_index]
                transfer_m = haversine_m(first_stop, second_stop)
                if transfer_m > TRANSFER_RADIUS_M:
                    continue
                score = (
                    self._distance_between(first, first_board_index, first_index)
                    + self._distance_between(second, second_index, second_alight_index)
                    + transfer_m * 2.5
                )
                if score < best_score:
                    best_score = score
                    best = (first_stop, first_index, second_stop, second_index, transfer_m)
        return best

    def _transfer_candidate(
        self,
        origin: Stop,
        destination: Stop,
        first: Pattern,
        first_board: Stop,
        first_board_index: int,
        origin_walk_m: float,
        second: Pattern,
        final_alight: Stop,
        final_alight_index: int,
        destination_walk_m: float,
        transfer_pair: tuple[Stop, int, Stop, int, float],
        planning_epoch: float,
    ) -> dict[str, Any]:
        first_alight, first_alight_index, second_board, second_board_index, transfer_m = transfer_pair
        origin_walk_min = origin_walk_m / WALK_SPEED_M_PER_MIN
        transfer_walk_min = transfer_m / WALK_SPEED_M_PER_MIN
        destination_walk_min = destination_walk_m / WALK_SPEED_M_PER_MIN

        # Feature 21 · Concrete transfer catchability / 具体班次换乘可行性
        # 中文：先找用户步行到起点后能赶上的第一趟车，再用这趟车到达换乘站的
        # 预测时间作为第二段搜索起点。第二趟车必须晚于“到达 + 换乘步行 + 1 分钟
        # 上车余量”。若任一段缺少完整预测，就明确退回班距估算，不能伪装成实时。
        # English: Select Trip 1 after the access walk, then search for Trip 2
        # after Trip 1 arrival, the transfer walk, and a one-minute boarding
        # allowance. Incomplete evidence falls back to an explicitly estimated
        # connection rather than presenting false precision.
        first_prediction = self._trip_for_leg(
            first,
            first_board.stop_id,
            first_alight.stop_id,
            planning_epoch + origin_walk_min * 60,
        )
        if first_prediction:
            first_trip = first_prediction["trip"]
            first_wait = max(
                0.0,
                (first_prediction["board_epoch"] - planning_epoch - origin_walk_min * 60) / 60,
            )
            first_ride = (first_prediction["alight_epoch"] - first_prediction["board_epoch"]) / 60
            transfer_walk_complete_epoch = first_prediction["alight_epoch"] + transfer_walk_min * 60
            second_prediction = self._trip_for_leg(
                second,
                second_board.stop_id,
                final_alight.stop_id,
                transfer_walk_complete_epoch + BOARDING_BUFFER_MIN * 60,
            )
        else:
            first_trip = None
            first_wait = self._wait_minutes(first)
            first_ride = self._ride_minutes(first, first_board_index, first_alight_index)
            transfer_walk_complete_epoch = None
            second_prediction = None

        if second_prediction and transfer_walk_complete_epoch is not None:
            second_trip = second_prediction["trip"]
            second_wait = max(
                0.0,
                (second_prediction["board_epoch"] - transfer_walk_complete_epoch) / 60,
            )
            second_ride = (second_prediction["alight_epoch"] - second_prediction["board_epoch"]) / 60
            transfer_buffer = (
                second_prediction["board_epoch"]
                - transfer_walk_complete_epoch
                - BOARDING_BUFFER_MIN * 60
            ) / 60
            eta_status = self._concrete_timing_status()
            transfer_basis = (
                "Recent cached GTFS-RT predictions for both trips."
                if eta_status == "RECENT_CACHED_PREDICTION"
                else "Concrete GTFS-RT arrival and departure predictions for both trips."
            )
        else:
            second_trip = None
            second_wait = self._wait_minutes(second)
            second_ride = self._ride_minutes(second, second_board_index, final_alight_index)
            transfer_buffer = second_wait - BOARDING_BUFFER_MIN
            eta_status = (
                "MIXED_CACHED"
                if first_prediction and self._concrete_timing_status() == "RECENT_CACHED_PREDICTION"
                else "MIXED_REALTIME"
                if first_prediction
                else "ESTIMATED"
            )
            transfer_basis = "Estimated from route headway evidence; not a guaranteed connection."

        walking_min = origin_walk_min + transfer_walk_min + destination_walk_min
        eta_min = walking_min + first_wait + first_ride + second_wait + second_ride
        health, reliability_penalty, evidence = self._reliability([first, second])
        first_disruption = self._leg_disruption(first, first_board, first_alight)
        second_disruption = self._leg_disruption(second, second_board, final_alight)
        safety = self._journey_safety_context(
            origin,
            first_board,
            (
                first.stops[first_board_index : first_alight_index + 1]
                + second.stops[second_board_index : final_alight_index + 1]
            ),
            [first_alight, second_board],
            destination,
        )
        balanced_safety_penalty = float(
            safety.get("ranking_effect", {}).get("balanced_penalty_min") or 0
        )
        safety_first_penalty = float(
            safety.get("ranking_effect", {}).get("safety_first_penalty_min") or 0
        )
        if transfer_buffer < 0:
            catchability = "MISS"
        elif transfer_buffer >= 3:
            catchability = "CATCHABLE"
        else:
            catchability = "TIGHT"
        route_sequence = f"{first.route_id} → {second.route_id}"
        journey_id = self._candidate_id(
            [
                "transfer", first.key, second.key, first_board.stop_id,
                first_alight.stop_id, second_board.stop_id, final_alight.stop_id,
            ]
        )
        trip_instance_id = self._candidate_id(
            [
                journey_id,
                first_trip.trip_id if first_trip else "estimate",
                second_trip.trip_id if second_trip else "estimate",
            ]
        )
        return {
            "journey_id": journey_id,
            "itinerary_id": journey_id,
            "trip_instance_id": trip_instance_id,
            "journey_type": "ONE_TRANSFER",
            "route_sequence": route_sequence,
            "eta_min": round(eta_min, 1),
            "walking_min": round(walking_min, 1),
            "eta_status": eta_status,
            "transfer_count": 1,
            "reliability": health,
            "reliability_detail": evidence,
            "disruption_analysis": [first_disruption, second_disruption],
            "exposure": safety["label"],
            "safety": safety,
            "destination_parking": self._destination_parking_context(destination),
            "transfer": {
                "from_stop": first_alight.public(),
                "to_stop": second_board.public(),
                "walk_min": round(transfer_walk_min, 1),
                "catch_slack_min": round(transfer_buffer, 1),
                "estimated_buffer_min": round(transfer_buffer, 1),
                "catchability": catchability,
                "basis": transfer_basis,
                "timing_status": eta_status,
                "first_trip_arrival": (
                    self._iso_time(first_prediction["alight_epoch"])
                    if first_prediction
                    else None
                ),
                "ready_to_board_at": self._iso_time(
                    transfer_walk_complete_epoch + BOARDING_BUFFER_MIN * 60
                ) if transfer_walk_complete_epoch is not None else None,
                "second_trip_departure": (
                    self._iso_time(second_prediction["board_epoch"])
                    if second_prediction
                    else None
                ),
                "boarding_buffer_min": BOARDING_BUFFER_MIN,
            },
            "costs": {
                "fastest": round(eta_min, 3),
                "balanced": round(
                    eta_min + reliability_penalty + walking_min * 0.15 + 3.0
                    + balanced_safety_penalty,
                    3,
                ),
                "safety_first": round(
                    eta_min
                    + reliability_penalty
                    + walking_min * 0.15
                    + 3.0
                    + safety_first_penalty,
                    3,
                ),
            },
            "legs": [
                {
                    "type": "WALK",
                    "from": origin.public(),
                    "to": first_board.public(),
                    "duration_min": round(origin_walk_min, 1),
                    "distance_m": round(origin_walk_m),
                },
                {
                    "type": "WAIT",
                    "at": first_board.public(),
                    "duration_min": round(first_wait, 1),
                    "route_id": first.route_id,
                    "trip_id": first_trip.trip_id if first_trip else None,
                    "predicted_departure": (
                        self._iso_time(first_prediction["board_epoch"])
                        if first_prediction
                        else None
                    ),
                    "timing_status": (
                        self._concrete_timing_status() if first_prediction else "ESTIMATED"
                    ),
                },
                {
                    "type": "RIDE",
                    "route_id": first.route_id,
                    "direction_id": first.direction_id,
                    "direction_label": first.direction_label,
                    "headsign": first.headsign,
                    "from": first_board.public(),
                    "to": first_alight.public(),
                    "duration_min": round(first_ride, 1),
                    "stop_count": first_alight_index - first_board_index,
                    "trip_id": first_trip.trip_id if first_trip else None,
                    "vehicle_id": first_trip.vehicle_id if first_trip else None,
                    "predicted_departure": (
                        self._iso_time(first_prediction["board_epoch"])
                        if first_prediction
                        else None
                    ),
                    "predicted_arrival": (
                        self._iso_time(first_prediction["alight_epoch"])
                        if first_prediction
                        else None
                    ),
                    "timing_status": (
                        self._concrete_timing_status() if first_prediction else "ESTIMATED"
                    ),
                    "disruption": first_disruption,
                },
                {
                    "type": "WALK",
                    "from": first_alight.public(),
                    "to": second_board.public(),
                    "duration_min": round(transfer_walk_min, 1),
                    "distance_m": round(transfer_m),
                    "transfer": True,
                },
                {
                    "type": "WAIT",
                    "at": second_board.public(),
                    "duration_min": round(second_wait, 1),
                    "route_id": second.route_id,
                    "trip_id": second_trip.trip_id if second_trip else None,
                    "predicted_departure": (
                        self._iso_time(second_prediction["board_epoch"])
                        if second_prediction
                        else None
                    ),
                    "catch_slack_min": round(transfer_buffer, 1),
                    "estimated_buffer_min": round(transfer_buffer, 1),
                    "timing_status": (
                        self._concrete_timing_status() if second_prediction else "ESTIMATED"
                    ),
                },
                {
                    "type": "RIDE",
                    "route_id": second.route_id,
                    "direction_id": second.direction_id,
                    "direction_label": second.direction_label,
                    "headsign": second.headsign,
                    "from": second_board.public(),
                    "to": final_alight.public(),
                    "duration_min": round(second_ride, 1),
                    "stop_count": final_alight_index - second_board_index,
                    "trip_id": second_trip.trip_id if second_trip else None,
                    "vehicle_id": second_trip.vehicle_id if second_trip else None,
                    "predicted_departure": (
                        self._iso_time(second_prediction["board_epoch"])
                        if second_prediction
                        else None
                    ),
                    "predicted_arrival": (
                        self._iso_time(second_prediction["alight_epoch"])
                        if second_prediction
                        else None
                    ),
                    "timing_status": (
                        self._concrete_timing_status() if second_prediction else "ESTIMATED"
                    ),
                    "disruption": second_disruption,
                },
                {
                    "type": "WALK",
                    "from": final_alight.public(),
                    "to": destination.public(),
                    "duration_min": round(destination_walk_min, 1),
                    "distance_m": round(destination_walk_m),
                },
            ],
            "map": {
                "route_paths": [
                    {"route_id": first.route_id, "direction_id": first.direction_id, "color": ROUTE_COLORS[0], "points": self._shape_slice(first, first_board, first_alight)},
                    {"route_id": second.route_id, "direction_id": second.direction_id, "color": ROUTE_COLORS[1], "points": self._shape_slice(second, second_board, final_alight)},
                ],
                "walk_paths": [
                    [[origin.lat, origin.lon], [first_board.lat, first_board.lon]],
                    [[first_alight.lat, first_alight.lon], [second_board.lat, second_board.lon]],
                    [[final_alight.lat, final_alight.lon], [destination.lat, destination.lon]],
                ],
                "points": [
                    {**origin.public(), "role": "ORIGIN"},
                    {**first_board.public(), "role": "BOARD"},
                    {**first_alight.public(), "role": "TRANSFER_FROM"},
                    {**second_board.public(), "role": "TRANSFER_TO"},
                    {**final_alight.public(), "role": "ALIGHT"},
                    {**destination.public(), "role": "DESTINATION"},
                ],
            },
        }

    def _generate_candidates(
        self,
        origin: Stop,
        destination: Stop,
        planning_epoch: float,
    ) -> list[dict[str, Any]]:
        origin_access = self._pattern_access(self._nearby_stops(origin), boarding=True)
        destination_access = self._pattern_access(self._nearby_stops(destination), boarding=False)
        candidates: list[dict[str, Any]] = []

        # 中文：先找同一线路方向上“先上后下”的直达组合。
        # English: Direct candidates require boarding before alighting on one directed pattern.
        for key in sorted(set(origin_access) & set(destination_access)):
            pattern = self.pattern_by_key[key]
            best_pair = None
            best_score = math.inf
            for board, board_index, origin_walk_m in origin_access[key]:
                for alight, alight_index, destination_walk_m in destination_access[key]:
                    if alight_index <= board_index:
                        continue
                    score = origin_walk_m + destination_walk_m + self._distance_between(pattern, board_index, alight_index)
                    if score < best_score:
                        best_score = score
                        best_pair = (board, board_index, origin_walk_m, alight, alight_index, destination_walk_m)
            if best_pair:
                candidates.append(
                    self._direct_candidate(
                        origin,
                        destination,
                        pattern,
                        *best_pair,
                        planning_epoch,
                    )
                )

        # 中文：再找一次换乘，禁止同一路线自己换自己，并限制站间步行距离。
        # English: One-transfer candidates exclude same-route transfers and cap transfer walking.
        transfer_best: dict[tuple[str, str], dict[str, Any]] = {}
        for first_key, first_options in origin_access.items():
            first = self.pattern_by_key[first_key]
            for second_key, second_options in destination_access.items():
                second = self.pattern_by_key[second_key]
                if first.route_id == second.route_id:
                    continue
                pair_key = (first.key, second.key)
                best_candidate = None
                for first_board, first_board_index, origin_walk_m in first_options:
                    for final_alight, final_alight_index, destination_walk_m in second_options:
                        transfer_pair = self._best_transfer_pair(
                            first, first_board_index, second, final_alight_index
                        )
                        if transfer_pair is None:
                            continue
                        candidate = self._transfer_candidate(
                            origin,
                            destination,
                            first,
                            first_board,
                            first_board_index,
                            origin_walk_m,
                            second,
                            final_alight,
                            final_alight_index,
                            destination_walk_m,
                            transfer_pair,
                            planning_epoch,
                        )
                        if best_candidate is None or candidate["eta_min"] < best_candidate["eta_min"]:
                            best_candidate = candidate
                if best_candidate is not None:
                    transfer_best[pair_key] = best_candidate
        candidates.extend(transfer_best.values())

        # 中文：相同路线序列只保留最快的代表，避免 alternatives 被重复变体淹没。
        # English: Keep the best representative of each route sequence for a concise comparison UI.
        best_by_sequence: dict[str, dict[str, Any]] = {}
        for candidate in candidates:
            key = candidate["route_sequence"]
            if key not in best_by_sequence or candidate["costs"]["balanced"] < best_by_sequence[key]["costs"]["balanced"]:
                best_by_sequence[key] = candidate
        return list(best_by_sequence.values())

    def _mark_pareto(self, candidates: list[dict[str, Any]]) -> None:
        for candidate in candidates:
            candidate["pareto_efficient"] = not any(
                other["eta_min"] <= candidate["eta_min"]
                and other["walking_min"] <= candidate["walking_min"]
                and RELIABILITY_PENALTY_MIN.get(other["reliability"], 5.0)
                <= RELIABILITY_PENALTY_MIN.get(candidate["reliability"], 5.0)
                and (
                    other["eta_min"] < candidate["eta_min"]
                    or other["walking_min"] < candidate["walking_min"]
                    or RELIABILITY_PENALTY_MIN.get(other["reliability"], 5.0)
                    < RELIABILITY_PENALTY_MIN.get(candidate["reliability"], 5.0)
                )
                for other in candidates
                if other is not candidate
            )

    def plan(self, origin_stop_id: str, destination_stop_id: str, mode: str = "BALANCED") -> dict[str, Any]:
        """Return one shared candidate set and three independently ranked winners."""

        origin = self.stops.get(str(origin_stop_id))
        destination = self.stops.get(str(destination_stop_id))
        if origin is None:
            raise UnsupportedStopError(f"Unknown origin stop_id: {origin_stop_id}")
        if destination is None:
            raise UnsupportedStopError(f"Unknown destination stop_id: {destination_stop_id}")
        if origin.stop_id == destination.stop_id:
            raise PlannerError("Origin and destination must be different stops.")

        planning_epoch = datetime.now(timezone.utc).timestamp()
        candidates = self._generate_candidates(origin, destination, planning_epoch)
        if not candidates:
            raise NoJourneyError(
                "No direct or one-transfer journey was found within the current access limits."
            )
        self._mark_pareto(candidates)
        candidates.sort(key=lambda row: (row["costs"]["balanced"], row["eta_min"]))
        candidates = candidates[:MAX_ALTERNATIVES]

        mode_keys = {
            "FASTEST": "fastest",
            "BALANCED": "balanced",
            "SAFETY_FIRST": "safety_first",
        }
        selected_mode = str(mode or "BALANCED").upper()
        if selected_mode not in mode_keys:
            raise PlannerError(f"Unsupported mode: {mode}")

        modes = []
        winners: dict[str, dict[str, Any]] = {}
        for mode_name, cost_key in mode_keys.items():
            winner = min(candidates, key=lambda row: (row["costs"][cost_key], row["eta_min"]))
            winners[mode_name] = winner
            if mode_name == "FASTEST":
                explanation = "Lowest estimated transit journey time in the current candidate set."
            elif mode_name == "BALANCED":
                explanation = (
                    "Balances ETA, walking, transfers, current spacing, and a small "
                    "adjustment only for historical context above the Muni-stop midpoint."
                )
            else:
                explanation = (
                    "Gives more weight to historical report context above the Muni-stop "
                    "midpoint; this is not a prediction of personal safety."
                    if self.safety_distribution
                    else "Stop-level historical context is not available, so this falls back to the reliability-aware ranking."
                )
            modes.append(
                {
                    "mode": mode_name,
                    "winner_journey_id": winner["journey_id"],
                    "route": winner["route_sequence"],
                    "eta_min": winner["eta_min"],
                    "walking_min": winner["walking_min"],
                    "transfer_count": winner["transfer_count"],
                    "eta_status": winner["eta_status"],
                    "reliability_label": winner["reliability"],
                    "exposure_label": winner["exposure"],
                    "explanation": explanation,
                }
            )

        selected = winners[selected_mode]
        return {
            "meta": {
                "engine_version": ENGINE_VERSION,
                "calculated_at": datetime.now(timezone.utc).isoformat(),
                "calculation_basis": "Cached GTFS route-direction patterns plus the latest credential-free realtime snapshot.",
                "eta_status": selected["eta_status"],
                "transit_source_status": self.transit_source_status,
                "transit_prediction_basis": (
                    "RECENT_CACHE"
                    if selected["eta_status"] in {"RECENT_CACHED_PREDICTION", "MIXED_CACHED"}
                    else "LIVE_OR_ESTIMATED"
                ),
                "trip_prediction_count": sum(len(rows) for rows in self.predicted_trips.values()),
                "safety_status": (
                    "JOURNEY_RELATIVE_CONTEXT"
                    if self.safety_distribution
                    else "CITY_CONTEXT_ONLY"
                ),
                "safety_percentile_baseline": self.safety_baseline,
                "future_browser_engine_contract": "The response is transport-neutral so a future JavaScript engine can return the same schema.",
                "freshness": {
                    "realtime_generated_at": self.realtime.get("meta", {}).get("generated_at"),
                    "realtime_status": self.realtime.get("meta", {}).get("status"),
                    "network_feed_version": self.network.get("meta", {}).get("feed_version"),
                    "parking_source_time": self.realtime.get("parking", {}).get("source_snapshot_time"),
                    "safety_basis": self.realtime.get("safety", {}).get("status"),
                },
            },
            "origin": origin.public(),
            "destination": destination.public(),
            "selected_mode": selected_mode,
            "selected_journey_id": selected["journey_id"],
            "modes": modes,
            "alternatives": candidates,
        }
