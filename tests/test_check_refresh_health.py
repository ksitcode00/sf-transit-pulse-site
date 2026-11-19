import json
from datetime import datetime, timedelta, timezone

import pytest

from scripts import check_refresh_health


@pytest.mark.parametrize(("age", "strict_exit", "recovery"), [(0, 0, "false"), (30, 1, "true")])
def test_watchdog_can_route_stale_feed_to_recovery_as_a_normal_check(
    tmp_path, monkeypatch, age, strict_exit, recovery
):
    now = datetime.now(timezone.utc)
    snapshot = tmp_path / "latest.json"
    snapshot.write_text(json.dumps({"meta": {
        "generated_at": now.isoformat(),
        "source_status": {"transit": {"observed_at": (now - timedelta(minutes=age)).isoformat()}},
    }}))
    output = tmp_path / "github-output"
    monkeypatch.setattr(check_refresh_health, "SNAPSHOT_PATH", snapshot)
    monkeypatch.setenv("GITHUB_OUTPUT", str(output))

    monkeypatch.setattr("sys.argv", ["check_refresh_health.py", "--max-age-min", "7"])
    assert check_refresh_health.main() == strict_exit
    assert not output.exists()

    monkeypatch.setattr("sys.argv", ["check_refresh_health.py", "--max-age-min", "7", "--report-to-actions"])
    assert check_refresh_health.main() == 0
    assert output.read_text() == f"needs_recovery={recovery}\n"
