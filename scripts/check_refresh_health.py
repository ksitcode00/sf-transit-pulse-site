#!/usr/bin/env python3
"""Check whether the public transit snapshot is current enough to trust."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "site" / "data" / "latest.json"


def parse_time(value: object) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-age-min", type=float, default=12)
    args = parser.parse_args()
    payload = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    generated = parse_time(payload.get("meta", {}).get("generated_at"))
    observed = parse_time(
        payload.get("meta", {}).get("source_status", {}).get("transit", {}).get("observed_at")
    )
    now = datetime.now(timezone.utc)
    generated_age = (now - generated).total_seconds() / 60 if generated else float("inf")
    observed_age = (now - observed).total_seconds() / 60 if observed else float("inf")
    result = {
        "status": "healthy" if max(generated_age, observed_age) <= args.max_age_min else "stale",
        "generated_age_min": round(generated_age, 1),
        "transit_observed_age_min": round(observed_age, 1),
        "max_age_min": args.max_age_min,
    }
    print(json.dumps(result))
    return 0 if result["status"] == "healthy" else 1


if __name__ == "__main__":
    raise SystemExit(main())
