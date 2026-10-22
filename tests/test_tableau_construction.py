from __future__ import annotations

import csv
import json
import sys
import time
import traceback
from pathlib import Path

import pytest
import requests

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


def source_response(status, payload=b'{"features":[{"id":"road-1"}]}'):
    response = requests.Response()
    response.status_code = status
    response.url = 'https://api.511.org/traffic/wzdx?api_key=test-private-key'
    response._content = payload
    response._content_consumed = True
    return response


def test_wzdx_recovers_from_502_without_turning_failure_into_empty_events(monkeypatch):
    calls, delays = [], []
    def get(url, **kwargs):
        calls.append((url, kwargs['params']))
        return source_response(502 if len(calls) == 1 else 200)
    monkeypatch.setenv('SF_TRANSIT_511_API_KEY', 'test-private-key')
    monkeypatch.setattr(requests, 'get', get)
    monkeypatch.setattr(time, 'sleep', delays.append)
    assert prepare_tableau_construction.wzdx_rows() == [{'id':'road-1'}]
    assert len(calls) == 2
    assert calls[0] == calls[1]
    assert delays == [5]


def test_wzdx_timeout_recovers_with_bounded_backoff(monkeypatch):
    calls, delays = [], []
    def get(url, **kwargs):
        calls.append(url)
        if len(calls) < 3:
            raise requests.exceptions.ReadTimeout('upstream stalled')
        return source_response(200)
    monkeypatch.setenv('SF_TRANSIT_511_API_KEY', 'test-private-key')
    monkeypatch.setattr(requests, 'get', get)
    monkeypatch.setattr(time, 'sleep', delays.append)
    assert prepare_tableau_construction.wzdx_rows() == [{'id':'road-1'}]
    assert len(calls) == 3
    assert delays == [5, 15]


@pytest.mark.parametrize('status', [401, 403, 429])
def test_wzdx_permission_and_quota_failures_are_not_retried_or_logged_with_key(monkeypatch, status):
    calls, delays = [], []
    def get(url, **kwargs):
        calls.append(url)
        return source_response(status)
    monkeypatch.setenv('SF_TRANSIT_511_API_KEY', 'test-private-key')
    monkeypatch.setattr(requests, 'get', get)
    monkeypatch.setattr(time, 'sleep', delays.append)
    with pytest.raises(RuntimeError) as failure:
        prepare_tableau_construction.wzdx_rows()
    assert str(status) in str(failure.value)
    assert len(calls) == 1
    assert delays == []
    assert 'test-private-key' not in ''.join(traceback.format_exception(failure.value))


def test_persistent_wzdx_failure_preserves_public_and_tableau_files(tmp_path, monkeypatch):
    network, closure, excavation = [tmp_path/name for name in ['network.json','closures.json','excavations.json']]
    write_json(network, {})
    write_json(closure, [])
    write_json(excavation, [])
    public = tmp_path/'public.json'; public.write_text('{"last_valid":true}')
    output = tmp_path/'tables'; output.mkdir()
    csv_file = output/'feature5_events_current.csv'; csv_file.write_text('previous valid rows')
    before = public.read_bytes(), csv_file.read_bytes()
    calls, delays = [], []
    def get(url, **kwargs):
        calls.append(url)
        return source_response(502)
    monkeypatch.setenv('SF_TRANSIT_511_API_KEY', 'test-private-key')
    monkeypatch.setattr(requests, 'get', get)
    monkeypatch.setattr(time, 'sleep', delays.append)
    monkeypatch.setattr(sys, 'argv', ['prepare_tableau_construction.py', '--output-dir', str(output),
        '--network-json', str(network), '--public-output', str(public), '--closures-file', str(closure),
        '--excavations-file', str(excavation)])
    with pytest.raises(RuntimeError) as failure:
        prepare_tableau_construction.main()
    assert len(calls) == 3
    assert delays == [5, 15]
    assert (public.read_bytes(), csv_file.read_bytes()) == before
    assert 'test-private-key' not in ''.join(traceback.format_exception(failure.value))


def test_datasf_temporary_failure_uses_same_retry_policy(monkeypatch):
    calls = []
    def get(url, **kwargs):
        calls.append(kwargs['params'])
        return source_response(503 if len(calls) == 1 else 200, b'[{"id":"permit-1"}]')
    monkeypatch.setattr(requests, 'get', get)
    monkeypatch.setenv('SF_TRANSIT_DATASF_APP_TOKEN', '')
    monkeypatch.setattr(time, 'sleep', lambda _: None)
    assert prepare_tableau_construction.datasf_rows('8x25-yybr', 'SELECT * LIMIT 5000') == [{'id':'permit-1'}]
    assert calls == [{'$query':'SELECT * LIMIT 5000 OFFSET 0'}] * 2


@pytest.mark.parametrize('payload, expected', [(b'{"features":[]}', []), (b'{}', None)])
def test_successful_empty_feed_and_unrecognized_schema_are_not_confused(monkeypatch, payload, expected):
    monkeypatch.setenv('SF_TRANSIT_511_API_KEY', 'test-private-key')
    monkeypatch.setattr(requests, 'get', lambda *args, **kwargs: source_response(200, payload))
    if expected is None:
        with pytest.raises(ValueError, match='recognized row collection'):
            prepare_tableau_construction.wzdx_rows()
    else:
        assert prepare_tableau_construction.wzdx_rows() == []
