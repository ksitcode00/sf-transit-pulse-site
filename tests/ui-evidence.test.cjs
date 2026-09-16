const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "site", "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "site", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "site", "styles.css"), "utf8");

test("mobile browser layout has reachable navigation and no page-wide overflow", () => {
  assert.match(html, /href="styles\.css\?v=41"/);
  assert.match(css, /\.global-nav nav\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?bottom:/);
  assert.match(css, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /bottom:\s*calc\(78px \+ env\(safe-area-inset-bottom\)\)/);
});

test("English and Chinese navigation remain accessible to screen readers", () => {
  assert.match(html, /src="app\.js\?v=42"/);
  assert.match(html, /id="mobile-recommendation" role="status" aria-live="polite"/);
  assert.match(app, /"主要导航" : "Global navigation"/);
  assert.match(app, /"页面栏目" : "Page sections"/);
  assert.match(app, /"选择线路显示范围" : "Choose route catalog scope"/);
  assert.match(app, /"所选行程地图" : "Selected journey map"/);
  assert.match(app, /"附近站点查找范围" : "Nearby stop search radius"/);
});

test("parking freshness names an upstream DataSF delay instead of a failed site refresh", () => {
  assert.match(app, /timeliness_status === "DELAYED_SOURCE"/);
  assert.match(app, /DataSF 上游数据延迟 · 最新可用记录/);
  assert.match(app, /DataSF source delayed · latest available record/);
  assert.match(app, /timeliness_status: snapshot\.parking\?\.timeliness_status/);
});

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
  assert.match(html, /property="og:image:height" content="825"/);
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
