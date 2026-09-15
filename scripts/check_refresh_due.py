#!/usr/bin/env python3
"""Skip duplicate automation runs that would spend the same 511 quota twice."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "site" / "data" / "live-transit.json"


def generated_age_seconds(now: datetime | None = None) -> float:
    """Return infinity when the public snapshot cannot prove a recent refresh."""

    try:
        payload = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
        raw = payload.get("meta", {}).get("generated_at")
        generated = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        if generated.tzinfo is None:
            generated = generated.replace(tzinfo=timezone.utc)
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return float("inf")
    current = now or datetime.now(timezone.utc)
    return max(0, (current - generated).total_seconds())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--minimum-age-seconds", type=float, default=120)
    args = parser.parse_args()
    age = generated_age_seconds()
    due = age >= args.minimum_age_seconds
    print(json.dumps({"due": due, "generated_age_seconds": round(age, 1)}))
    return 0 if due else 1


if __name__ == "__main__":
    raise SystemExit(main())
