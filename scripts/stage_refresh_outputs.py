#!/usr/bin/env python3
"""Stage every repository file that the transit refresh can generate."""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


REFRESH_OUTPUTS = (
    "site/data/latest.json",
    "site/data/live-transit.json",
    "site/data/alerts-roads.json",
    "site/data/parking-context.json",
    "site/data/safety-context.json",
    "site/data/network.json",
    "site/data/refresh-health.json",
    "site/data/service-alert-history.json",
    "site/data/tableau/feature6_service_disruptions.csv",
    "data/parking-inventory.json",
    "data/static-index.json",
)


def stage_refresh_outputs(root: Path) -> None:
    existing_outputs = [relative_path for relative_path in REFRESH_OUTPUTS if (root / relative_path).is_file()]
    if not existing_outputs:
        raise RuntimeError(f"No refresh outputs exist under {root}")
    subprocess.run(
        ["git", "add", "--", *existing_outputs],
        cwd=root,
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repository root (defaults to this script's repository).",
    )
    arguments = parser.parse_args()
    stage_refresh_outputs(arguments.root.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
