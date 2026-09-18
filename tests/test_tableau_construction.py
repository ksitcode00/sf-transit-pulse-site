from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

from scripts import prepare_tableau_construction


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value), encoding="utf-8")


def test_feature5_exports_sources_and_spatial_exposure(tmp_path: Path, monkeypatch) -> None:
    network = tmp_path / "network.json"
    closures = tmp_path / "closures.json"
    excavations = tmp_path / "excavations.json"
    wzdx = tmp_path / "wzdx.json"
    output = tmp_path / "output"
    public_output = tmp_path / "construction-exposure.json"
    write_json(network, {
        "routes": [{"route_id": "1", "route_short_name": "1", "route_long_name": "CALIFORNIA"}],
        "route_directions": {"1|0": {"route_id": "1", "direction_id": "0", "direction_label": "Outbound", "shape": [[37.78, -122.42], [37.79, -122.41]]}},
    })
    write_json(closures, [{"objectid": "closure-1", "type": "Construction", "status": "Permitted", "street": "Test Street", "start_dt": "2026-09-18T08:00:00", "end_dt": "2026-09-18T16:00:00", "shape": {"type": "Point", "coordinates": [-122.42, 37.78]}}])
    write_json(excavations, [{"permit_number": "exc-1", "permit_purpose": "Utility work", "status": "Approved", "latitude": "37.781", "longitude": "-122.421"}])
    write_json(wzdx, {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-122.42, 37.78], [-122.419, 37.781]]}, "properties": {"id": "wzdx-1", "work_zone_type": "roadway", "status": "active"}}]})
    monkeypatch.setattr(sys, "argv", [
        "prepare_tableau_construction.py", "--output-dir", str(output), "--network-json", str(network), "--public-output", str(public_output),
        "--snapshot-date", "2026-09-18", "--closures-file", str(closures),
        "--excavations-file", str(excavations), "--wzdx-file", str(wzdx),
    ])

    assert prepare_tableau_construction.main() == 0
    with (output / "feature5_events_current.csv").open(encoding="utf-8") as handle:
        events = list(csv.DictReader(handle))
    with (output / "feature5_route_exposure_current.csv").open(encoding="utf-8") as handle:
        exposure = list(csv.DictReader(handle))
    assert {row["source"] for row in events} == {"SFMTA_TEMPORARY_CLOSURE", "DATASF_UTILITY_EXCAVATION", "511_WZDX"}
    assert all(row["snapshot_date"] == "2026-09-18" for row in events)
    assert {row["evidence_type"] for row in events} == {"PERMITTED_CLOSURE", "EXCAVATION_PERMIT", "WORK_ZONE"}
    assert any(row["route_short_name"] == "1" and row["exposure_level"] == "DIRECT_OVERLAP" for row in exposure)
    assert (output / "feature5_route_shapes.csv").exists()
    assert (output / "feature5_data_dictionary.csv").exists()
    public = json.loads(public_output.read_text(encoding="utf-8"))
    assert public["status"] == "available"
    assert public["direct_overlap_meters"] == 80
    assert public["route_directions"]["1|0"]["shape"]
    assert public["events"]
    assert any(match[3] == "DIRECT_OVERLAP" for match in public["matches"])
