import test from "node:test";
import assert from "node:assert/strict";
import {snapshotAgeSeconds} from "../cloudflare/refresh-watchdog/worker.js";

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
