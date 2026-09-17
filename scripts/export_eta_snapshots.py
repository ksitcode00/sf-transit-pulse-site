#!/usr/bin/env python3
"""Export a controlled ETA prediction experiment from repository history.

The production refresh already calls the 511 Trip Updates endpoint and commits
the credential-free ``site/data/live-transit.json`` snapshot. This exporter
reuses those versions, so collecting Tableau ETA history adds zero 511 calls.

The portfolio experiment deliberately keeps only routes 1, 8, 30, and 45 and
predictions no more than 30 minutes ahead. This bounded sample is enough to
compare ETA accuracy without retaining every SFMTA prediction indefinitely.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
LIVE_TRANSIT_PATH = "site/data/live-transit.json"
NETWORK_PATH = ROOT / "site" / "data" / "network.json"
SF_TIMEZONE = ZoneInfo("America/Los_Angeles")
SELECTED_ROUTE_SHORT_NAMES = frozenset({"1", "8", "30", "45"})
MAX_PREDICTION_HORIZON_MINUTES = 30
PARQUET_FIELDS = [
    "service_date",
    "route_id",
    "route_short_name",
    "direction_id",
    "trip_id",
    "stop_id",
    "stop_sequence",
    "stop_name",
    "snapshot_time",
    "feed_timestamp",
    "predicted_arrival_time",
    "predicted_departure_time",
    "source_commit",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export Tableau-ready ETA prediction snapshots from Git history."
    )
    parser.add_argument(
        "--service-date",
        help="San Francisco service date in YYYY-MM-DD. Defaults to yesterday.",
    )
    parser.add_argument("--since", help="Custom inclusive ISO date/time boundary.")
    parser.add_argument("--until", help="Custom exclusive ISO date/time boundary.")
    parser.add_argument("--output-dir", default="eta-output")
    return parser.parse_args()


def iso_utc(epoch: int | float | None) -> str:
    if not epoch:
        return ""
    return datetime.fromtimestamp(int(epoch), tz=timezone.utc).isoformat()


def parse_iso_boundary(value: str, *, end: bool = False) -> datetime:
    if len(value) == 10:
        day = date.fromisoformat(value)
        if end:
            day += timedelta(days=1)
        return datetime.combine(day, time.min, tzinfo=SF_TIMEZONE).astimezone(timezone.utc)
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=SF_TIMEZONE)
    return parsed.astimezone(timezone.utc)


def resolve_window(args: argparse.Namespace) -> tuple[datetime, datetime, str]:
    if args.service_date and (args.since or args.until):
        raise ValueError("Use --service-date or --since/--until, not both.")
    if args.since or args.until:
        if not args.since or not args.until:
            raise ValueError("Custom windows require both --since and --until.")
        since = parse_iso_boundary(args.since)
        until = parse_iso_boundary(args.until)
        label = f"{since:%Y%m%dT%H%M%SZ}-{until:%Y%m%dT%H%M%SZ}"
    else:
        service_day = (
            date.fromisoformat(args.service_date)
            if args.service_date
            else datetime.now(SF_TIMEZONE).date() - timedelta(days=1)
        )
        since = datetime.combine(service_day, time.min, tzinfo=SF_TIMEZONE).astimezone(timezone.utc)
        until = datetime.combine(
            service_day + timedelta(days=1), time.min, tzinfo=SF_TIMEZONE
        ).astimezone(timezone.utc)
        label = service_day.isoformat()
    if since >= until:
        raise ValueError("The export start must be before the end.")
    return since, until, label


def run_git(arguments: list[str]) -> str:
    completed = subprocess.run(
        ["git", *arguments],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout


def snapshot_commits(since: datetime, until: datetime) -> list[tuple[str, str]]:
    output = run_git(
        [
            "log",
            "--reverse",
            "--format=%H%x09%cI",
            f"--since={since.isoformat()}",
            f"--until={until.isoformat()}",
            "--",
            LIVE_TRANSIT_PATH,
        ]
    )
    rows: list[tuple[str, str]] = []
    for line in output.splitlines():
        if not line.strip():
            continue
        commit_hash, committed_at = line.split("\t", 1)
        rows.append((commit_hash, committed_at))
    return rows


def load_snapshot(commit_hash: str) -> dict[str, Any]:
    return json.loads(run_git(["show", f"{commit_hash}:{LIVE_TRANSIT_PATH}"]))


def build_network_lookups(network: dict[str, Any]) -> tuple[dict[str, str], dict[str, str]]:
    route_names = {
        str(row.get("route_id", "")): str(row.get("route_short_name") or row.get("route_id") or "")
        for row in network.get("routes", [])
        if row.get("route_id")
    }
    stop_names: dict[str, str] = {}
    patterns = network.get("patterns", {})
    pattern_rows: Iterable[dict[str, Any]] = (
        patterns.values() if isinstance(patterns, dict) else patterns
    )
    for pattern in pattern_rows:
        for stop in pattern.get("stops", []):
            stop_id = str(stop.get("stop_id") or "")
            if stop_id and stop_id not in stop_names:
                stop_names[stop_id] = str(stop.get("name") or stop_id)
    return route_names, stop_names


def normalized_service_date(raw: Any, event_epoch: int) -> str:
    value = str(raw or "").strip()
    if len(value) == 8 and value.isdigit():
        return f"{value[:4]}-{value[4:6]}-{value[6:]}"
    try:
        return date.fromisoformat(value).isoformat()
    except ValueError:
        return datetime.fromtimestamp(event_epoch, tz=SF_TIMEZONE).date().isoformat()


def flatten_snapshot(
    snapshot: dict[str, Any],
    source_commit: str,
    route_names: dict[str, str],
    stop_names: dict[str, str],
    selected_route_short_names: frozenset[str] = SELECTED_ROUTE_SHORT_NAMES,
    max_prediction_horizon_minutes: int = MAX_PREDICTION_HORIZON_MINUTES,
) -> list[dict[str, Any]]:
    snapshot_time = str(snapshot.get("meta", {}).get("generated_at") or "")
    if not snapshot_time:
        return []
    snapshot_dt = datetime.fromisoformat(snapshot_time.replace("Z", "+00:00"))
    if snapshot_dt.tzinfo is None:
        snapshot_dt = snapshot_dt.replace(tzinfo=timezone.utc)
    snapshot_epoch = int(snapshot_dt.timestamp())
    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str, int]] = set()
    latest_allowed_epoch = snapshot_epoch + max_prediction_horizon_minutes * 60
    for trip in snapshot.get("trip_predictions", []):
        trip_id = str(trip.get("trip_id") or "")
        route_id = str(trip.get("route_id") or "")
        if not trip_id or not route_id:
            continue
        route_short_name = route_names.get(route_id, route_id)
        if route_short_name not in selected_route_short_names:
            continue
        feed_timestamp = iso_utc(trip.get("update_timestamp"))
        for stop in trip.get("stops", []):
            stop_id = str(stop.get("stop_id") or "")
            stop_sequence = int(stop.get("stop_sequence") or 0)
            arrival_epoch = int(stop.get("arrival_time") or 0)
            departure_epoch = int(stop.get("departure_time") or 0)
            event_epoch = arrival_epoch or departure_epoch
            if (
                not stop_id
                or not event_epoch
                or event_epoch <= snapshot_epoch
                or event_epoch > latest_allowed_epoch
            ):
                continue
            key = (trip_id, stop_id, source_commit, stop_sequence)
            if key in seen:
                continue
            seen.add(key)
            rows.append(
                {
                    "service_date": normalized_service_date(
                        trip.get("service_date"), event_epoch
                    ),
                    "route_id": route_id,
                    "route_short_name": route_short_name,
                    "direction_id": str(trip.get("direction_id") or ""),
                    "trip_id": trip_id,
                    "stop_id": stop_id,
                    "stop_sequence": stop_sequence,
                    "stop_name": stop_names.get(stop_id, stop_id),
                    "snapshot_time": snapshot_dt.astimezone(timezone.utc).isoformat(),
                    "feed_timestamp": feed_timestamp,
                    "predicted_arrival_time": iso_utc(arrival_epoch),
                    "predicted_departure_time": iso_utc(departure_epoch),
                    "source_commit": source_commit,
                }
            )
    return rows


def main() -> int:
    args = parse_args()
    try:
        since, until, label = resolve_window(args)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    network = json.loads(NETWORK_PATH.read_text(encoding="utf-8"))
    route_names, stop_names = build_network_lookups(network)
    commits = snapshot_commits(since, until)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"eta_snapshots_raw_{label}.parquet"
    manifest_path = output_dir / f"eta_snapshots_manifest_{label}.json"

    try:
        import pyarrow as pa
        import pyarrow.parquet as pq
    except ImportError:
        print(
            "Parquet export requires pyarrow. Install it with: python -m pip install pyarrow",
            file=sys.stderr,
        )
        return 2

    parquet_schema = pa.schema(
        [
            pa.field(field, pa.int64() if field == "stop_sequence" else pa.string())
            for field in PARQUET_FIELDS
        ]
    )

    snapshot_count = 0
    prediction_count = 0
    duplicate_snapshot_count = 0
    seen_snapshot_times: set[str] = set()
    with pq.ParquetWriter(output_path, parquet_schema, compression="zstd") as writer:
        for commit_hash, _committed_at in commits:
            snapshot = load_snapshot(commit_hash)
            snapshot_time = str(snapshot.get("meta", {}).get("generated_at") or "")
            if not snapshot_time or snapshot_time in seen_snapshot_times:
                duplicate_snapshot_count += 1
                continue
            seen_snapshot_times.add(snapshot_time)
            rows = flatten_snapshot(snapshot, commit_hash, route_names, stop_names)
            if not rows:
                continue
            writer.write_table(pa.Table.from_pylist(rows, schema=parquet_schema))
            snapshot_count += 1
            prediction_count += len(rows)

    manifest = {
        "window_start": since.isoformat(),
        "window_end_exclusive": until.isoformat(),
        "source_file": LIVE_TRANSIT_PATH,
        "api_requests_added": 0,
        "selected_route_short_names": sorted(SELECTED_ROUTE_SHORT_NAMES),
        "max_prediction_horizon_minutes": MAX_PREDICTION_HORIZON_MINUTES,
        "commits_examined": len(commits),
        "snapshots_exported": snapshot_count,
        "duplicate_snapshots_skipped": duplicate_snapshot_count,
        "prediction_rows": prediction_count,
        "parquet": output_path.name,
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(manifest, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
