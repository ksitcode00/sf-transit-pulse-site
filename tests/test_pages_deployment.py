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


def test_pages_can_recover_after_deploy_cannot_read_the_uploaded_artifact():
    workflow = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))
    job = workflow["jobs"]["deploy"]
    steps = job["steps"]
    attempts = [step for step in steps if step.get("uses") == "actions/deploy-pages@v5"]
    assert len(attempts) == 2
    primary, retry = attempts
    assert primary["continue-on-error"] is True
    assert retry["if"] == "${{ steps.deployment.outcome == 'failure' }}"
    assert retry.get("continue-on-error", False) is False
    assert retry["with"]["artifact_name"] == primary["with"]["artifact_name"]
    backoff = steps[steps.index(primary) + 1:steps.index(retry)]
    assert any(step.get("if") == retry["if"] and step.get("run", "").startswith("sleep ") for step in backoff)
    assert job["environment"]["url"] == "${{ steps.deployment.outputs.page_url || steps.deployment_retry.outputs.page_url }}"
def test_live_refresh_is_not_a_pages_deployment_trigger():
    workflow = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))
    triggers = workflow.get("on", workflow.get(True))
    watched = triggers["workflow_run"]["workflows"]
    assert "Refresh transit snapshot" not in watched
    assert "Refresh static transit network" in watched
