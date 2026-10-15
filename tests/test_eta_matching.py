"""Regional historical IDs differ from agency realtime IDs; never guess a trip."""
import json

import duckdb
import pytest

from scripts.build_eta_accuracy import build_outputs


def match_inputs(tmp_path, *, date='2026-09-16', direction='0', sequence=5, agency='SF', versions=('20260930',)):
    predictions = tmp_path/'predictions'; predictions.mkdir()
    actuals = tmp_path/'actuals.parquet'
    c = duckdb.connect()
    c.execute('''CREATE TABLE predictions AS SELECT
        '2026-09-16' AS service_date, '30' AS route_id, '30' AS route_short_name,
        '0' AS direction_id, '12152653_M11' AS trip_id, '13837' AS stop_id,
        5 AS stop_sequence, 'Example stop' AS stop_name,
        '2026-09-16T15:00:00Z' AS snapshot_time,
        '2026-09-16T14:59:30Z' AS feed_timestamp,
        '2026-09-16T15:08:00Z' AS predicted_arrival_time,
        '' AS predicted_departure_time, 'commit-a' AS source_commit''')
    c.execute(f"COPY predictions TO '{predictions/'eta_snapshots_raw_2026-09-16.parquet'}' (FORMAT PARQUET)")
    c.execute('''CREATE TABLE actuals(service_date VARCHAR,route_id VARCHAR,route_short_name VARCHAR,
        direction_id VARCHAR,trip_id VARCHAR,stop_id VARCHAR,stop_sequence INTEGER,actual_arrival_time VARCHAR)''')
    for version in versions:
        c.execute('INSERT INTO actuals VALUES (?,?,?,?,?,?,?,?)',
            [date,f'{agency}:30','30',direction,f'{agency}:12152653_M11:{version}',
             '13837',sequence,'2026-09-16T15:10:00Z'])
    c.execute(f"COPY actuals TO '{actuals}' (FORMAT PARQUET)")
    c.close()
    return predictions, actuals


def test_regional_trip_version_matches_the_exact_agency_trip_and_retains_raw_id(tmp_path):
    predictions, actuals = match_inputs(tmp_path)
    public = tmp_path/'public.json'
    metrics = build_outputs(predictions, actuals, tmp_path/'output', tmp_path/'work', public)
    assert metrics['matched_prediction_rows'] == 1
    c = duckdb.connect()
    rows = c.execute(f"SELECT trip_id,historical_trip_id,prediction_error_min FROM read_parquet('{tmp_path/'output/eta_accuracy.parquet'}')").fetchall()
    c.close()
    assert rows == [('12152653_M11','SF:12152653_M11:20260930',-2.0)]
    assert json.loads(public.read_text())['status'] == 'available'


@pytest.mark.parametrize('changes', [
    {'date':'2026-09-17'}, {'direction':'1'}, {'sequence':6}, {'agency':'BA'},
])
def test_namespace_conversion_never_relaxes_date_stop_sequence_direction_or_agency(tmp_path, changes):
    predictions, actuals = match_inputs(tmp_path, **changes)
    with pytest.raises(RuntimeError, match='No predictions matched'):
        build_outputs(predictions, actuals, tmp_path/'output', tmp_path/'work')


def test_ambiguous_historical_versions_cannot_silently_choose_an_arrival(tmp_path):
    predictions, actuals = match_inputs(tmp_path, versions=('20260901','20260930'))
    public = tmp_path/'public.json'
    public.write_text('{"status":"available","previous_release":true}')
    before = public.read_bytes()
    with pytest.raises(RuntimeError, match='Ambiguous historical trip'):
        build_outputs(predictions, actuals, tmp_path/'output', tmp_path/'work', public)
    assert public.read_bytes() == before
