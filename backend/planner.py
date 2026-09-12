"""Cache-backed Muni journey planner used by the FastAPI service.

中文：这个模块把 Notebook Feature 12 的核心产品规则整理成可部署的服务层：
同一批候选行程分别按 FASTEST、BALANCED、SAFETY_FIRST 排序，但绝不修改真实 ETA。

English: This module turns the core Feature 12 product contract into a deployable
service layer. The same candidate set is ranked for three modes, while actual ETA
remains an observable estimate rather than a preference-adjusted number.
"""

from __future__ import annotations

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
WALK_SPEED_M_PER_MIN = 80.0
ACCESS_RADIUS_M = 520.0
TRANSFER_RADIUS_M = 260.0
MAX_ACCESS_STOPS = 10
MAX_ALTERNATIVES = 12
ENGINE_VERSION = "16A.1"

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
    """One representative route + direction stop pattern and geometry."""

    key: str
    route_id: str
    direction_id: str
    direction_label: str
    headsign: str
    stops: tuple[Stop, ...]
    shape: tuple[tuple[float, float], ...]
    stop_index: dict[str, int]
    prefix_distance_m: tuple[float, ...]


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
        self.route_catalog = {
            str(row.get("route_id")): row for row in network.get("routes", [])
        }
        self.patterns = tuple(
            pattern
            for key, row in network.get("route_directions", {}).items()
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
            if speed_mps < 1:
                continue
            key = (str(row.get("route_id")), str(row.get("direction_id")))
            grouped.setdefault(key, []).append(speed_mps * 2.23694)
        return {
            key: max(5.0, min(18.0, median(values)))
            for key, values in grouped.items()
        }

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
        return nearby[:MAX_ACCESS_STOPS]

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
                results[pattern.key] = sorted(matches, key=lambda item: item[2])[:3]
        return results

    def _route_speed_mph(self, pattern: Pattern) -> float:
        observed = self.vehicle_speeds.get((pattern.route_id, pattern.direction_id))
        if observed is not None:
            return observed
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
    ) -> dict[str, Any]:
        wait_min = self._wait_minutes(pattern)
        ride_min = self._ride_minutes(pattern, board_index, alight_index)
        origin_walk_min = origin_walk_m / WALK_SPEED_M_PER_MIN
        destination_walk_min = destination_walk_m / WALK_SPEED_M_PER_MIN
        walking_min = origin_walk_min + destination_walk_min
        eta_min = walking_min + wait_min + ride_min
        health, reliability_penalty, evidence = self._reliability([pattern])
        journey_id = self._candidate_id(
            ["direct", pattern.key, board.stop_id, alight.stop_id]
        )
        return {
            "journey_id": journey_id,
            "journey_type": "DIRECT",
            "route_sequence": pattern.route_id,
            "eta_min": round(eta_min, 1),
            "walking_min": round(walking_min, 1),
            "transfer_count": 0,
            "reliability": health,
            "reliability_detail": evidence,
            "exposure": "CITY_CONTEXT_ONLY",
            "safety": self._safety_context(),
            "transfer": None,
            "costs": {
                "fastest": round(eta_min, 3),
                "balanced": round(eta_min + reliability_penalty + walking_min * 0.15, 3),
                "safety_first": round(eta_min + reliability_penalty + walking_min * 0.15, 3),
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
                    "duration_min": wait_min,
                    "route_id": pattern.route_id,
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
    ) -> dict[str, Any]:
        first_alight, first_alight_index, second_board, second_board_index, transfer_m = transfer_pair
        first_wait = self._wait_minutes(first)
        second_wait = self._wait_minutes(second)
        first_ride = self._ride_minutes(first, first_board_index, first_alight_index)
        second_ride = self._ride_minutes(second, second_board_index, final_alight_index)
        origin_walk_min = origin_walk_m / WALK_SPEED_M_PER_MIN
        transfer_walk_min = transfer_m / WALK_SPEED_M_PER_MIN
        destination_walk_min = destination_walk_m / WALK_SPEED_M_PER_MIN
        walking_min = origin_walk_min + transfer_walk_min + destination_walk_min
        eta_min = walking_min + first_wait + first_ride + second_wait + second_ride
        health, reliability_penalty, evidence = self._reliability([first, second])
        transfer_buffer = max(0.0, second_wait - transfer_walk_min)
        catchability = "CATCHABLE" if transfer_buffer >= 3 else "TIGHT"
        route_sequence = f"{first.route_id} → {second.route_id}"
        journey_id = self._candidate_id(
            [
                "transfer", first.key, second.key, first_board.stop_id,
                first_alight.stop_id, second_board.stop_id, final_alight.stop_id,
            ]
        )
        return {
            "journey_id": journey_id,
            "journey_type": "ONE_TRANSFER",
            "route_sequence": route_sequence,
            "eta_min": round(eta_min, 1),
            "walking_min": round(walking_min, 1),
            "transfer_count": 1,
            "reliability": health,
            "reliability_detail": evidence,
            "exposure": "CITY_CONTEXT_ONLY",
            "safety": self._safety_context(),
            "transfer": {
                "from_stop": first_alight.public(),
                "to_stop": second_board.public(),
                "walk_min": round(transfer_walk_min, 1),
                "estimated_buffer_min": round(transfer_buffer, 1),
                "catchability": catchability,
                "basis": "Estimated from route headway evidence; not a guaranteed connection.",
            },
            "costs": {
                "fastest": round(eta_min, 3),
                "balanced": round(eta_min + reliability_penalty + walking_min * 0.15 + 3.0, 3),
                "safety_first": round(eta_min + reliability_penalty + walking_min * 0.15 + 3.0, 3),
            },
            "legs": [
                {"type": "WALK", "from": origin.public(), "to": first_board.public(), "duration_min": round(origin_walk_min, 1), "distance_m": round(origin_walk_m)},
                {"type": "WAIT", "at": first_board.public(), "duration_min": first_wait, "route_id": first.route_id},
                {"type": "RIDE", "route_id": first.route_id, "direction_id": first.direction_id, "direction_label": first.direction_label, "headsign": first.headsign, "from": first_board.public(), "to": first_alight.public(), "duration_min": round(first_ride, 1), "stop_count": first_alight_index - first_board_index},
                {"type": "WALK", "from": first_alight.public(), "to": second_board.public(), "duration_min": round(transfer_walk_min, 1), "distance_m": round(transfer_m), "transfer": True},
                {"type": "WAIT", "at": second_board.public(), "duration_min": second_wait, "route_id": second.route_id, "estimated_buffer_min": round(transfer_buffer, 1)},
                {"type": "RIDE", "route_id": second.route_id, "direction_id": second.direction_id, "direction_label": second.direction_label, "headsign": second.headsign, "from": second_board.public(), "to": final_alight.public(), "duration_min": round(second_ride, 1), "stop_count": final_alight_index - second_board_index},
                {"type": "WALK", "from": final_alight.public(), "to": destination.public(), "duration_min": round(destination_walk_min, 1), "distance_m": round(destination_walk_m)},
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

    def _generate_candidates(self, origin: Stop, destination: Stop) -> list[dict[str, Any]]:
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
                candidates.append(self._direct_candidate(origin, destination, pattern, *best_pair))

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

        candidates = self._generate_candidates(origin, destination)
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
                explanation = "Lowest estimated door-to-door travel time in the current candidate set."
            elif mode_name == "BALANCED":
                explanation = "Balances ETA, walking, transfers, and current service-spacing evidence."
            else:
                explanation = "Stop-level safety evidence is not yet available, so this transparently falls back to the reliability-aware ranking."
            modes.append(
                {
                    "mode": mode_name,
                    "winner_journey_id": winner["journey_id"],
                    "route": winner["route_sequence"],
                    "eta_min": winner["eta_min"],
                    "walking_min": winner["walking_min"],
                    "transfer_count": winner["transfer_count"],
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
                "eta_status": "ESTIMATED",
                "safety_status": "CITY_CONTEXT_ONLY",
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
