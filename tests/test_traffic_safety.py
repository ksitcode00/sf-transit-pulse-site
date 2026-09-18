"""Feature 7: traffic crash provenance, deduplication, and segment matching."""
import json
import zipfile

import pytest

from scripts.prepare_traffic_safety import build_payload, match_routes, normalize_crashes, point_segment_distance, write_outputs


def raw(case="A", **kwargs):
    return {"case_id_pkey":case,"collision_date":"2026-01-01T00:00:00","tb_latitude":"37.76",
            "tb_longitude":"-122.45","collision_severity":"Injury (Severe)","number_killed":"0",
            "number_injured":"2","dph_col_grp_description":"Vehicle-Bicycle-Pedestrian", **kwargs}


def network():
    return {"routes":[{"route_id":"1"}],"patterns":{
        "variant0":{"route_id":"1","direction_id":"0","shape":[[37.76,-122.46],[37.76,-122.44]]},
        "variant1":{"route_id":"1","direction_id":"0","shape":[[37.761,-122.46],[37.761,-122.44]]},
        "direction1":{"route_id":"1","direction_id":"1","shape":[[37.76,-122.46],[37.76,-122.44]]}}}


def test_crashes_deduplicate_and_keep_severity_distinct_from_victims():
    rows, quality = normalize_crashes([raw(),raw(data_updated_at="2026-09-01",number_injured="3"),raw("B",tb_latitude="0")])
    assert len(rows)==1
    assert rows[0]["injured"]==3
    assert rows[0]["severity"]=="SEVERE"
    assert rows[0]["pedestrian"] and rows[0]["cyclist"]
    assert quality=={"excluded_row_count":1,"duplicate_row_count":1}


def test_exact_segment_distance_does_not_miss_midpoint():
    assert point_segment_distance((5,1),(0,0),(10,0))==1
    assert point_segment_distance((3,4),(0,0),(0,0))==5


def test_match_unions_variants_and_keeps_direction_grain():
    crashes,_=normalize_crashes([raw(),raw("B",tb_latitude="37.764")])
    matches,directions=match_routes(crashes,network())
    assert len(matches)==2
    assert {tuple(row[:3]) for row in matches}=={("1","0",0),("1","1",0)}
    assert all(row[3]==0 for row in matches)
    assert len(directions[0]["shapes"])==2


def test_empty_data_is_rejected_and_download_has_provenance(tmp_path):
    with pytest.raises(ValueError):
        build_payload([],{},network())
    payload=build_payload([raw()],{"coverage_start":"2022-01-01","coverage_end":"2026-07-31"},network())
    write_outputs(payload,tmp_path/"public.json",tmp_path/"tableau.zip")
    with zipfile.ZipFile(tmp_path/"tableau.zip") as archive:
        assert "source_url" in archive.read("feature7_traffic_crashes.csv").decode()
        assert "COUNTD(crash_id)" in archive.read("README.md").decode()
    assert len(json.loads((tmp_path/"public.json").read_text())["crashes"])==1
