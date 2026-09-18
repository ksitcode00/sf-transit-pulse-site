import test from "node:test";
import assert from "node:assert/strict";
import worker from "../cloudflare/refresh-watchdog/worker.js";
import {buildPlaceSearchUrl, dispatchTrafficSafetyBuild, normalizePhotonResults, previousCompleteMonth, snapshotAgeSeconds} from "../cloudflare/refresh-watchdog/worker.js";

test("monthly history trigger targets the previous complete calendar month", () => {
  assert.equal(previousCompleteMonth(Date.parse("2026-10-15T12:47:00Z")), "2026-09");
  assert.equal(previousCompleteMonth(Date.parse("2027-01-15T12:47:00Z")), "2026-12");
});

test("external watchdog uses the older of generated and observed timestamps", () => {
  const now = Date.parse("2026-09-15T12:10:00Z");
  const snapshot = {
    meta: {
      generated_at: "2026-09-15T12:09:00Z",
      source_status: {transit: {observed_at: "2026-09-15T12:07:00Z"}}
    }
  };
  assert.equal(snapshotAgeSeconds(snapshot, now), 180);
});

test("external watchdog treats missing source time as stale", () => {
  assert.equal(snapshotAgeSeconds({meta: {}}, Date.now()), Infinity);
});

test("weekly traffic history dispatch skips recent success but retries failure", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let conclusion = "success";
  globalThis.fetch = async (url, init) => {
    calls.push({url, init});
    if (init.method === "POST") return new Response(null, {status: 204});
    return Response.json({workflow_runs: [{created_at: "2026-09-18T12:00:00Z", status: "completed", conclusion}]});
  };
  try {
    const env = {GITHUB_OWNER: "owner", GITHUB_REPO: "repo", GITHUB_WORKFLOW_TOKEN: "test-token", GITHUB_REF: "main"};
    const now = Date.parse("2026-09-18T13:37:00Z");
    await dispatchTrafficSafetyBuild(env, now);
    assert.equal(calls.length, 1);
    conclusion = "failure";
    await dispatchTrafficSafetyBuild(env, now);
    assert.equal(calls.length, 3);
    assert.ok(calls[2].url.endsWith("build-traffic-safety.yml/dispatches"));
    assert.deepEqual(JSON.parse(calls[2].init.body), {ref: "main"});
  } finally { globalThis.fetch = originalFetch; }
});

test("daily incident timer dispatches its own pipeline rather than refreshing transit", async()=>{
  const originalFetch=globalThis.fetch,posts=[],pending=[];
  globalThis.fetch=async(url,init={})=>{
    if(init.method==='POST'){posts.push({url,body:JSON.parse(init.body)});return new Response(null,{status:204});}
    if(url.includes('raw.githubusercontent.com'))return Response.json({meta:{generated_at:'2026-09-18T13:52:59Z',source_status:{transit:{observed_at:'2026-09-18T13:52:59Z'}}}});
    return Response.json({workflow_runs:[]});
  };
  try{
    await worker.scheduled({cron:'53 13 * * *',scheduledTime:Date.parse('2026-09-18T13:53:00Z'),noRetry(){}},
      {GITHUB_WORKFLOW_TOKEN:'test',GITHUB_OWNER:'owner',GITHUB_REPO:'repo',GITHUB_REF:'main'},
      {waitUntil(promise){pending.push(promise);}});
    await Promise.all(pending);
    assert.equal(posts.length,1);
    assert.ok(posts[0].url.endsWith('build-incident-environment.yml/dispatches'));
    assert.deepEqual(posts[0].body,{ref:'main'});
  }finally{globalThis.fetch=originalFetch;}
});

test("place proxy keeps searches inside San Francisco and normalizes results", () => {
  const url = new URL(buildPlaceSearchUrl("Ferry Building", "zh"));
  assert.equal(url.hostname, "photon.komoot.io");
  assert.equal(url.searchParams.get("lang"), "en");
  assert.ok(url.searchParams.get("bbox"));

  const places = normalizePhotonResults({features: [
    {properties: {name: "Ferry Building", city: "San Francisco"}, geometry: {coordinates: [-122.3935, 37.7955]}},
    {properties: {name: "Outside"}, geometry: {coordinates: [-122.0, 38.0]}}
  ]});
  assert.equal(places.length, 1);
  assert.equal(places[0].name, "Ferry Building");
});
