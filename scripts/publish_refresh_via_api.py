#!/usr/bin/env python3
"""Publish one generated snapshot through REST after Git transport server errors."""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

import requests

try:
    from scripts.stage_refresh_outputs import REFRESH_OUTPUTS
except ModuleNotFoundError:
    from stage_refresh_outputs import REFRESH_OUTPUTS


def publish(root: Path, repository: str, token: str) -> str:
    if not token or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise ValueError("GitHub repository and workflow token are required.")

    def git(*args):
        return subprocess.check_output(["git", *args], cwd=root, text=True).strip()

    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}",
                            "Accept": "application/vnd.github+json",
                            "X-GitHub-Api-Version": "2022-11-28"})
    url = f"https://api.github.com/repos/{repository}"

    def api(method, path, body):
        response = session.request(method, url + path, json=body, timeout=(10, 30))
        response.raise_for_status()
        return response.json()

    # 中文：每次使用最新 main 作为父提交；API 也只允许快进，避免覆盖同时到达的 UI/数据更新。
    # English: Rebuild on current main and require a fast-forward, preserving concurrent edits.
    for attempt in range(3):
        git("fetch", "origin", "main")
        try:
            git("rebase", "origin/main")
        except subprocess.CalledProcessError:
            subprocess.run(["git", "rebase", "--abort"], cwd=root, check=False)
            raise
        base = git("rev-parse", "origin/main")
        if git("rev-parse", "HEAD") == base:
            return base
        if git("rev-list", "--count", "origin/main..HEAD") != "1":
            raise ValueError("API fallback only publishes a single snapshot commit.")
        files = git("diff", "--name-status", "--no-renames", "origin/main", "HEAD").splitlines()
        entries = []
        for row in files:
            change, path = row.split("\t", 1)
            if path not in REFRESH_OUTPUTS or change not in {"A", "M"}:
                raise ValueError("API fallback refuses changes outside generated snapshot files.")
            content = subprocess.check_output(["git", "show", f"HEAD:{path}"], cwd=root).decode("utf-8")
            entries.append({"path": path, "mode": "100644", "type": "blob", "content": content})
        tree = api("POST", "/git/trees", {"base_tree": git("rev-parse", "origin/main^{tree}"),
                                           "tree": entries})
        commit = api("POST", "/git/commits", {"tree": tree["sha"], "parents": [base],
                                               "message": git("log", "-1", "--format=%B"),
                                               "author": {"name": "sf-transit-pulse[bot]",
                                                          "email": "41898282+github-actions[bot]@users.noreply.github.com"}})
        try:
            api("PATCH", "/git/refs/heads/main", {"sha": commit["sha"], "force": False})
            return commit["sha"]
        except requests.HTTPError as error:
            if error.response is None or error.response.status_code not in {409, 422} or attempt == 2:
                raise
            # Retry only if main actually moved; permission/validation errors stay failures.
            git("fetch", "origin", "main")
            if git("rev-parse", "origin/main") == base:
                raise
    raise RuntimeError("API snapshot publication exhausted retries.")


if __name__ == "__main__":
    sha = publish(Path.cwd(), os.environ.get("GITHUB_REPOSITORY", ""), os.environ.get("GITHUB_TOKEN", ""))
    print(f"Snapshot published via GitHub REST API: {sha}")
