"""Regression checks for the GitHub Pages artifact-upload recovery path."""

from pathlib import Path

import yaml


WORKFLOW = Path(__file__).resolve().parents[1] / ".github/workflows/pages.yml"


def test_pages_upload_retries_a_failed_artifact_with_a_distinct_name():
    workflow = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))
    steps = workflow["jobs"]["deploy"]["steps"]
    by_id = {step["id"]: step for step in steps if "id" in step}

    primary = by_id["upload_primary"]
    retry = by_id["upload_retry"]
    deploy = by_id["deployment"]

    assert primary["uses"] == "actions/upload-pages-artifact@v5"
    assert primary["continue-on-error"] is True
    assert primary["with"]["name"] == "github-pages"

    assert retry["uses"] == "actions/upload-pages-artifact@v5"
    assert retry["if"] == "${{ steps.upload_primary.outcome == 'failure' }}"
    assert retry["with"]["name"] == "github-pages-retry"
    assert retry["continue-on-error"] is False

    # Deploy the first artifact when it worked, otherwise the second one.
    assert deploy["with"]["artifact_name"] == (
        "${{ steps.upload_primary.outcome == 'success' "
        "&& 'github-pages' || 'github-pages-retry' }}"
    )
