"""DataSF public reads must not depend on an optional v3 application token."""
import json

import pytest
import requests

from scripts import prepare_tableau_construction as construction
from scripts import prepare_incident_environment as incidents
from scripts import prepare_traffic_safety as crashes


@pytest.mark.parametrize('reader', ['construction','incidents','crashes'])
def test_anonymous_reader_uses_public_endpoint_and_a_bounded_soql_query(monkeypatch, reader):
    calls = []
    def get(url, **kwargs):
        calls.append((url, kwargs))
        response = requests.Response(); response.status_code = 200
        response._content = b'[{"id":"A"}]'; response._content_consumed = True
        return response
    monkeypatch.setenv('SF_TRANSIT_DATASF_APP_TOKEN', '')
    monkeypatch.setattr(requests, 'get', get)
    if reader == 'construction':
        result = construction.datasf_rows('8x25-yybr', 'SELECT * LIMIT 5000')
        dataset, query = '8x25-yybr', 'SELECT * LIMIT 5000 OFFSET 0'
    elif reader == 'incidents':
        result = incidents.query_rows('SELECT row_id ORDER BY row_id', page=2, size=5)
        dataset, query = 'wg3w-h783', 'SELECT row_id ORDER BY row_id LIMIT 5 OFFSET 5'
    else:
        result = crashes.query_rows('SELECT case_id_pkey ORDER BY case_id_pkey', page=3, size=5)
        dataset, query = 'ubvf-ztfx', 'SELECT case_id_pkey ORDER BY case_id_pkey LIMIT 5 OFFSET 10'
    assert result == [{'id':'A'}]
    assert calls[0][0] == f'https://data.sf.gov/resource/{dataset}.json'
    assert calls[0][1]['params'] == {'$query':query}
    assert not calls[0][1].get('headers')


def test_authenticated_reader_keeps_token_out_of_url_and_query(monkeypatch):
    calls = []
    def get(url, **kwargs):
        calls.append((url, kwargs))
        response = requests.Response(); response.status_code = 200
        response._content = b'[]'; response._content_consumed = True
        return response
    monkeypatch.setenv('SF_TRANSIT_DATASF_APP_TOKEN', 'private-test-token')
    monkeypatch.setattr(requests, 'get', get)
    assert incidents.query_rows('SELECT row_id', page=2, size=5) == []
    url, options = calls[0]
    assert url == 'https://data.sf.gov/api/v3/views/wg3w-h783/query.json'
    assert options['params'] == {'query':'SELECT row_id','pageNumber':2,'pageSize':5}
    assert options['headers'] == {'X-App-Token':'private-test-token'}
    assert 'private-test-token' not in url + json.dumps(options['params'])


def test_public_parking_reader_advances_pages_without_exceeding_total_limit(monkeypatch):
    from scripts import refresh_data as refresh
    queries = []
    def request(url, **kwargs):
        assert url == 'https://data.sf.gov/resource/8vzz-qzz9.json'
        query = kwargs['params']['$query']; queries.append(query)
        rows = [{'parking_space_id':str(i)} for i in ([1,2] if len(queries)==1 else [3])]
        response = requests.Response(); response.status_code = 200
        response._content = json.dumps(rows).encode(); response._content_consumed = True
        return response
    monkeypatch.setenv('SF_TRANSIT_DATASF_APP_TOKEN', '')
    monkeypatch.setattr(refresh, 'request', request)
    result = refresh.datasf_records('8vzz-qzz9', 'SELECT parking_space_id ORDER BY parking_space_id LIMIT 3', 2, max_pages=3)
    assert [row['parking_space_id'] for row in result] == ['1','2','3']
    assert queries == ['SELECT parking_space_id ORDER BY parking_space_id LIMIT 2 OFFSET 0',
                       'SELECT parking_space_id ORDER BY parking_space_id LIMIT 1 OFFSET 2']
