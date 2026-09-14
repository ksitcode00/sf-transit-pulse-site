const test = require("node:test");
const assert = require("node:assert/strict");
const {ALLOWED_RADII_METERS, haversineMeters, findNearbyStops} = require("../site/nearby-stops.js");

test("nearby stop radii are limited to four 100 meter steps", () => {
  assert.deepEqual(ALLOWED_RADII_METERS, [100, 200, 300, 400]);
  assert.equal(findNearbyStops([], {lat: 37.77, lon: -122.42}, 250).length, 0);
});

test("distance calculation returns a realistic meter value", () => {
  const distance = haversineMeters(
    {lat: 37.7749, lon: -122.4194},
    {lat: 37.7758, lon: -122.4194}
  );
  assert.ok(distance > 99 && distance < 102);
});

test("nearby stops are inclusive of the radius and sorted nearest first", () => {
  const origin = {lat: 37.7749, lon: -122.4194};
  const stops = [
    {stop_id: "far", name: "Far", lat: 37.7786, lon: -122.4194},
    {stop_id: "second", name: "Second", lat: 37.7762, lon: -122.4194},
    {stop_id: "first", name: "First", lat: 37.7753, lon: -122.4194}
  ];
  assert.deepEqual(
    findNearbyStops(stops, origin, 200).map(stop => stop.stop_id),
    ["first", "second"]
  );
});

test("invalid coordinates are ignored instead of becoming false matches", () => {
  const stops = [{stop_id: "bad", name: "Bad", lat: null, lon: -122.4}];
  assert.deepEqual(findNearbyStops(stops, {lat: 37.77, lon: -122.42}, 400), []);
});
