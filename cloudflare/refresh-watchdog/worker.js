const RAW_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/ksitcode00/sf-transit-pulse-site/main/site/data/live-transit.json";
const MIN_REFRESH_AGE_SECONDS = 2 * 60;
const ACTIVE_RUN_LOOKBACK_SECONDS = 10 * 60;
const HISTORY_RUN_LOOKBACK_SECONDS = 24 * 60 * 60;
const HISTORY_CRON = "47 12 15,22 * *";
const FEATURE5_RUN_LOOKBACK_SECONDS = 20 * 60 * 60;
const FEATURE5_CRON = "19 13 * * *";
const TRAFFIC_SAFETY_CRON = "37 13 * * 5";
const PLACE_SEARCH_ORIGIN = "https://ksitcode00.github.io";
const PLACE_SEARCH_BBOX = "-122.55,37.69,-122.32,37.84";
const PHOTON_SEARCH_URL = "https://photon.komoot.io/api/";

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

function allowedPlaceSearchOrigin(origin) {
  if (!origin) return true;
  if (origin === PLACE_SEARCH_ORIGIN) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function buildPlaceSearchUrl(query, language = "en") {
  const url = new URL(PHOTON_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  // Photon does not currently accept zh as a response language. Chinese UI
  // copy stays localized while place names use its supported English index.
  url.searchParams.set("lang", "en");
  url.searchParams.set("bbox", PLACE_SEARCH_BBOX);
  url.searchParams.set("lat", "37.7749");
  url.searchParams.set("lon", "-122.4194");
  return url.toString();
}

function normalizePhotonResults(payload) {
  const seen = new Set();
  return (payload?.features || []).flatMap(feature => {
    const coordinates = feature?.geometry?.coordinates || [];
    const lon = Number(coordinates[0]);
    const lat = Number(coordinates[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    if (lon < -122.55 || lon > -122.32 || lat < 37.69 || lat > 37.84) return [];
    const properties = feature.properties || {};
    const primary = properties.name
      || [properties.housenumber, properties.street].filter(Boolean).join(" ")
      || properties.locality
      || properties.city;
    const secondary = [properties.street, properties.locality, properties.city, properties.postcode]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index && value !== primary)
      .join(", ");
    if (!primary) return [];
    const key = `${primary}|${lat.toFixed(5)}|${lon.toFixed(5)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{id: key, name: primary, detail: secondary, lat, lon}];
  }).slice(0, 5);
}

function placeResponse(payload, status, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": status === 200 ? "public, max-age=3600" : "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(payload), {status, headers});
}

async function handlePlaceSearch(request) {
  const origin = request.headers.get("Origin") || "";
  if (!allowedPlaceSearchOrigin(origin)) {
    return placeResponse({error: "Origin not allowed."}, 403);
  }
  const requestUrl = new URL(request.url);
  const query = String(requestUrl.searchParams.get("q") || "").trim().slice(0, 80);
  const language = requestUrl.searchParams.get("lang") === "zh" ? "zh" : "en";
  if (query.length < 3) {
    return placeResponse({error: "Enter at least three characters."}, 400, origin);
  }

  const upstream = await fetch(buildPlaceSearchUrl(query, language), {
    headers: {Accept: "application/json"}
  });
  if (!upstream.ok) {
    return placeResponse({error: "Place search is temporarily unavailable."}, 502, origin);
  }
  const places = normalizePhotonResults(await upstream.json());
  return placeResponse({places, attribution: "OpenStreetMap contributors · Photon"}, 200, origin);
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

function previousCompleteMonth(timestampMs) {
  const date = new Date(timestampMs);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

async function hasRecentHistoricalRun(env, nowMs) {
  const path = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/build-tableau-history.yml/runs?per_page=10`;
  const response = await githubRequest(env, path);
  const payload = await response.json();
  return (payload.workflow_runs || []).some(run => {
    const created = parseEpoch(run.created_at);
    return created !== null && (nowMs - created) / 1000 <= HISTORY_RUN_LOOKBACK_SECONDS;
  });
}

async function dispatchHistoricalBuild(env, scheduledTime) {
  if (!env.GITHUB_WORKFLOW_TOKEN) throw new Error("Missing GITHUB_WORKFLOW_TOKEN secret.");
  if (await hasRecentHistoricalRun(env, scheduledTime)) return;
  const path = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/build-tableau-history.yml/dispatches`;
  await githubRequest(env, path, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      ref: env.GITHUB_REF || "main",
      inputs: {month: previousCompleteMonth(scheduledTime)}
    })
  });
}

async function dispatchFeature5Build(env, scheduledTime) {
  if (!env.GITHUB_WORKFLOW_TOKEN) throw new Error("Missing GITHUB_WORKFLOW_TOKEN secret.");
  const workflow = "build-tableau-construction.yml";
  const path = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${workflow}/runs?per_page=10`;
  const response = await githubRequest(env, path);
  const payload = await response.json();
  const alreadyStarted = (payload.workflow_runs || []).some(run => {
    const created = parseEpoch(run.created_at);
    return created !== null && (scheduledTime - created) / 1000 <= FEATURE5_RUN_LOOKBACK_SECONDS;
  });
  if (alreadyStarted) return;
  await githubRequest(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ref: env.GITHUB_REF || "main", inputs: {}})
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

// 中文：历史事故每周独立检查，不走 511，不影响三分钟公交刷新配额。
// English: Check historical crashes weekly, independently of 511 and transit refresh quotas.
async function dispatchTrafficSafetyBuild(env, scheduledTime) {
  if (!env.GITHUB_WORKFLOW_TOKEN) throw new Error("Missing GITHUB_WORKFLOW_TOKEN secret.");
  const workflow = "build-traffic-safety.yml";
  const root = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${workflow}`;
  const response = await githubRequest(env, `${root}/runs?per_page=10`);
  const payload = await response.json();
  const recent = (payload.workflow_runs || []).some(run => {
    const created = parseEpoch(run.created_at);
    return created !== null && scheduledTime >= created && scheduledTime - created < 6 * 86400000
      && (run.conclusion === "success" || ["queued", "in_progress", "waiting", "pending"].includes(run.status));
  });
  if (recent) return;
  await githubRequest(env, `${root}/dispatches`, {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ref: env.GITHUB_REF || "main"})
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/places") {
      return handlePlaceSearch(request);
    }
    return new Response("Not found", {status: 404});
  },
  async scheduled(controller, env, ctx) {
    // Feature 32 · Independent scheduler / 独立调度保险
    // 中文：Cloudflare 每 3 分钟提供主时钟；时间戳仍新鲜或 GitHub 已有任务时
    // 不重复触发。Worker 不提供公开触发端点，避免外部滥用 511 配额。
    // English: Cloudflare supplies the three-minute primary clock. Fresh data
    // and active runs are deduplicated, and there is no public trigger endpoint.
    controller.noRetry();
    // The 15th starts the normal monthly publication; the 22nd is a small
    // independent retry window for a delayed official 511 historic package.
    if (controller.cron === HISTORY_CRON) {
      ctx.waitUntil(dispatchHistoricalBuild(env, controller.scheduledTime));
      return;
    }
    if (controller.cron === FEATURE5_CRON) {
      ctx.waitUntil(dispatchFeature5Build(env, controller.scheduledTime));
      return;
    }
    if (controller.cron === TRAFFIC_SAFETY_CRON) {
      ctx.waitUntil(dispatchTrafficSafetyBuild(env, controller.scheduledTime));
      return;
    }
    ctx.waitUntil(checkAndRecover(env, controller.scheduledTime));
  }
};

export {buildPlaceSearchUrl, checkAndRecover, dispatchFeature5Build, dispatchTrafficSafetyBuild, dispatchHistoricalBuild, handlePlaceSearch, normalizePhotonResults, previousCompleteMonth, snapshotAgeSeconds};
