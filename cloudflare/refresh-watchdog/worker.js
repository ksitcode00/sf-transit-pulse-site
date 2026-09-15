const RAW_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/ksitcode00/sf-transit-pulse-site/main/site/data/live-transit.json";
const MIN_REFRESH_AGE_SECONDS = 2 * 60;
const ACTIVE_RUN_LOOKBACK_SECONDS = 10 * 60;

function parseEpoch(value) {
  const epoch = Date.parse(value || "");
  return Number.isFinite(epoch) ? epoch : null;
}

function snapshotAgeSeconds(snapshot, nowMs) {
  const generated = parseEpoch(snapshot?.meta?.generated_at);
  const observed = parseEpoch(snapshot?.meta?.source_status?.transit?.observed_at);
  if (generated === null || observed === null) return Infinity;
  return Math.max(0, Math.ceil((nowMs - Math.min(generated, observed)) / 1000));
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "sf-transit-refresh-watchdog"
  };
}

async function githubRequest(env, path, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {...githubHeaders(env.GITHUB_WORKFLOW_TOKEN), ...(init.headers || {})}
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`GitHub ${response.status}: ${detail}`);
  }
  return response;
}

async function hasRecentActiveRun(env, nowMs) {
  const path = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/refresh-data.yml/runs?per_page=10`;
  const response = await githubRequest(env, path);
  const payload = await response.json();
  return (payload.workflow_runs || []).some(run => {
    const created = parseEpoch(run.created_at);
    const recent = created !== null && (nowMs - created) / 1000 <= ACTIVE_RUN_LOOKBACK_SECONDS;
    return recent && ["queued", "in_progress", "waiting", "requested", "pending"].includes(run.status);
  });
}

async function checkAndRecover(env, scheduledTime) {
  if (!env.GITHUB_WORKFLOW_TOKEN) throw new Error("Missing GITHUB_WORKFLOW_TOKEN secret.");
  const snapshotResponse = await fetch(`${RAW_SNAPSHOT_URL}?t=${scheduledTime}`, {
    headers: {"Cache-Control": "no-cache"}
  });
  if (!snapshotResponse.ok) throw new Error(`Snapshot HTTP ${snapshotResponse.status}`);
  const snapshot = await snapshotResponse.json();
  const ageSeconds = snapshotAgeSeconds(snapshot, scheduledTime);
  if (ageSeconds < MIN_REFRESH_AGE_SECONDS) return;
  if (await hasRecentActiveRun(env, scheduledTime)) return;

  const path = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/refresh-data.yml/dispatches`;
  await githubRequest(env, path, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      ref: env.GITHUB_REF || "main",
      inputs: {force_context: "false"}
    })
  });
}

export default {
  async scheduled(controller, env, ctx) {
    // Feature 32 · Independent scheduler / 独立调度保险
    // 中文：Cloudflare 每 3 分钟提供主时钟；时间戳仍新鲜或 GitHub 已有任务时
    // 不重复触发。Worker 不提供公开触发端点，避免外部滥用 511 配额。
    // English: Cloudflare supplies the three-minute primary clock. Fresh data
    // and active runs are deduplicated, and there is no public trigger endpoint.
    controller.noRetry();
    ctx.waitUntil(checkAndRecover(env, controller.scheduledTime));
  }
};

export {checkAndRecover, snapshotAgeSeconds};
