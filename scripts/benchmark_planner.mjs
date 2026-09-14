#!/usr/bin/env node

/*
 * Feature 32 · Browser planner benchmark / 浏览器规划器性能基准
 *
 * 中文：取消“最近 10 个站 / 每条 pattern 3 个站”的静态截断后，候选更完整，
 * 但也必须量化计算成本。本脚本从完整 GTFS 路网固定抽样直达可行的 O→D，
 * 记录成功率、p50、p95、最慢耗时和候选数量，方便以后比较版本是否退化。
 *
 * English: Removing static access-stop caps improves correctness but increases
 * work. This deterministic full-network benchmark samples feasible O→D pairs
 * and reports success rate, p50, p95, worst duration, and candidate counts.
 */

import {readFile} from "node:fs/promises";
import {performance} from "node:perf_hooks";
import {BrowserPlannerEngine} from "../site/planner-engine.mjs";

const requestedRuns = Number.parseInt(process.argv[2] || "100", 10);
const runCount = Number.isFinite(requestedRuns) && requestedRuns > 0 ? requestedRuns : 100;
const root = new URL("../", import.meta.url);

const [networkText, realtimeText] = await Promise.all([
  readFile(new URL("site/data/network.json", root), "utf8"),
  readFile(new URL("site/data/latest.json", root), "utf8")
]);
const network = JSON.parse(networkText);
const realtime = JSON.parse(realtimeText);
const engine = new BrowserPlannerEngine(network, realtime);
const rawPatterns = Object.values(network.patterns || network.route_directions || {})
  .filter(pattern => (pattern.stops || []).length >= 6);

let randomState = 0x5f3759df;
const random = () => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
};

const timings = [];
const candidateCounts = [];
const failures = [];
for (let index = 0; index < runCount; index += 1) {
  const pattern = rawPatterns[Math.floor(random() * rawPatterns.length)];
  const stops = pattern.stops;
  const originIndex = Math.floor(random() * Math.max(1, Math.floor(stops.length / 2)));
  const remaining = stops.length - originIndex - 1;
  const destinationIndex = originIndex + 1 + Math.floor(random() * remaining);
  const origin = String(stops[originIndex].stop_id);
  const destination = String(stops[destinationIndex].stop_id);
  const started = performance.now();
  try {
    const result = engine.plan(origin, destination, "BALANCED");
    timings.push(performance.now() - started);
    candidateCounts.push(result.candidate_count);
  } catch (error) {
    failures.push({origin, destination, error: error?.message || String(error)});
  }
}

const percentile = (values, fraction) => {
  if (!values.length) return null;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * fraction) - 1)];
};
const round = value => value == null ? null : Math.round(value * 10) / 10;
const report = {
  benchmark_version: "1.0",
  engine_version: "25B-browser-1.4",
  requested_queries: runCount,
  successful_queries: timings.length,
  failed_queries: failures.length,
  success_rate: Math.round(1000 * timings.length / runCount) / 1000,
  duration_ms: {
    p50: round(percentile(timings, 0.50)),
    p95: round(percentile(timings, 0.95)),
    maximum: round(percentile(timings, 1))
  },
  candidate_count: {
    p50: round(percentile(candidateCounts, 0.50)),
    p95: round(percentile(candidateCounts, 0.95)),
    maximum: round(percentile(candidateCounts, 1))
  },
  network: engine.stats,
  note: "Deterministic feasible direct-trip sample on the checked-in full network; wall time varies by machine.",
  failures: failures.slice(0, 5)
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!timings.length) process.exitCode = 1;
