const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "site", "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "site", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "site", "styles.css"), "utf8");

test("network keeps a visible service and street update summary", () => {
  assert.match(html, /id="network-update-summary"/);
  assert.match(app, /function renderNetworkUpdateSummary/);
  assert.match(app, /renderNetworkUpdateSummary\(\)/);
});

test("journey results expose compact comparison and trip evidence", () => {
  assert.match(html, /id="compact-comparison"/);
  assert.match(html, /id="journey-context-summary"/);
  assert.match(app, /renderCompactComparison\(journey/);
  assert.match(app, /renderJourneyContextSummary\(journey\)/);
});

test("recommendation shows transfer buffer and restores the mobile bar", () => {
  assert.match(app, /transferComfort\(journey\.transfer\)/);
  assert.match(app, /renderMobileRecommendation\(journey\)/);
  assert.match(css, /\.mobile-recommendation:not\(\[hidden\]\)\s*\{[\s\S]*?position:\s*fixed/);
});

test("stale realtime data is labeled as delayed and auto-checked", () => {
  assert.match(app, /Update delayed · checking automatically/);
  assert.match(app, /The page checks for updates every 90 seconds/);
  assert.match(css, /\.live-dot\.delayed/);
});

test("trip planning accepts places while keeping stop mapping explicit", () => {
  assert.match(html, /src="place-search\.js\?v=39"/);
  assert.match(html, /id="origin-place-match"/);
  assert.match(html, /id="destination-place-match"/);
  assert.match(app, /function placeOptionMarkup/);
  assert.match(app, /This walk is not included in the transit ETA/);
});

test("nearby stops include an on-page location map", () => {
  assert.match(html, /id="nearby-map"/);
  assert.match(app, /function renderNearbyMap/);
  assert.match(css, /#nearby-map\s*\{/);
});
