"""Feature 8: report identity, multi-category preservation and approximate stop buffers."""
import json
import zipfile
import pytest
from scripts.prepare_incident_environment import normalize_incidents, build_payload, write_outputs, fetch_incidents


def row(incident="A", category="Larceny Theft", **extra):
    return {"incident_id":incident,"row_id":incident+category,"incident_datetime":"2026-09-01T18:00:00",
            "incident_category":category,"latitude":"37.76","longitude":"-122.45",**extra}


def network():
    return {"routes":[{"route_id":"30","route_short_name":"30"}],"patterns":{
        "out":{"route_id":"30","direction_id":"0","stops":[{"stop_id":"S","name":"Test stop","lat":37.76,"lon":-122.45}]},
        "in":{"route_id":"30","direction_id":"1","stops":[{"stop_id":"S","name":"Test stop","lat":37.76,"lon":-122.45},{"stop_id":"T","name":"Second stop","lat":37.7605,"lon":-122.45}]}}}


def test_multiple_offense_rows_count_as_one_report_with_all_categories():
    incidents,quality=normalize_incidents([row(),row(category="Assault"),row(),row("B",latitude="0")])
    assert len(incidents)==1
    assert incidents[0]["categories"]==["Assault","Larceny Theft"]
    assert quality["excluded_row_count"]==1
    assert quality["merged_row_count"]==2


def test_report_coordinates_keep_latest_report_version_without_mixing_locations():
    incidents,_=normalize_incidents([row(report_datetime="2026-09-01",latitude="37.761"),row(category="Assault",report_datetime="2026-09-02")])
    assert len(incidents)==1
    assert incidents[0]["lat"]==37.76
    assert incidents[0]["datetime"]=="2026-09-01T18:00:00"


def test_stop_variant_overlap_preserves_single_report_and_stop_identity():
    payload=build_payload([row(),row(category="Assault")],{"coverage_start":"2025-09-17","coverage_end":"2026-09-16"},network())
    assert len(payload.get("incidents",[]))==1
    assert len(payload["stops"])==2
    assert len(payload["matches"])==2
    assert payload["matches"][0]==[0,0,0.0]
    assert payload["incidents"][0][3]==[0,1]


def test_empty_history_never_replaces_a_valid_release():
    with pytest.raises(ValueError,match="No usable incident"):
        build_payload([],{},network())


def test_incomplete_pagination_is_rejected(monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    def query(q,page=1,size=5000):
        if 'max(' in q:return [{"latest":"2026-09-16T23:53:00"}]
        if 'count(' in q:return [{"n":"2"}]
        return [row()]
    monkeypatch.setattr(pipeline,'query_rows',query)
    with pytest.raises(ValueError,match="Incomplete incident download"):
        fetch_incidents()


def test_download_preserves_identity_and_sf_local_time(tmp_path):
    payload=build_payload([row(),row(category="Assault")],{"coverage_start":"2025-09-17","coverage_end":"2026-09-16"},network())
    write_outputs(payload,tmp_path/'public.json',tmp_path/'download.zip')
    assert len(json.loads((tmp_path/'public.json').read_text())["incidents"])==1
    with zipfile.ZipFile(tmp_path/'download.zip') as package:
        assert '2026-09-01T18:00' in package.read('feature8_incidents.csv').decode()
        assert 'Assault' in package.read('feature8_incident_categories.csv').decode()
