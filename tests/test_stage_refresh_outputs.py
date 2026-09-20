"""Regression coverage for publishing every file written by a data refresh."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STAGE_SCRIPT = ROOT / "scripts" / "stage_refresh_outputs.py"
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


def run_git(repository: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *arguments],
        cwd=repository,
        check=True,
        capture_output=True,
        text=True,
    )


def test_stage_refresh_outputs_leaves_no_generated_file_unstaged(tmp_path: Path) -> None:
    run_git(tmp_path, "init")
    run_git(tmp_path, "config", "user.name", "Test Bot")
    run_git(tmp_path, "config", "user.email", "test@example.com")

    for relative_path in REFRESH_OUTPUTS:
        output = tmp_path / relative_path
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("before\n", encoding="utf-8")
    run_git(tmp_path, "add", ".")
    run_git(tmp_path, "commit", "-m", "baseline")

    for relative_path in REFRESH_OUTPUTS:
        (tmp_path / relative_path).write_text("after\n", encoding="utf-8")

    result = subprocess.run(
        [sys.executable, str(STAGE_SCRIPT), "--root", str(tmp_path)],
        cwd=tmp_path,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0, result.stderr
    assert run_git(tmp_path, "diff", "--name-only").stdout == ""
    assert set(run_git(tmp_path, "diff", "--cached", "--name-only").stdout.splitlines()) == set(REFRESH_OUTPUTS)
