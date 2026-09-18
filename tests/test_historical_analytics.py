from __future__ import annotations

import json
import sys
from pathlib import Path

from scripts import build_historical_analytics


def write_csv(path: Path, header: str, rows: list[str]) -> None:
    path.write_text(header + "\n" + "\n".join(rows) + "\n", encoding="utf-8")


def test_public_history_is_recomputed_from_completed_trip_rows(
    tmp_path: Path, monkeypatch
) -> None:
    """A public rollup must not add pre-computed daily medians or P90 values."""
    source = tmp_path / "source"
    source.mkdir()
    write_csv(
        source / "routes.csv",
        "route_short_name,route_long_name",
        ["1,California"],
    )
    write_csv(
        source / "route_shapes.csv",
        "route_short_name,direction_id,path_id,point_sequence,latitude,longitude",
        ["1,0,shape-a,1,37.78,-122.42", "1,0,shape-a,2,37.79,-122.41"],
    )
    write_csv(
        source / "trip_performance.csv",
        "service_date,route_short_name,route_long_name,direction_id,actual_duration_min,end_delay_min,absolute_end_delay_min,late_trip_flag,scheduled_start_hour,weekday,weekday_order",
        [
            "2026-08-01,1,California,0,10,1,1,0,8,Friday,5",
            "2026-08-01,1,California,0,20,7,7,1,8,Friday,5",
        ],
    )
    output = tmp_path / "historical-analytics.json"
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "build_historical_analytics.py",
            "--input-dir",
            str(source),
            "--output",
            str(output),
            "--month",
            "2026-08",
        ],
    )

    assert build_historical_analytics.main() == 0
    payload = json.loads(output.read_text(encoding="utf-8"))
    summary = next(
        row
        for row in payload["reliability"]
        if row["route_short_name"] == "1" and row["direction_id"] == "0"
    )
    assert summary["trip_count"] == 2
    assert summary["travel_time_median_min"] == 15.0
    assert summary["median_absolute_delay_min"] == 4.0
    assert summary["late_trip_pct"] == 50.0
    assert payload["heatmap_columns"][-2:] == [
        "median_absolute_delay_min",
        "p90_absolute_delay_min",
    ]
    assert any(row[:4] == ["1", "0", 5, 8] for row in payload["heatmap"])
