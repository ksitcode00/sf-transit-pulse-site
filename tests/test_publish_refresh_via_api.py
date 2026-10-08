"""Use real Git inputs and a controlled GitHub REST service for publication failures."""
import json
import subprocess
from pathlib import Path

import pytest
import requests


def git(root, *args):
    return subprocess.check_output(["git", *args], cwd=root, text=True).strip()


@pytest.fixture
def repository(tmp_path):
    remote = tmp_path / "remote.git"
    seed = tmp_path / "seed"
    bot = tmp_path / "bot"
    git(tmp_path, "init", "--bare", str(remote))
    git(tmp_path, "clone", str(remote), str(seed))
    git(seed, "config", "user.name", "Test Bot")
    git(seed, "config", "user.email", "test@example.com")
    (seed / "site/data").mkdir(parents=True)
    (seed / "site/data/live-transit.json").write_text('{"vehicles": []}\n')
    (seed / "site/index.html").write_text("old UI\n")
    git(seed, "add", ".")
    git(seed, "commit", "-m", "initial")
    git(seed, "branch", "-M", "main")
    git(seed, "push", "origin", "main")
    git(tmp_path, "clone", "--branch", "main", str(remote), str(bot))
    git(bot, "config", "user.name", "Test Bot")
    git(bot, "config", "user.email", "test@example.com")
    (bot / "site/data/live-transit.json").write_text('{"vehicles": ["V1"]}\n')
    git(bot, "add", "site/data/live-transit.json")
    git(bot, "commit", "-m", "refresh")
    return seed, bot


class RestService:
    """Represent the documented tree/commit/ref state; Git transport stays real."""
    def __init__(self, seed, race=False, denied=False):
        self.seed, self.race, self.denied = seed, race, denied
        self.trees, self.commits = {}, {}
        self.published = None
        self.new_ref = None

    def request(self, method, url, **kwargs):
        response = requests.Response()
        body = kwargs.get("json", {})
        response.status_code = 200
        if self.denied:
            response.status_code = 403
            result = {"message": "Resource not accessible"}
        elif method == "POST" and url.endswith("/git/trees"):
            assert body["base_tree"] == git(self.seed, "rev-parse", "HEAD^{tree}")
            tree = {"site/index.html": (self.seed / "site/index.html").read_text(),
                    "site/data/live-transit.json": (self.seed / "site/data/live-transit.json").read_text()}
            for entry in body["tree"]:
                tree[entry["path"]] = entry["content"]
            identity = f"tree-{len(self.trees)}"
            self.trees[identity] = tree
            result = {"sha": identity}
            response.status_code = 201
        elif method == "POST" and url.endswith("/git/commits"):
            assert body["parents"] == [git(self.seed, "rev-parse", "HEAD")]
            identity = f"commit-{len(self.commits)}"
            self.commits[identity] = body
            result = {"sha": identity}
            response.status_code = 201
        elif method == "PATCH" and url.endswith("/git/refs/heads/main"):
            assert body["force"] is False
            if self.race:
                (self.seed / "site/index.html").write_text("newer UI during API publication\n")
                git(self.seed, "add", "site/index.html")
                git(self.seed, "commit", "-m", "concurrent UI change")
                git(self.seed, "push", "origin", "main")
                self.race = False
                response.status_code = 422
                result = {"message": "Update is not a fast forward"}
            else:
                commit = self.commits[body["sha"]]
                self.new_ref = body["sha"]
                self.published = self.trees[commit["tree"]]
                result = {"object": {"sha": self.new_ref}}
        else:
            raise AssertionError(f"Unexpected API operation: {method} {url}")
        response._content = json.dumps(result).encode()
        return response


def test_api_publication_preserves_latest_main_ui(repository, monkeypatch):
    from scripts.publish_refresh_via_api import publish
    seed, bot = repository
    (seed / "site/index.html").write_text("new UI before API publication\n")
    git(seed, "add", "site/index.html")
    git(seed, "commit", "-m", "UI edit")
    git(seed, "push", "origin", "main")
    service = RestService(seed)
    monkeypatch.setattr(requests.Session, "request", lambda self, *a, **kw: service.request(*a, **kw))
    assert publish(bot, "owner/repo", "test-token") == service.new_ref
    assert service.published == {"site/index.html": "new UI before API publication\n",
                                 "site/data/live-transit.json": '{"vehicles": ["V1"]}\n'}


def test_api_ref_race_rebuilds_on_new_main_without_overwriting_it(repository, monkeypatch):
    from scripts.publish_refresh_via_api import publish
    seed, bot = repository
    service = RestService(seed, race=True)
    monkeypatch.setattr(requests.Session, "request", lambda self, *a, **kw: service.request(*a, **kw))
    assert publish(bot, "owner/repo", "test-token") == service.new_ref
    assert service.published["site/index.html"] == "newer UI during API publication\n"
    assert service.published["site/data/live-transit.json"] == '{"vehicles": ["V1"]}\n'


def test_api_permission_error_is_not_reported_as_success(repository, monkeypatch):
    from scripts.publish_refresh_via_api import publish
    seed, bot = repository
    service = RestService(seed, denied=True)
    monkeypatch.setattr(requests.Session, "request", lambda self, *a, **kw: service.request(*a, **kw))
    with pytest.raises(requests.HTTPError):
        publish(bot, "owner/repo", "test-token")
    assert service.new_ref is None


def test_api_fallback_refuses_non_snapshot_changes(repository):
    from scripts.publish_refresh_via_api import publish
    _, bot = repository
    (bot / "site/index.html").write_text("unrelated edit\n")
    git(bot, "add", "site/index.html")
    git(bot, "commit", "--amend", "--no-edit")
    with pytest.raises(ValueError, match="snapshot"):
        publish(bot, "owner/repo", "test-token")
