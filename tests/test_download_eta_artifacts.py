"""Exercise real HTTP redirects: GitHub credentials belong only at the API origin."""
import io
import json
import threading
import time
import urllib.error
import zipfile
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

import pytest

from scripts import download_eta_artifacts as downloader


@contextmanager
def artifact_servers(*, expired_links=0, api_status=302, storage_status=200):
    state = {'api_requests': [], 'storage_auth': []}
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as bundle:
        bundle.writestr('eta_snapshots_raw_2026-09-16.parquet', b'PAR1fixturePAR1')
    archive = stream.getvalue()

    class Storage(BaseHTTPRequestHandler):
        def do_GET(self):
            state['storage_auth'].append(self.headers.get('Authorization'))
            expired = urlsplit(self.path).path == '/expired'
            status = 401 if expired or self.headers.get('Authorization') else storage_status
            self.send_response(status)
            self.end_headers()
            self.wfile.write(archive if status == 200 else b'Storage authentication failed')

        def log_message(self, *args):
            pass

    storage = ThreadingHTTPServer(('127.0.0.1', 0), Storage)

    class API(BaseHTTPRequestHandler):
        def do_GET(self):
            state['api_requests'].append((self.path, self.headers.get('Authorization')))
            if self.headers.get('Authorization') != 'Bearer test-only-token':
                self.send_response(401)
            else:
                self.send_response(api_status)
                if api_status == 302:
                    path = 'expired' if len(state['api_requests']) <= expired_links else 'archive'
                    self.send_header('Location', f'http://127.0.0.1:{storage.server_port}/{path}')
            self.end_headers()

        def log_message(self, *args):
            pass

    api = ThreadingHTTPServer(('127.0.0.1', 0), API)
    threads = [threading.Thread(target=server.serve_forever, daemon=True) for server in [api, storage]]
    for thread in threads:
        thread.start()
    try:
        yield f'http://127.0.0.1:{api.server_port}/artifacts/123/zip', state, archive
    finally:
        for server in [api, storage]:
            server.shutdown()
            server.server_close()
        for thread in threads:
            thread.join()


def test_signed_storage_redirect_does_not_receive_github_bearer_token():
    with artifact_servers() as (url, state, archive):
        assert downloader.download_bytes(url, 'test-only-token') == archive
        assert state['storage_auth'] == [None]
        assert state['api_requests'][0][1] == 'Bearer test-only-token'


def test_expired_signed_link_is_renewed_at_api_not_retried_at_storage(monkeypatch):
    monkeypatch.setattr(time, 'sleep', lambda _: None)
    with artifact_servers(expired_links=1) as (url, state, archive):
        assert downloader.download_bytes(url, 'test-only-token') == archive
        assert len(state['api_requests']) == 2
        paths = [path for path, _ in state['api_requests']]
        assert paths[0] != paths[1], 'A cached redirect must be bypassed on retry'
        assert state['storage_auth'] == [None, None]


@pytest.mark.parametrize('status', [401, 403, 503])
def test_persistent_storage_failure_is_bounded_and_does_not_expose_signed_url(monkeypatch, status):
    monkeypatch.setattr(time, 'sleep', lambda _: None)
    with artifact_servers(storage_status=status) as (url, state, _):
        with pytest.raises(RuntimeError) as failure:
            downloader.download_bytes(url, 'test-only-token')
        assert len(state['api_requests']) == 3
        assert state['storage_auth'] == [None, None, None]
        assert str(status) in str(failure.value)
        assert 'test-only-token' not in str(failure.value)
        assert '/archive' not in str(failure.value)


def test_invalid_github_permission_is_not_treated_as_expired_storage_link():
    with artifact_servers(api_status=401) as (url, state, _):
        with pytest.raises(urllib.error.HTTPError) as failure:
            downloader.download_bytes(url, 'test-only-token')
        assert failure.value.code == 401
        assert len(state['api_requests']) == 1
        assert state['storage_auth'] == []


def test_has_data_is_not_set_before_all_selected_artifacts_download(tmp_path, monkeypatch):
    monkeypatch.setattr(time, 'sleep', lambda _: None)
    monkeypatch.setenv('GITHUB_REPOSITORY', 'example/test')
    monkeypatch.setenv('GITHUB_TOKEN', 'test-only-token')
    output = tmp_path/'outputs'
    monkeypatch.setenv('GITHUB_OUTPUT', str(output))
    monkeypatch.setattr('sys.argv', ['download_eta_artifacts.py', '--month', '2026-09', '--output-dir', str(tmp_path/'predictions')])
    with artifact_servers(storage_status=503) as (url, _, _):
        monkeypatch.setattr(downloader, 'github_json', lambda *args: {'artifacts':[
            {'name':'sf-transit-eta-snapshots-2026-09-16','id':123,'expired':False,'archive_download_url':url}]})
        with pytest.raises(RuntimeError):
            downloader.main()
    assert not output.exists() or 'has_data=true' not in output.read_text()


def test_successful_month_download_writes_parquet_manifest_and_ready_signal(tmp_path, monkeypatch):
    monkeypatch.setenv('GITHUB_REPOSITORY', 'example/test')
    monkeypatch.setenv('GITHUB_TOKEN', 'test-only-token')
    output = tmp_path/'outputs'
    monkeypatch.setenv('GITHUB_OUTPUT', str(output))
    folder = tmp_path/'predictions'
    monkeypatch.setattr('sys.argv', ['download_eta_artifacts.py', '--month', '2026-09', '--output-dir', str(folder)])
    with artifact_servers() as (url, _, _):
        monkeypatch.setattr(downloader, 'github_json', lambda *args: {'artifacts':[
            {'name':'sf-transit-eta-snapshots-2026-09-16','id':123,'expired':False,'archive_download_url':url}]})
        assert downloader.main() == 0
    assert (folder/'eta_snapshots_raw_2026-09-16.parquet').read_bytes() == b'PAR1fixturePAR1'
    manifest = json.loads((folder/'eta_prediction_artifacts_2026-09.json').read_text())
    assert manifest['daily_artifacts_downloaded'] == 1
    assert manifest['days'][0]['artifact_id'] == 123
    assert output.read_text() == 'has_data=true\n'


def test_redirect_never_downgrades_an_authenticated_https_request():
    request = downloader.urllib.request.Request('https://api.github.com/artifacts/123/zip',
        headers={'Authorization':'Bearer test-only-token'})
    with pytest.raises(RuntimeError, match='insecure'):
        downloader.ArtifactRedirectHandler().redirect_request(
            request, None, 302, 'Found', {}, 'http://storage.example/archive')
