import test from "node:test";
import assert from "node:assert/strict";
import {buildPlaceSearchUrl, normalizePhotonResults, snapshotAgeSeconds} from "../cloudflare/refresh-watchdog/worker.js";

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
