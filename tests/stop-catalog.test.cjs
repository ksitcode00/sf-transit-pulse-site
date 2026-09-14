const test = require("node:test");
const assert = require("node:assert/strict");
const {BROWSE_BATCH_SIZE, searchStops, nextBrowseBatch} = require("../site/stop-catalog.js");

test("stop search matches names and stop IDs after two characters", () => {
  const stops = [
    {stop_id: "101", name: "Market St & 5th St"},
    {stop_id: "202", name: "Geary Blvd & 6th Ave"}
  ];
  assert.deepEqual(searchStops(stops, "market").map(stop => stop.stop_id), ["101"]);
  assert.deepEqual(searchStops(stops, "202").map(stop => stop.stop_id), ["202"]);
  assert.deepEqual(searchStops(stops, "m"), []);
});

test("browse batches expose every stop without rendering all at once", () => {
  const stops = Array.from({length: 325}, (_, index) => ({stop_id: String(index)}));
  const seen = [];
  let offset = 0;
  let done = false;
  while (!done) {
    const batch = nextBrowseBatch(stops, offset);
    seen.push(...batch.rows);
    offset = batch.nextOffset;
    done = batch.done;
  }
  assert.equal(BROWSE_BATCH_SIZE, 100);
  assert.equal(seen.length, stops.length);
  assert.deepEqual(seen.map(stop => stop.stop_id), stops.map(stop => stop.stop_id));
});

test("browse batch handles an offset beyond the catalog", () => {
  const batch = nextBrowseBatch([{stop_id: "1"}], 99);
  assert.deepEqual(batch.rows, []);
  assert.equal(batch.nextOffset, 1);
  assert.equal(batch.done, true);
});
