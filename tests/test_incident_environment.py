"""Feature 8: report identity, multi-category preservation and approximate stop buffers."""
import json
import time
import zipfile
import pytest
import requests
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
        if 'count(' in q:return [{"n":"2","geocoded":"2","longitude_rows":"2"}]
        return [row()]
    monkeypatch.setattr(pipeline,'query_rows',query)
    with pytest.raises(ValueError,match="Incomplete incident download"):
        fetch_incidents()


def test_datasf_page_recovers_after_read_timeout(monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    attempts = []

    def get(url, **kwargs):
        attempts.append(kwargs["params"]["pageNumber"])
        if len(attempts) == 1:
            raise requests.exceptions.ReadTimeout("DataSF stalled")
        response = requests.Response()
        response.status_code = 200
        response._content = b'[{"incident_id":"A"}]'
        return response

    monkeypatch.setattr(pipeline.requests, "get", get)
    monkeypatch.setattr(time, "sleep", lambda seconds: None)
    assert pipeline.query_rows("SELECT incident_id", page=3) == [{"incident_id":"A"}]
    assert attempts == [3, 3]


def test_datasf_page_recovers_after_transient_server_error(monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    attempts = []

    def get(url, **kwargs):
        attempts.append(kwargs["params"]["pageNumber"])
        response = requests.Response()
        response.status_code = 503 if len(attempts) == 1 else 200
        response._content = b'[{"incident_id":"A"}]'
        return response

    monkeypatch.setattr(pipeline.requests, "get", get)
    monkeypatch.setattr(time, "sleep", lambda seconds: None)
    assert pipeline.query_rows("SELECT incident_id", page=2) == [{"incident_id":"A"}]
    assert attempts == [2, 2]


def test_datasf_page_stops_after_bounded_timeouts(monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    attempts = []

    def get(url, **kwargs):
        attempts.append(kwargs["params"]["pageNumber"])
        raise requests.exceptions.ReadTimeout("DataSF stalled")

    monkeypatch.setattr(pipeline.requests, "get", get)
    monkeypatch.setattr(time, "sleep", lambda seconds: None)
    with pytest.raises(requests.exceptions.ReadTimeout):
        pipeline.query_rows("SELECT incident_id", page=4)
    assert attempts == [4, 4, 4]


def test_download_preserves_identity_and_sf_local_time(tmp_path):
    payload=build_payload([row(),row(category="Assault")],{"coverage_start":"2025-09-17","coverage_end":"2026-09-16"},network())
    write_outputs(payload,tmp_path/'public.json',tmp_path/'download.zip')
    assert len(json.loads((tmp_path/'public.json').read_text())["incidents"])==1
    with zipfile.ZipFile(tmp_path/'download.zip') as package:
        assert '2026-09-01T18:00' in package.read('feature8_incidents.csv').decode()
        assert 'Assault' in package.read('feature8_incident_categories.csv').decode()


def prepare_release(tmp_path, monkeypatch, count=4):
    from scripts import prepare_incident_environment as pipeline
    monkeypatch.setattr(pipeline, 'ROOT', tmp_path)
    public = tmp_path/'site/data/incident-environment.json'
    package = tmp_path/'site/data/tableau/feature8_incident_environment.zip'
    payload = build_payload([row(str(i)) for i in range(count)],
                            {'coverage_start':'2025-09-02','coverage_end':'2026-09-01'}, network())
    write_outputs(payload, public, package)
    (public.parent/'network.json').write_text(json.dumps(network()))
    return pipeline, public, package


def test_missing_source_coordinates_preserve_release_and_publish_degraded_health(tmp_path, monkeypatch):
    pipeline, public, package = prepare_release(tmp_path, monkeypatch)
    before = (public.read_bytes(), package.read_bytes())
    unlocated = row(); unlocated.pop('latitude'); unlocated.pop('longitude')
    monkeypatch.setattr(pipeline, 'fetch_incidents', lambda: ([unlocated],
        {'coverage_start':'2025-09-03','coverage_end':'2026-09-02','source_row_count':1}))
    pipeline.main()
    assert (public.read_bytes(), package.read_bytes()) == before
    health = json.loads((public.parent/'incident-environment-health.json').read_text())
    assert health['status'] == 'DEGRADED'
    assert health['reason'] == 'MISSING_COORDINATES'
    assert health['last_successful_at'] == json.loads(before[0])['generated_at']
    assert health['retained_coverage_end'] == '2026-09-01'


def test_source_recovery_replaces_release_and_clears_degradation(tmp_path, monkeypatch):
    pipeline, public, package = prepare_release(tmp_path, monkeypatch)
    (public.parent/'incident-environment-health.json').write_text('{"status":"DEGRADED"}')
    monkeypatch.setattr(pipeline, 'fetch_incidents', lambda: ([row(str(i)) for i in range(4)],
        {'coverage_start':'2025-09-03','coverage_end':'2026-09-02','source_row_count':4}))
    pipeline.main()
    assert json.loads(public.read_text())['coverage_end'] == '2026-09-02'
    health = json.loads((public.parent/'incident-environment-health.json').read_text())
    assert health['status'] == 'HEALTHY'
    assert health['reason'] is None
    assert health['last_successful_at'] == json.loads(public.read_text())['generated_at']
    with zipfile.ZipFile(package) as archive:
        assert '2026-09-02' in archive.read('README.md').decode()


def test_abrupt_nonempty_source_collapse_does_not_replace_full_history(tmp_path, monkeypatch):
    pipeline, public, package = prepare_release(tmp_path, monkeypatch, count=8)
    before = public.read_bytes(), package.read_bytes()
    monkeypatch.setattr(pipeline, 'fetch_incidents', lambda: ([row()],
        {'coverage_start':'2025-09-03','coverage_end':'2026-09-02','source_row_count':1}))
    pipeline.main()
    assert (public.read_bytes(), package.read_bytes()) == before
    health = json.loads((public.parent/'incident-environment-health.json').read_text())
    assert health['reason'] == 'HISTORY_COLLAPSE'


def test_initial_build_with_no_valid_source_remains_a_failure(tmp_path, monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    monkeypatch.setattr(pipeline, 'ROOT', tmp_path)
    folder = tmp_path/'site/data'; folder.mkdir(parents=True)
    (folder/'network.json').write_text(json.dumps(network()))
    monkeypatch.setattr(pipeline, 'fetch_incidents', lambda: ([], {'coverage_end':'2026-09-02'}))
    with pytest.raises(ValueError):
        pipeline.main()
    assert not (folder/'incident-environment.json').exists()


def test_stop_catalog_bug_is_not_disguised_as_upstream_degradation(tmp_path, monkeypatch):
    pipeline, public, _ = prepare_release(tmp_path, monkeypatch)
    (public.parent/'network.json').write_text('{}')
    monkeypatch.setattr(pipeline, 'fetch_incidents', lambda: ([row(str(i)) for i in range(4)],
        {'coverage_start':'2025-09-03','coverage_end':'2026-09-02','source_row_count':4}))
    with pytest.raises(ValueError, match='GTFS stop catalog'):
        pipeline.main()


def test_zero_geocoded_source_is_rejected_before_downloading_pages(monkeypatch):
    from scripts import prepare_incident_environment as pipeline
    def query(q, page=1, size=5000):
        if 'max(' in q: return [{'latest':'2026-09-02T10:00:00'}]
        if 'count(' in q: return [{'n':'3366','geocoded':'0','longitude_rows':'0'}]
        pytest.fail('An unlocated source must not download detail pages')
    monkeypatch.setattr(pipeline, 'query_rows', query)
    with pytest.raises(ValueError, match='coordinates'):
        fetch_incidents()


@pytest.mark.parametrize('response', [[], [{'latest':None}], [{}]])
def test_empty_official_source_is_a_recognized_data_problem(monkeypatch, response):
    from scripts import prepare_incident_environment as pipeline
    monkeypatch.setattr(pipeline, 'query_rows', lambda *args, **kwargs: response)
    with pytest.raises(pipeline.SourceDataUnavailable) as failure:
        fetch_incidents()
    assert failure.value.reason == 'NO_USABLE_HISTORY'
