#!/usr/bin/env python3
"""Download one month of daily ETA Parquet artifacts from GitHub Actions."""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile
from pathlib import Path
from typing import Any


ARTIFACT_PREFIX = "sf-transit-eta-snapshots-"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--month", required=True, help="Month to download in YYYY-MM format")
    parser.add_argument("--output-dir", default="eta-predictions")
    parser.add_argument("--allow-missing", action="store_true", help="Allow months before collection began")
    return parser.parse_args()


def validate_month(value: str) -> str:
    if not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", value):
        raise ValueError("--month must use YYYY-MM, for example 2026-09")
    return value


def select_latest_artifacts(
    artifacts: list[dict[str, Any]], month: str
) -> dict[str, dict[str, Any]]:
    pattern = re.compile(rf"^{re.escape(ARTIFACT_PREFIX)}({re.escape(month)}-\d{{2}})$")
    selected: dict[str, dict[str, Any]] = {}
    for artifact in artifacts:
        if artifact.get("expired"):
            continue
        match = pattern.fullmatch(str(artifact.get("name") or ""))
        if not match:
            continue
        service_date = match.group(1)
        current = selected.get(service_date)
        if current is None or str(artifact.get("created_at") or "") > str(
            current.get("created_at") or ""
        ):
            selected[service_date] = artifact
    return selected


def github_json(url: str, token: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "sf-transit-eta-collector",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


class ArtifactRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # 中文：GitHub 使用短期签名链接下载 ZIP。跨站跳转不能带 GitHub token，
        # 否则存储服务可能把它当成不支持的认证并返回 401。
        # English: Signed storage links authenticate themselves; never forward the GitHub bearer token.
        old_origin = urllib.parse.urlsplit(req.full_url)
        new_origin = urllib.parse.urlsplit(newurl)
        if old_origin.scheme == 'https' and new_origin.scheme != 'https':
            raise RuntimeError("Refusing an insecure artifact download redirect")
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None and (old_origin.scheme, old_origin.netloc) != (new_origin.scheme, new_origin.netloc):
            redirected.remove_header('Authorization')
            redirected.remove_header('Cookie')
        return redirected


def download_bytes(url: str, token: str) -> bytes:
    opener = urllib.request.build_opener(ArtifactRedirectHandler())
    origin = urllib.parse.urlsplit(url).netloc
    for attempt in range(3):
        # 中文：重试时回到 GitHub 申请新链接，不能重复使用可能已过期的存储链接。
        # English: Renew the signed URL at the API on each retry, bypassing cached redirects.
        parts = urllib.parse.urlsplit(url)
        query = urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
        query.append(('_eta_download_attempt', uuid.uuid4().hex))
        fresh_url = urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))
        request = urllib.request.Request(fresh_url, headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "sf-transit-eta-collector",
            "Cache-Control": "no-cache",
        })
        try:
            with opener.open(request, timeout=300) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            storage = urllib.parse.urlsplit(exc.url).netloc != origin
            retryable = exc.code in {408, 429, 500, 502, 503, 504} or (storage and exc.code in {401, 403})
            if not retryable:
                raise
            error = f"HTTP {exc.code} at {'archive storage' if storage else 'GitHub API'}"
            exc.close()
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            error = "temporary download connection failure"
        if attempt == 2:
            # Do not leak temporary signed URLs into persistent Actions logs.
            raise RuntimeError(f"ETA artifact download failed after 3 attempts: {error}") from None
        print(f"Retrying ETA artifact with a fresh download link ({attempt + 1}/2): {error}", flush=True)
        time.sleep(2 ** attempt)
    raise AssertionError("Unreachable artifact retry state")


def main() -> int:
    args = parse_args()
    try:
        month = validate_month(args.month)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not repository or not token:
        print("GITHUB_REPOSITORY and GITHUB_TOKEN are required", file=sys.stderr)
        return 2

    artifacts: list[dict[str, Any]] = []
    for page in range(1, 11):
        payload = github_json(
            f"https://api.github.com/repos/{repository}/actions/artifacts?per_page=100&page={page}",
            token,
        )
        batch = payload.get("artifacts", [])
        artifacts.extend(batch)
        if len(batch) < 100:
            break

    selected = select_latest_artifacts(artifacts, month)
    if not selected:
        if os.environ.get("GITHUB_OUTPUT"):
            with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as handle:
                handle.write("has_data=false\n")
        print(f"No active daily ETA artifacts found for {month}", file=sys.stderr)
        return 0 if args.allow_missing else 1

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []
    for service_date, artifact in sorted(selected.items()):
        archive = download_bytes(str(artifact["archive_download_url"]), token)
        with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
            parquet_members = [
                member for member in bundle.namelist() if member.endswith(".parquet")
            ]
            if len(parquet_members) != 1:
                raise RuntimeError(
                    f"Artifact {artifact['name']} contains {len(parquet_members)} Parquet files"
                )
            destination = output_dir / f"eta_snapshots_raw_{service_date}.parquet"
            destination.write_bytes(bundle.read(parquet_members[0]))
            downloaded.append(
                {
                    "service_date": service_date,
                    "artifact_id": artifact.get("id"),
                    "artifact_name": artifact.get("name"),
                    "parquet": destination.name,
                }
            )

    manifest = {
        "month": month,
        "daily_artifacts_downloaded": len(downloaded),
        "days": downloaded,
    }
    (output_dir / f"eta_prediction_artifacts_{month}.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as handle:
            handle.write("has_data=true\n")
    print(json.dumps(manifest, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
