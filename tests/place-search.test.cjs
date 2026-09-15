const test = require("node:test");
const assert = require("node:assert/strict");

global.SFNearbyStops = require("../site/nearby-stops.js");
const {nearestStops, searchPlaces} = require("../site/place-search.js");

test("place search sends a bounded bilingual request through the Worker", async () => {
  let requestedUrl = "";
  const places = await searchPlaces("Ferry Building", {
    language: "zh",
    fetchImpl: async url => {
      requestedUrl = url;
      return {ok: true, json: async () => ({places: [{name: "Ferry Building", lat: 37.7955, lon: -122.3935}]})};
    }
  });
  assert.equal(places.length, 1);
  assert.match(requestedUrl, /\/places\?/);
  assert.match(requestedUrl, /lang=zh/);
  assert.match(requestedUrl, /q=Ferry(?:\+|%20)Building/);
});

test("nearest stop matching is distance ordered and rejects distant stops", () => {
  const place = {lat: 37.7955, lon: -122.3935};
  const stops = [
    {stop_id: "far", name: "Far", lat: 37.81, lon: -122.42},
    {stop_id: "near-2", name: "Second", lat: 37.7962, lon: -122.3940},
    {stop_id: "near-1", name: "First", lat: 37.7957, lon: -122.3936}
  ];
  assert.deepEqual(nearestStops(stops, place, 3).map(stop => stop.stop_id), ["near-1", "near-2"]);
});

test("short place queries do not call the network", async () => {
  let called = false;
  const places = await searchPlaces("SF", {fetchImpl: async () => { called = true; }});
  assert.deepEqual(places, []);
  assert.equal(called, false);
});
