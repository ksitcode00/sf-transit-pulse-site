/* Feature 25B contract tests / Feature 25B 浏览器规划契约测试。 */

import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {BrowserPlannerEngine} from "../site/planner-engine.mjs";

const rootUrl = new URL("../", import.meta.url);

async function publicEngine() {
  const [networkText, realtimeText] = await Promise.all([
    readFile(new URL("site/data/network.json", rootUrl), "utf8"),
    readFile(new URL("site/data/latest.json", rootUrl), "utf8")
  ]);
  return new BrowserPlannerEngine(JSON.parse(networkText), JSON.parse(realtimeText));
}

test("browser engine covers the public route catalog", async () => {
  const engine = await publicEngine();
  assert.equal(engine.stats.routes, engine.network.meta.route_count);
  assert.equal(engine.stats.patterns, engine.network.meta.pattern_count);
  assert.ok(engine.stats.stops > 1000);
});

test("reference trip returns all three real ranking modes", async () => {
  const engine = await publicEngine();
  const result = engine.plan("13161", "15659", "BALANCED");
  assert.equal(result.meta.execution, "BROWSER_WEB_WORKER");
  assert.deepEqual(new Set(result.modes.map(row => row.mode)), new Set([
    "FASTEST", "BALANCED", "SAFETY_FIRST"
  ]));
  assert.ok(result.alternatives.length > 0);
  assert.ok(result.alternatives.some(row => row.journey_id === result.selected_journey_id));
  assert.ok(result.alternatives.every(row => row.map.route_paths.length >= 1));
});

test("preferences rank one candidate set without changing its ETA", async () => {
  const engine = await publicEngine();
  const fastest = engine.plan("13161", "15659", "FASTEST");
  const balanced = engine.plan("13161", "15659", "BALANCED");
  const fastestEta = new Map(fastest.alternatives.map(row => [row.journey_id, row.eta_min]));
  for (const row of balanced.alternatives) {
    if (fastestEta.has(row.journey_id)) assert.equal(row.eta_min, fastestEta.get(row.journey_id));
  }
});

test("same origin and destination is rejected", async () => {
  const engine = await publicEngine();
  assert.throws(() => engine.plan("13161", "13161"), /must be different/);
});

