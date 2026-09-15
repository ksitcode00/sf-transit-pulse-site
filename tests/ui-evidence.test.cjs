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
  assert.doesNotMatch(app, /every 5 minutes/);
  assert.doesNotMatch(app, /每 5 分钟/);
  assert.match(css, /\.live-dot\.delayed/);
});

test("trip planning accepts places while keeping stop mapping explicit", () => {
  assert.match(html, /src="place-search\.js\?v=40"/);
  assert.match(html, /id="origin-place-match"/);
  assert.match(html, /id="destination-place-match"/);
  assert.match(app, /function placeOptionMarkup/);
  assert.match(app, /This walk is not included in the transit ETA/);
});

test("the fixed home comparison is explicitly labeled as an example", () => {
  assert.match(html, /Illustrative example · A useful tradeoff/);
  assert.match(app, /示例行程 · 一种实用取舍/);
});

test("social sharing metadata uses a repository-owned preview", () => {
  assert.match(html, /property="og:title" content="SF Transit Pulse"/);
  assert.match(html, /property="og:image" content="https:\/\/ksitcode00\.github\.io\/sf-transit-pulse-site\/assets\/social-preview\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.ok(fs.existsSync(path.join(root, "site", "assets", "social-preview.png")));
});

test("rider-facing modes use evidence-appropriate historical context wording", () => {
  assert.match(app, /SAFETY_FIRST:"Historical context"/);
  assert.match(app, /SAFETY_FIRST:"历史背景"/);
  assert.doesNotMatch(app, /Safety-first/);
  assert.doesNotMatch(app, /安全优先/);
});

test("nearby stops include an on-page location map", () => {
  assert.match(html, /id="nearby-map"/);
  assert.match(app, /function renderNearbyMap/);
  assert.match(css, /#nearby-map\s*\{/);
});
