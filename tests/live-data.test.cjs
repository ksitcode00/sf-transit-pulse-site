const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const file = path.join(__dirname, "../site/live-data.js");
const code = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

function client() {
  const context = vm.createContext({window: {}});
  vm.runInContext(code, context);
  assert.equal(typeof context.window.SFTransitData?.fetchPublicJson, "function");
  return context.window.SFTransitData;
}

test("fresh transit comes from Cloudflare without contacting Pages", async () => {
  const urls = [];
  const payload = {meta: {generated_at: "2026-09-22T12:04:00Z"}, vehicles: []};
  const received = await client().fetchPublicJson("live-transit.json", "data/live-transit.json", {
    fetchImpl: async url => { urls.push(url); return Response.json(payload); }
  });
  assert.deepEqual(JSON.parse(JSON.stringify(received)), payload);
  assert.equal(urls.length, 1);
  assert.match(urls[0], /^https:\/\/sf-transit-refresh-watchdog\.kawaisit14\.workers\.dev\/data\/live-transit\.json/);
});

test("unavailable Cloudflare data falls back to the existing Pages snapshot", async () => {
  const urls = [];
  const received = await client().fetchPublicJson("live-transit.json", "data/live-transit.json", {
    fetchImpl: async url => {
      urls.push(url);
      if (url.startsWith("https://")) return new Response("unavailable", {status: 503});
      return Response.json({meta: {generated_at: "2026-09-22T12:01:00Z"}});
    }
  });
  assert.equal(received.meta.generated_at, "2026-09-22T12:01:00Z");
  assert.equal(urls.length, 2);
  assert.match(urls[1], /^data\/live-transit\.json\?t=/);
});

test("the live endpoint only accepts known public snapshot files", async () => {
  let contacted = false;
  await assert.rejects(client().fetchPublicJson("../secret.txt", "../secret.txt", {
    fetchImpl: async () => { contacted = true; }
  }), /unsupported/i);
  assert.equal(contacted, false);
});
