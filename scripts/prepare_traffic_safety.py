#!/usr/bin/env python3
"""Feature 7: official injury crashes, current Muni corridors, and Tableau exports.

中文：交通事故与警方事件分开处理。按事故编号去重后，与当前 GTFS 各方向
全部 shape variants 的线段匹配；不是 Muni 车辆事故，也不是个人风险预测。
English: Keep crashes separate from police incidents. Deduplicate crash IDs and
match to all current GTFS shape variants, not just sampled vertices. Proximity
does not establish Muni involvement or personal risk.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
DATASET = "ubvf-ztfx"
SOURCE_URL = f"https://data.sf.gov/d/{DATASET}"
API_URL = f"https://data.sf.gov/api/v3/views/{DATASET}/query.json"
MAX_BUFFER_M = 200
GRID_M = 250
FIELDS = (
    "case_id_pkey,collision_datetime,collision_date,tb_latitude,tb_longitude,"
    "collision_severity,number_killed,number_injured,primary_rd,secondary_rd,"
    "dph_col_grp_description,type_of_collision,data_updated_at,data_loaded_at"
)


def query_rows(query: str, page: int = 1, size: int = 5000) -> list[dict]:
    token = os.environ.get("SF_TRANSIT_DATASF_APP_TOKEN", "").strip()
    response = requests.get(API_URL, params={"query": query, "pageNumber": page, "pageSize": size},
                            headers={"X-App-Token": token} if token else {}, timeout=90)
    response.raise_for_status()
    rows = response.json()
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        raise ValueError("Unrecognized DataSF response; retain the previous public file.")
    return rows


def fetch_crashes() -> tuple[list[dict], dict]:
    # 中文：窗口随最新事故年份滚动；定期重读可捕获上游修订，不只是追加新日期。
    # English: Roll the five-calendar-year window with the source; reread to capture revisions.
    metadata = query_rows("SELECT max(collision_date) AS latest, max(data_loaded_at) AS loaded", size=1)[0]
    latest = str(metadata.get("latest") or "")[:10]
    datetime.strptime(latest, "%Y-%m-%d")
    start = f"{int(latest[:4]) - 4}-01-01"
    where = f"collision_date >= '{start}T00:00:00' AND collision_date <= '{latest}T23:59:59'"
    expected = int(query_rows(f"SELECT count(*) AS n WHERE {where}", size=1)[0]["n"])
    result = []
    for page in range(1, math.ceil(expected / 5000) + 1):
        result.extend(query_rows(f"SELECT {FIELDS} WHERE {where} ORDER BY case_id_pkey, collision_date", page))
    if not result or len(result) != expected:
        raise ValueError(f"Incomplete crash download: expected {expected}, received {len(result)}.")
    return result, {"coverage_start": start, "coverage_end": latest,
                    "source_loaded_at": metadata.get("loaded"), "source_row_count": expected}


def integer(value) -> int:
    try:
        return max(0, int(float(value)))
    except (ValueError, TypeError):
        return 0


def normalize_crashes(rows: list[dict]) -> tuple[list[dict], dict]:
    # 中文：事故数与伤亡人数分开。相同 case_id 只保留最近更新的一行。
    # English: Crash counts are distinct from victim counts. Keep the latest version of each ID.
    unique = {}
    excluded = 0
    for row in sorted(rows, key=lambda r: (str(r.get("data_updated_at", "")), str(r.get("data_loaded_at", "")))):
        crash_id = str(row.get("case_id_pkey") or "").strip()
        date = str(row.get("collision_date") or row.get("collision_datetime") or "")[:10]
        try:
            lat, lon = float(row["tb_latitude"]), float(row["tb_longitude"])
            datetime.strptime(date, "%Y-%m-%d")
            if not crash_id or not (37.68 <= lat <= 37.84 and -122.55 <= lon <= -122.33):
                raise ValueError("Unusable location or ID")
        except (KeyError, ValueError, TypeError):
            excluded += 1
            continue
        severity_text = str(row.get("collision_severity") or "Unknown")
        severity = {"Fatal": "FATAL", "Injury (Severe)": "SEVERE", "Injury (Other Visible)": "VISIBLE",
                    "Injury (Complaint of Pain)": "PAIN"}.get(severity_text, "UNKNOWN")
        group = str(row.get("dph_col_grp_description") or "Unknown/Not Stated")
        unique[crash_id] = {
            "crash_id": crash_id, "date": date,
            "datetime": row.get("collision_datetime"),
            "lat": round(lat, 7), "lon": round(lon, 7),
            "severity": severity, "severity_description": severity_text,
            "killed": integer(row.get("number_killed")), "injured": integer(row.get("number_injured")),
            "street": str(row.get("primary_rd") or ""), "cross_street": str(row.get("secondary_rd") or ""),
            "group": group, "collision_type": str(row.get("type_of_collision") or "Unknown"),
            "pedestrian": "pedestrian" in group.lower(), "cyclist": "bicycle" in group.lower(),
        }
    crashes = sorted(unique.values(), key=lambda row: (row["date"], row["crash_id"]))
    return crashes, {"excluded_row_count": excluded, "duplicate_row_count": len(rows) - excluded - len(crashes)}


def project(lat: float, lon: float) -> tuple[float, float]:
    # 中文：旧方法用采样顶点会漏掉长线段中部。这里使用局部米制投影与点到线段距离。
    # English: Vertex-only distance misses segment interiors. Use a local metre projection and segments.
    return ((lon + 122.45) * 111195 * math.cos(math.radians(37.76)), (lat - 37.76) * 111195)


def point_segment_distance(point, a, b) -> float:
    dx, dy = b[0] - a[0], b[1] - a[1]
    denominator = dx * dx + dy * dy
    t = max(0.0, min(1.0, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / denominator)) if denominator else 0
    return math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy)


def match_routes(crashes: list[dict], network: dict) -> tuple[list[list], list[dict]]:
    index = defaultdict(list)
    routes = {str(row["route_id"]): row for row in network.get("routes", [])}
    directions = {}
    seen_segments = set()
    # 中文：全部 variants 按 route + direction 合并；网格先筛候选，避免全表暴力比较。
    # English: Union all variants by route/direction. A grid narrows candidates before exact distances.
    for pattern in (network.get("patterns") or network.get("route_directions", {})).values():
        route_id, direction_id = str(pattern["route_id"]), str(pattern["direction_id"])
        key = (route_id, direction_id)
        directions.setdefault(key, {"route_id": route_id, "direction_id": direction_id,
            "label": str(routes.get(route_id, {}).get("route_short_name") or route_id),
            "long_name": str(routes.get(route_id, {}).get("route_long_name") or ""), "shapes": []})
        shape = pattern.get("shape", [])
        if len(shape) < 2:
            continue
        directions[key]["shapes"].append(shape)
        points = [project(float(lat), float(lon)) for lat, lon in shape]
        for a, b in zip(points, points[1:]):
            signature = (key, min(a, b), max(a, b))
            if signature in seen_segments:
                continue
            seen_segments.add(signature)
            for gx in range(math.floor((min(a[0], b[0]) - MAX_BUFFER_M) / GRID_M), math.floor((max(a[0], b[0]) + MAX_BUFFER_M) / GRID_M) + 1):
                for gy in range(math.floor((min(a[1], b[1]) - MAX_BUFFER_M) / GRID_M), math.floor((max(a[1], b[1]) + MAX_BUFFER_M) / GRID_M) + 1):
                    index[(gx, gy)].append((key, a, b))
    if not seen_segments:
        raise ValueError("Muni network has no line geometry; do not publish an empty match table.")
    matches = []
    for crash_index, crash in enumerate(crashes):
        point = project(crash["lat"], crash["lon"])
        distances = {}
        for key, a, b in index.get((math.floor(point[0] / GRID_M), math.floor(point[1] / GRID_M)), []):
            distance = point_segment_distance(point, a, b)
            if distance <= MAX_BUFFER_M:
                distances[key] = min(distance, distances.get(key, float("inf")))
        for (route, direction), distance in sorted(distances.items()):
            matches.append([route, direction, crash_index, round(distance, 2)])
    return matches, sorted(directions.values(), key=lambda row: (row["route_id"], row["direction_id"]))


def csv_text(rows: list[dict], columns: list[str]) -> str:
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue()


def build_payload(rows: list[dict], metadata: dict, network: dict) -> dict:
    crashes, quality = normalize_crashes(rows)
    if not crashes:
        raise ValueError("No usable crash records; retain previous data.")
    matches, directions = match_routes(crashes, network)
    return {"schema_version": 1, "status": "available", "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_url": SOURCE_URL, **metadata, "quality": quality,
            "geometry_as_of": network.get("meta", {}).get("feed_version"),
            "methodology": {"maximum_buffer_m": MAX_BUFFER_M, "projection": "Local equirectangular at 37.76°N; approximate metres",
                "match_columns": ["route_id", "direction_id", "crash_index", "distance_m"],
                "geometry": "All variants in the current GTFS catalog, not historical route alignments",
                "scope": "Reported injury/fatal crashes only; not all crashes or crashes involving Muni",
                "update": "Weekly check; official source publication can lag. Retain last valid data on failure."},
            "crashes": crashes, "matches": matches, "route_directions": directions}


def write_outputs(payload: dict, public_path: Path, package_path: Path) -> None:
    # 中文：CSV 包保留来源列。事故明细是唯一事故；匹配表允许同事故对应多条线路。
    # English: Export provenance with CSVs. Crash rows are unique; route matches intentionally overlap.
    crashes = payload["crashes"]
    crash_rows = [{**row, "source_url": SOURCE_URL} for row in crashes]
    matches = [{"route_id": route, "direction_id": direction, "crash_id": crashes[i]["crash_id"],
                "distance_m": distance, "source_url": SOURCE_URL} for route, direction, i, distance in payload["matches"]]
    package_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = package_path.with_suffix(".tmp")
    with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("feature7_traffic_crashes.csv", csv_text(crash_rows, list(crash_rows[0])))
        archive.writestr("feature7_route_crash_matches.csv", csv_text(matches, ["route_id", "direction_id", "crash_id", "distance_m", "source_url"]))
        archive.writestr("README.md", f"# Feature 7 Traffic Safety History / 交通事故历史\n\nSource / 来源: {SOURCE_URL}\nPulled / 抓取: {payload['generated_at']}\nCoverage / 覆盖: {payload['coverage_start']} to {payload['coverage_end']}\n\nRelate the two CSVs by crash_id. Use COUNTD(crash_id), not row counts after joining. Filter distance_m <= 100 or <= 200.\n两张表按 crash_id 建立关系。事故数使用 COUNTD(crash_id)，不要直接数 join 后的行。距离筛选 <=100 或 <=200 米。\n\nOnly reported injury/fatal crashes. Current GTFS alignments, not historic geometry. Counts are spatial context, not Muni involvement or individual risk. Latest year may be partial.\n仅已报告伤亡事故。使用当前 GTFS 走向，不是历史线路。数量仅为空间背景，不代表 Muni 涉事或个人风险。最新年份可能不完整。\n")
    temporary.replace(package_path)
    public_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = public_path.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary.replace(public_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--network", default=str(ROOT / "site/data/network.json"))
    parser.add_argument("--public-output", default=str(ROOT / "site/data/traffic-safety.json"))
    parser.add_argument("--package-output", default=str(ROOT / "site/data/tableau/feature7_traffic_safety.zip"))
    args = parser.parse_args()
    rows, metadata = fetch_crashes()
    previous_path = Path(args.public_output)
    if previous_path.exists():
        previous = json.loads(previous_path.read_text(encoding="utf-8"))
        if str(metadata["coverage_end"]) < str(previous.get("coverage_end", "")):
            raise ValueError("Upstream coverage regressed; retain the latest valid crash history.")
    payload = build_payload(rows, metadata, json.loads(Path(args.network).read_text(encoding="utf-8")))
    write_outputs(payload, Path(args.public_output), Path(args.package_output))
    print(json.dumps({**metadata, "unique_crashes": len(payload["crashes"]), "route_matches": len(payload["matches"])}))


if __name__ == "__main__":
    main()
