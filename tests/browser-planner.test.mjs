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

function realtimeEngine({transfer = false, safety = false, parking = false, road = false, staleMinutes = 0} = {}) {
  const nowEpoch = Math.floor(Date.now() / 1000);
  const observedEpoch = nowEpoch - staleMinutes * 60;
  const stops = {
    A: {stop_id: "A", name: "Alpha", lat: 37.700, lon: -122.400},
    X: {stop_id: "X", name: "Exchange", lat: 37.710, lon: -122.400},
    D: {stop_id: "D", name: "Delta", lat: 37.720, lon: -122.400}
  };
  const patterns = {
    "R1|0|s1": {route_id: "R1", direction_id: "0", shape_id: "s1", shape: [[37.700, -122.400], [37.710, -122.400]], stops: [stops.A, stops.X]}
  };
  const routes = [{route_id: "R1", route_type: "3"}];
  const predictions = [{
    trip_id: "trip-1", route_id: "R1", direction_id: "0", shape_id: "s1",
    vehicle_id: "vehicle-1", update_timestamp: observedEpoch,
    stops: [
      {stop_id: "A", stop_sequence: 1, departure_time: nowEpoch + 300},
      {stop_id: "X", stop_sequence: 2, arrival_time: nowEpoch + 600}
    ]
  }];
  if (transfer) {
    patterns["R2|0|s2"] = {route_id: "R2", direction_id: "0", shape_id: "s2", shape: [[37.710, -122.400], [37.720, -122.400]], stops: [stops.X, stops.D]};
    routes.push({route_id: "R2", route_type: "3"});
    predictions.push({
      trip_id: "trip-2", route_id: "R2", direction_id: "0", shape_id: "s2",
      vehicle_id: "vehicle-2", update_timestamp: observedEpoch,
      stops: [
        {stop_id: "X", stop_sequence: 1, departure_time: nowEpoch + 780},
        {stop_id: "D", stop_sequence: 2, arrival_time: nowEpoch + 1200}
      ]
    });
  }
  const observedAt = new Date(observedEpoch * 1000).toISOString();
  return new BrowserPlannerEngine(
    {meta: {route_count: routes.length, pattern_count: Object.keys(patterns).length}, routes, patterns},
    {
      meta: {status: "live", generated_at: observedAt, source_status: {
        transit: {observed_at: observedAt}, alerts: {observed_at: observedAt},
        roads: {observed_at: observedAt}, parking: {observed_at: observedAt}
      }},
      routes: [], vehicles: [], trip_predictions: predictions,
      alerts: [],
      road_events: road ? [{
        title: "Street work", route_ids: ["R1"], route_match_status: "MATCHED",
        lat: 37.705, lon: -122.400, geometry: [[37.705, -122.400]]
      }] : [],
      safety: safety ? {status: "JOURNEY_RELATIVE_CONTEXT", cells: [
        {lat: 37.700, lon: -122.400, reported_incidents_365d_cell: 2, reported_incidents_365d_nearby: 2},
        {lat: 37.710, lon: -122.400, reported_incidents_365d_cell: 8, reported_incidents_365d_nearby: 8},
        {lat: 37.720, lon: -122.400, reported_incidents_365d_cell: 20, reported_incidents_365d_nearby: 20}
      ]} : {},
      parking: parking ? {status: "DESTINATION_PAID_PARKING_PRESSURE", source_snapshot_time: observedAt, cells: [{
        lat: 37.720, lon: -122.400, metered_spaces: 10, active_paid_sessions_proxy: 7,
        paid_session_pressure_ratio: 0.7, starts_15m: 2, starts_30m: 4,
        starts_60m: 6, previous_30m_starts: 1
      }]} : {}
    }
  );
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

test("fresh trip updates produce concrete boarding and arrival times", () => {
  const result = realtimeEngine().plan("A", "X", "FASTEST");
  const journey = result.alternatives[0];
  assert.equal(result.meta.freshness.transit_realtime_usable, true);
  assert.equal(journey.eta_status, "REALTIME_TRIP_PREDICTION");
  assert.equal(journey.legs.find(row => row.type === "RIDE").trip_id, "trip-1");
});

test("trip updates older than ten minutes fall back to estimates", () => {
  const result = realtimeEngine({staleMinutes: 11}).plan("A", "X", "FASTEST");
  assert.equal(result.meta.freshness.transit_realtime_usable, false);
  assert.ok(result.alternatives.every(row => row.eta_status === "ESTIMATED"));
  assert.ok(result.alternatives.every(row => row.legs.filter(leg => leg.type === "RIDE").every(leg => leg.trip_id === null)));
});

test("concrete two-trip transfer calculates catch slack", () => {
  const result = realtimeEngine({transfer: true}).plan("A", "D", "BALANCED");
  const journey = result.alternatives.find(row => row.route_sequence === "R1 → R2");
  assert.equal(journey.eta_status, "REALTIME_TRIP_PREDICTION");
  assert.equal(journey.transfer.catch_slack_min, 2);
  assert.equal(journey.transfer.catchability, "TIGHT");
});

test("browser engine exposes safety and fresh parking evidence", () => {
  const result = realtimeEngine({transfer: true, safety: true, parking: true}).plan("A", "D", "SAFETY_FIRST");
  const journey = result.alternatives.find(row => row.route_sequence === "R1 → R2");
  assert.equal(result.meta.safety_status, "JOURNEY_RELATIVE_CONTEXT");
  assert.equal(journey.safety.status, "JOURNEY_RELATIVE_CONTEXT");
  assert.equal(journey.destination_parking.status, "PAID_PARKING_PRESSURE_PROXY");
  assert.equal(journey.destination_parking.active_paid_sessions_proxy, 7);
});

test("stale parking evidence is not labeled as current pressure", () => {
  const result = realtimeEngine({parking: true, staleMinutes: 181}).plan("A", "X", "BALANCED");
  assert.equal(result.meta.freshness.parking_context_usable, false);
  assert.ok(result.alternatives.every(row => row.destination_parking.status === "STALE"));
});

test("zero paid sessions is not mislabeled as low parking pressure", () => {
  const engine = realtimeEngine({transfer: true, parking: true});
  Object.assign(engine.realtime.parking.cells[0], {
    active_paid_sessions_proxy: 0,
    starts_15m: 0,
    starts_30m: 0,
    starts_60m: 0,
    previous_30m_starts: 0
  });
  engine.updateRealtime(engine.realtime);
  const result = engine.plan("A", "D", "BALANCED");
  assert.ok(result.alternatives.every(row => row.destination_parking.status === "NO_RECENT_PAID_ACTIVITY"));
  assert.ok(result.alternatives.every(row => row.destination_parking.pressure_label === "NO_RECENT_PAID_ACTIVITY"));
});

test("fresh matched road context appears on the affected leg", () => {
  const result = realtimeEngine({road: true}).plan("A", "X", "BALANCED");
  const disruption = result.alternatives[0].disruption_analysis[0];
  assert.equal(disruption.road_context[0].title, "Street work");
  assert.equal(disruption.road_context[0].relation, "DIRECT_ROUTE_MATCH");
});

test("road context older than thirty minutes is ignored", () => {
  const result = realtimeEngine({road: true, staleMinutes: 31}).plan("A", "X", "BALANCED");
  assert.ok(result.alternatives.every(row => row.disruption_analysis.every(item => item.road_context.length === 0)));
});

test("mode winners are chosen before the twelve-row display limit", () => {
  const engine = realtimeEngine();
  engine.generateCandidates = () => Array.from({length: 14}, (_, index) => ({
    journey_id: `candidate-${index}`, route_sequence: `R${index}`, eta_min: 20 + index,
    walking_min: index, transfer_count: 0, eta_status: "ESTIMATED", reliability: "STABLE",
    exposure: "TEST", costs: {fastest: index, balanced: index, safety_first: index === 13 ? -1 : index}
  }));
  const result = engine.plan("A", "X", "SAFETY_FIRST");
  const safetyWinner = result.modes.find(row => row.mode === "SAFETY_FIRST");
  assert.equal(result.candidate_count, 14);
  assert.equal(safetyWinner.winner_journey_id, "candidate-13");
  assert.ok(result.alternatives.some(row => row.journey_id === "candidate-13"));
});

test("a slightly farther stop can win when its concrete trip arrives sooner", () => {
  const now = Math.floor(Date.now() / 1000);
  const observedAt = new Date(now * 1000).toISOString();
  const O = {stop_id: "O", name: "Origin", lat: 37.7000, lon: -122.4000};
  const Z = {stop_id: "Z", name: "Dummy", lat: 37.6990, lon: -122.4000};
  const A = {stop_id: "A", name: "Near stop", lat: 37.7002, lon: -122.4000};
  const B = {stop_id: "B", name: "Sooner stop", lat: 37.7012, lon: -122.4000};
  const D = {stop_id: "D", name: "Destination", lat: 37.7100, lon: -122.4000};
  const engine = new BrowserPlannerEngine({
    meta: {route_count: 2, pattern_count: 2},
    routes: [{route_id: "Q", route_type: "3"}, {route_id: "R", route_type: "3"}],
    patterns: {
      "Q|0|dummy": {route_id: "Q", direction_id: "0", shape_id: "dummy", stops: [O, Z]},
      "R|0|main": {route_id: "R", direction_id: "0", shape_id: "main", stops: [A, B, D]}
    }
  }, {
    meta: {generated_at: observedAt, source_status: {transit: {observed_at: observedAt}}},
    routes: [], vehicles: [], alerts: [], road_events: [], safety: {}, parking: {},
    trip_predictions: [
      {trip_id: "slow", route_id: "R", direction_id: "0", shape_id: "main", update_timestamp: now, stops: [
        {stop_id: "A", stop_sequence: 1, departure_time: now + 720},
        {stop_id: "D", stop_sequence: 3, arrival_time: now + 1200}
      ]},
      {trip_id: "soon", route_id: "R", direction_id: "0", shape_id: "main", update_timestamp: now, stops: [
        {stop_id: "B", stop_sequence: 2, departure_time: now + 120},
        {stop_id: "D", stop_sequence: 3, arrival_time: now + 420}
      ]}
    ]
  });

  const result = engine.plan("O", "D", "FASTEST");
  const winner = result.alternatives.find(row => row.journey_id === result.selected_journey_id);
  assert.equal(winner.legs.find(row => row.type === "RIDE").from.stop_id, "B");
  assert.equal(winner.legs.find(row => row.type === "RIDE").trip_id, "soon");
});

test("one-transfer planning does not discard the ninth realtime transfer option", () => {
  const now = Math.floor(Date.now() / 1000);
  const observedAt = new Date(now * 1000).toISOString();
  const origin = {stop_id: "O", name: "Origin", lat: 37.700, lon: -122.400};
  const destination = {stop_id: "D", name: "Destination", lat: 37.720, lon: -122.400};
  const firstTransfers = Array.from({length: 9}, (_, index) => ({
    stop_id: `X${index}`, name: `First ${index}`, lat: 37.710, lon: -122.400
  }));
  const secondTransfers = Array.from({length: 9}, (_, index) => ({
    stop_id: `B${index}`, name: `Second ${index}`, lat: 37.710, lon: -122.400
  }));
  const firstStops = [
    {stop_id: "O", stop_sequence: 1, departure_time: now + 60},
    ...firstTransfers.map((stop, index) => ({stop_id: stop.stop_id, stop_sequence: index + 2, arrival_time: now + 120 + index * 5}))
  ];
  const slowSecondStops = [
    ...secondTransfers.slice(0, 8).map((stop, index) => ({stop_id: stop.stop_id, stop_sequence: index + 1, departure_time: now + 1200 + index * 5})),
    {stop_id: "D", stop_sequence: 10, arrival_time: now + 1500}
  ];
  const engine = new BrowserPlannerEngine({
    meta: {route_count: 2, pattern_count: 2},
    routes: [{route_id: "R1", route_type: "3"}, {route_id: "R2", route_type: "3"}],
    patterns: {
      "R1|0|s1": {route_id: "R1", direction_id: "0", shape_id: "s1", stops: [origin, ...firstTransfers]},
      "R2|0|s2": {route_id: "R2", direction_id: "0", shape_id: "s2", stops: [...secondTransfers, destination]}
    }
  }, {
    meta: {status: "live", generated_at: observedAt, source_status: {transit: {observed_at: observedAt}}},
    routes: [], vehicles: [], alerts: [], road_events: [], safety: {}, parking: {},
    trip_predictions: [
      {trip_id: "first", route_id: "R1", direction_id: "0", shape_id: "s1", update_timestamp: now, stops: firstStops},
      {trip_id: "slow", route_id: "R2", direction_id: "0", shape_id: "s2", update_timestamp: now, stops: slowSecondStops},
      {trip_id: "fast-ninth", route_id: "R2", direction_id: "0", shape_id: "s2", update_timestamp: now, stops: [
        {stop_id: "B8", stop_sequence: 9, departure_time: now + 300},
        {stop_id: "D", stop_sequence: 10, arrival_time: now + 480}
      ]}
    ]
  });

  const result = engine.plan("O", "D", "FASTEST");
  const winner = result.alternatives.find(row => row.journey_id === result.selected_journey_id);
  const transferWalk = winner.legs.find(row => row.type === "WALK" && row.transfer);
  assert.equal(transferWalk.to.stop_id, "B8");
  assert.equal(winner.legs.filter(row => row.type === "RIDE")[1].trip_id, "fast-ninth");
});
