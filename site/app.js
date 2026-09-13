const I18N = {
  en: {
    navNetwork: "Network", navJourney: "Journey", navContext: "City context", refresh: "Reload latest snapshot",
    eyebrow: "San Francisco · right now", heroTitle: "Know your next move.",
    heroLead: "Live Muni movement, service spacing, street disruptions, and city context—distilled into one calm view.",
    viewNetwork: "View the network", howWorks: "How it works", vehiclesReporting: "vehicles reporting",
    routesObserved: "routes available", activeNotices: "active notices", liveNetwork: "Live network",
    seeCityMove: "See the city move.", focusRoute: "Focus a route", focusDirection: "Direction", mapHint: "Route shape, stops, and vehicles follow your selection.",
    routePulse: "Route pulse", vehicles: "Vehicles", medianGap: "Median predicted gap", bunching: "Bunching", serviceGaps: "Service gaps", currentSpeed: "Current speed", evidence: "Evidence",
    routeOverview: "Realtime highlights", directionNote: "Each direction is evaluated separately to avoid hiding one-sided disruption.",
    streetsService: "Streets + service", explainWhy: "Explain what may be changing the ride.",
    causalityNote: "Road overlap is treated as context—not proof of causation—until live transit evidence supports it.",
    serviceNotices: "Service notices", roadEvents: "Road events", journeyDecision: "Journey decision",
    whereGoing: "Where are you going?", plannerLead: "Choose two Muni stops. Public Beta estimates direct and one-transfer journeys from the latest cached evidence.",
    dynamicPlanner: "Estimated planner · Public Beta", fromStop: "From", toStop: "To", findRoute: "Find best route", tryExample: "Try an example trip",
    journeyMapHint: "Transit legs are solid; walking connections are dotted.", journeyTimeline: "Journey timeline",
    journeyReliability: "Journey reliability", journeySafety: "Journey safety context",
    threeWays: "Three ways to choose.", referenceCase: "Reference case", alternatives: "Alternatives",
    tradeoffs: "The trade-offs stay visible.", route: "Route", eta: "ETA", walk: "Walk", reliability: "Reliability",
    exposure: "Exposure context", cityContext: "City context", moreThanBus: "More than the bus.",
    parkingDemand: "Parking demand", safetyContext: "Safety context", dataQuality: "Data quality",
    methodEyebrow: "Method", evidenceTitle: "Evidence before confidence.",
    evidenceBody: "Travel time remains an estimate and is never altered by preference penalties. Public Beta exposes FASTEST and BALANCED; SAFETY-FIRST stays hidden until stop-level evidence can genuinely affect ranking.",
    collect: "Collect", collectBody: "Fetch official transit and city feeds on a controlled schedule.",
    normalize: "Normalize", normalizeBody: "Align identifiers, directions, timestamps, units, and freshness.",
    explain: "Explain", explainBody: "Publish observations, limitations, and decision reasons together.",
    footerNote: "An independent research prototype. Not an official SFMTA service.", reportIssue: "Report an issue"
  },
  zh: {
    navNetwork: "实时路网", navJourney: "行程选择", navContext: "城市背景", refresh: "重新载入最新快照",
    eyebrow: "旧金山 · 此时此刻", heroTitle: "清楚知道下一步怎么走。",
    heroLead: "把 Muni 实时移动、发车间隔、道路影响和城市背景，整理成一个安静、清楚的画面。",
    viewNetwork: "查看实时路网", howWorks: "了解计算方法", vehiclesReporting: "辆车正在回报",
    routesObserved: "条线路可选择", activeNotices: "条当前提示", liveNetwork: "实时路网",
    seeCityMove: "看见城市如何移动。", focusRoute: "聚焦一条线路", focusDirection: "方向", mapHint: "路线、站点和车辆都会跟随你的选择更新。",
    routePulse: "线路脉搏", vehicles: "车辆", medianGap: "预测班距中位数", bunching: "车辆聚集", serviceGaps: "服务缺口", currentSpeed: "当前速度", evidence: "证据量",
    routeOverview: "实时重点线路", directionNote: "两个方向分开计算，避免一个方向的问题被另一个方向掩盖。",
    streetsService: "道路与服务", explainWhy: "解释这趟车为什么可能正在变化。",
    causalityNote: "道路重叠只代表相关背景，不会在缺少实时交通证据时被当作延误原因。",
    serviceNotices: "服务提示", roadEvents: "道路事件", journeyDecision: "行程决策",
    whereGoing: "你想去哪里？", plannerLead: "选择两个 Muni 站点；Public Beta 会根据最新缓存证据估算直达与一次换乘方案。",
    dynamicPlanner: "估算行程规划 · Public Beta", fromStop: "从哪里出发", toStop: "到哪里", findRoute: "寻找最佳路线", tryExample: "试用示例行程",
    journeyMapHint: "实线是公交路段，虚线是步行连接。", journeyTimeline: "行程步骤",
    journeyReliability: "行程可靠性", journeySafety: "行程安全背景",
    threeWays: "用三种方式做选择。", referenceCase: "固定验证案例", alternatives: "其他方案",
    tradeoffs: "把每个取舍清清楚楚地摆出来。", route: "线路", eta: "到达时间", walk: "步行", reliability: "稳定度",
    exposure: "相对暴露背景", cityContext: "城市背景", moreThanBus: "不只看公交。",
    parkingDemand: "停车需求", safetyContext: "安全背景", dataQuality: "数据质量",
    methodEyebrow: "计算方法", evidenceTitle: "先看证据，再谈信心。",
    evidenceBody: "行程时间始终明确标为估算值，也不会被偏好惩罚修改。Public Beta 只开放 FASTEST 与 BALANCED；在站点级安全证据真正参与排序前，SAFETY-FIRST 暂不展示。",
    collect: "获取", collectBody: "按照受控频率获取官方交通与城市数据。",
    normalize: "标准化", normalizeBody: "统一 ID、方向、时区、单位和数据新鲜度。",
    explain: "解释", explainBody: "把观测结果、限制条件和推荐原因一起发布。",
    footerNote: "独立研究原型，并非 SFMTA 官方服务。", reportIssue: "报告问题"
  }
};

let language = localStorage.getItem("sf-transit-language") || "en";
let snapshot = null;
let network = null;
let map = null;
let mapLayers = {};
let journeyMap = null;
let journeyLayer = null;
let stopSearchIndex = new Map();
let plannerStops = [];
const stopSearchTimers = new Map();
const stopSearchTokens = new Map();
const PLANNER_API_BASE = String(window.SF_TRANSIT_API_BASE || "").replace(/\/$/, "");
const appState = {
  selectedRoute: "all",
  selectedDirection: "all",
  routeScope: "evidence",
  layers: {vehicles:true, route:true, stops:false, issues:true, roads:false},
  selectedMode: "BALANCED",
  selectedJourneyId: null,
  plannerResult: null,
  plannerRequestKey: null
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
const hasNumber = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const fmt = (value, digits = 0) => hasNumber(value) ? Number(value).toFixed(digits) : "—";

function timeAgo(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return language === "zh" ? "时间不可用" : "time unavailable";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return language === "zh" ? "不到 1 分钟前" : "less than 1 min ago";
  if (minutes < 120) return `${minutes} ${language === "zh" ? "分钟前" : "min ago"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} ${language === "zh" ? "小时前" : "hours ago"}`;
  const days = Math.round(hours / 24);
  return `${days} ${language === "zh" ? "天前" : "days ago"}`;
}

function setLanguage(next) {
  language = next;
  localStorage.setItem("sf-transit-language", language);
  document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
  document.querySelectorAll("[data-i18n]").forEach(node => {
    const key = node.dataset.i18n;
    if (I18N[language][key]) node.textContent = I18N[language][key];
  });
  document.getElementById("language-toggle").textContent = language === "en" ? "中文" : "EN";
}

function initMap() {
  if (!window.L) return;
  map = L.map("map", { zoomControl: true, scrollWheelZoom: false }).setView([37.7749, -122.4194], 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  mapLayers = {
    route: L.layerGroup(),
    stops: L.layerGroup(),
    vehicles: L.layerGroup(),
    issues: L.layerGroup(),
    roads: L.layerGroup()
  };
  syncMapLayers();
}

function syncMapLayers() {
  if (!map) return;
  Object.entries(mapLayers).forEach(([name, layer]) => {
    const visible = Boolean(appState.layers[name]);
    if (visible && !map.hasLayer(layer)) layer.addTo(map);
    if (!visible && map.hasLayer(layer)) map.removeLayer(layer);
  });
}

function initJourneyMap() {
  if (!window.L || journeyMap) return;
  journeyMap = L.map("journey-map", { zoomControl: true, scrollWheelZoom: false }).setView([37.7749, -122.4194], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(journeyMap);
  journeyLayer = L.layerGroup().addTo(journeyMap);
}

function healthCopy(health) {
  const key = String(health || "NO_DATA");
  const en = {STABLE:"Stable service", WATCH:"Watch service spacing", UNSTABLE:"Service currently unstable", LIMITED_REALTIME_DATA:"Limited realtime evidence", NO_DATA:"No current evidence"};
  const zh = {STABLE:"服务目前稳定", WATCH:"班距需要留意", UNSTABLE:"服务目前不稳定", LIMITED_REALTIME_DATA:"实时证据有限", NO_DATA:"暂无当前证据"};
  return (language === "zh" ? zh : en)[key] || key.replaceAll("_", " ");
}

function qualityCopy(value) {
  const key = String(value || "LIMITED");
  const en = {GOOD:"Strong", MODERATE:"Moderate", LIMITED:"Limited"};
  const zh = {GOOD:"充足", MODERATE:"中等", LIMITED:"有限"};
  return (language === "zh" ? zh : en)[key] || key;
}

function transitSource() {
  const declared = snapshot?.meta?.source_status?.transit || {};
  const containsDemoIds = (snapshot?.vehicles || []).some(row => String(row.vehicle_id || "").startsWith("demo-"));
  const status = declared.status || (containsDemoIds ? "retained_sample" : snapshot?.meta?.status === "live" ? "live" : "retained");
  return {status, observed_at: declared.observed_at || null, isLive: status === "live", isSample: status === "retained_sample" || containsDemoIds};
}

function coverageSummary() {
  const rows = snapshot?.routes || [];
  const uniqueDirections = new Map();
  rows.forEach(row => uniqueDirections.set(`${row.route_id}|${row.direction_id}`, row));
  const directions = [...uniqueDirections.values()];
  const totalRoutes = Number(network?.meta?.route_count || 0);
  const totalDirections = Number(network?.meta?.route_direction_count || 0);
  const routesWithEvidence = new Set(directions.map(row => String(row.route_id))).size;
  const healthCounts = {STABLE:0, WATCH:0, UNSTABLE:0, LIMITED_REALTIME_DATA:0, NO_DATA:0};
  directions.forEach(row => { healthCounts[row.health] = Number(healthCounts[row.health] || 0) + 1; });
  return {
    totalRoutes,
    totalDirections,
    routesWithEvidence,
    directionsWithEvidence: directions.length,
    noData: Math.max(0, totalDirections - directions.length),
    healthCounts,
    issues: healthCounts.WATCH + healthCounts.UNSTABLE
  };
}

function renderMeta() {
  const meta = snapshot.meta || {};
  const generated = meta.generated_at ? new Date(meta.generated_at) : null;
  const transit = transitSource();
  const sourceLabel = transit.isLive ? (language === "zh" ? "511 实时交通快照" : "Live 511 transit snapshot") :
    transit.isSample ? (language === "zh" ? "保留的演示交通样本 · 非当前车队" : "Retained transit sample · not the current fleet") :
    (language === "zh" ? "保留的交通快照 · 当前未刷新" : "Retained transit snapshot · not freshly updated");
  const transitAge = transit.observed_at ? ` · ${timeAgo(transit.observed_at)}` : "";
  document.getElementById("freshness-label").textContent = sourceLabel + transitAge;
  document.getElementById("generated-at").textContent = generated ? `${language === "zh" ? "生成时间" : "Generated"}: ${generated.toLocaleString()}` : "Snapshot time unavailable";
  document.getElementById("quality-status").textContent = sourceLabel;
  const failures = meta.errors || [];
  document.getElementById("quality-detail").textContent = failures.length ?
    (language === "zh" ? `${failures.length} 个数据源警告。保留值和演示样本均明确标注，不会冒充实时数据。` : `${failures.length} source warning${failures.length === 1 ? "" : "s"}. Retained values and samples are labeled instead of presented as live.`) :
    (language === "zh" ? "本次快照的所有已配置数据源均完成检查。" : "All configured source checks completed for this snapshot.");
  const transitFreshness = transit.observed_at ? timeAgo(transit.observed_at) : (transit.isSample ? (language === "zh" ? "演示样本 · 时间不可用" : "sample · source time unavailable") : (language === "zh" ? "来源时间不可用" : "source time unavailable"));
  const freshnessRows = [
    [language === "zh" ? "车辆与班距" : "Vehicles + headways", transitFreshness],
    [language === "zh" ? "静态路网" : "Static network", network?.meta?.feed_version ? `${language === "zh" ? "版本" : "version"} ${network.meta.feed_version}` : "—"],
    [language === "zh" ? "停车数据" : "Parking", timeAgo(snapshot.parking?.source_snapshot_time)],
    [language === "zh" ? "安全背景" : "Safety context", snapshot.safety?.status || "—"]
  ];
  document.getElementById("source-freshness").innerHTML = freshnessRows.map(([label,value]) => `<div class="evidence-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function renderHero() {
  const coverage = coverageSummary();
  const transit = transitSource();
  document.getElementById("vehicle-count").textContent = fmt((snapshot.vehicles || []).length);
  document.getElementById("route-count").textContent = `${coverage.routesWithEvidence} / ${coverage.totalRoutes || "—"}`;
  document.getElementById("direction-count").textContent = `${coverage.directionsWithEvidence} / ${coverage.totalDirections || "—"}`;
  document.getElementById("issue-count").textContent = fmt(coverage.issues);
  document.getElementById("vehicle-count-label").textContent = transit.isLive ? (language === "zh" ? "个实时车辆位置" : "live vehicle positions") : (language === "zh" ? "个样本车辆位置" : "sample vehicle positions");
  document.getElementById("route-count-label").textContent = transit.isLive ? (language === "zh" ? "条线路有实时证据" : "routes with realtime evidence") : (language === "zh" ? "条线路有样本证据" : "routes represented in sample");
  document.getElementById("direction-count-label").textContent = language === "zh" ? "个方向有证据" : "directions with evidence";
  document.getElementById("issue-count-label").textContent = language === "zh" ? "个方向需要留意" : "directions to watch";
  const overviewTitle = document.querySelector('[data-i18n="routeOverview"]');
  if (overviewTitle) overviewTitle.textContent = transit.isLive ? (language === "zh" ? "实时重点线路" : "Realtime highlights") : (language === "zh" ? "样本线路明细" : "Sample route details");
}

function renderRouteSelector() {
  const select = document.getElementById("route-select");
  const evidenceRouteIds = new Set((snapshot.routes || []).map(row => String(row.route_id)));
  const allRoutes = network?.routes || [];
  const routes = appState.routeScope === "evidence" ? allRoutes.filter(route => evidenceRouteIds.has(String(route.route_id))) : allRoutes;
  const overviewLabel = language === "zh" ? "全网概览" : "Network overview";
  select.innerHTML = `<option value="all">${overviewLabel}</option>` + routes.map(route => {
    const shortName = route.route_short_name || route.route_id;
    const longName = route.route_long_name ? ` — ${route.route_long_name}` : "";
    return `<option value="${escapeHtml(route.route_id)}">${escapeHtml(shortName + longName)}</option>`;
  }).join("");
  if (!routes.some(route => String(route.route_id) === String(appState.selectedRoute))) {
    appState.selectedRoute = "all";
  }
  select.value = appState.selectedRoute;
  document.querySelectorAll(".scope-button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scope === appState.routeScope)));
  document.getElementById("evidence-routes-button").textContent = transitSource().isLive ? (language === "zh" ? "当前有回报" : "Reporting now") : (language === "zh" ? "有快照证据" : "With snapshot evidence");
  document.getElementById("all-routes-button").textContent = language === "zh" ? "全部 Muni 线路" : "All Muni routes";
  const layerLabels = {
    vehicles: language === "zh" ? "车辆" : "Vehicles",
    route: language === "zh" ? "路线轨迹" : "Route shape",
    stops: language === "zh" ? "站点" : "Stops",
    issues: language === "zh" ? "班距异常" : "Spacing issues",
    roads: language === "zh" ? "道路事件" : "Road events"
  };
  const legend = document.querySelector("#map-layer-control legend");
  if (legend) legend.textContent = language === "zh" ? "地图图层" : "Layers";
  document.querySelectorAll("#map-layer-control input[data-layer]").forEach(input => {
    const label = input.parentElement?.querySelector("span");
    if (label) label.textContent = layerLabels[input.dataset.layer] || input.dataset.layer;
  });
}

function routeCatalogEntry(routeId) {
  return (network?.routes || []).find(route => String(route.route_id) === String(routeId)) || null;
}

function renderDirectionSelector() {
  const select = document.getElementById("direction-select");
  const directions = routeCatalogEntry(appState.selectedRoute)?.directions || [];
  select.disabled = appState.selectedRoute === "all" || !directions.length;
  select.innerHTML = `<option value="all">${language === "zh" ? "全部方向" : "All directions"}</option>` + directions.map(direction => {
    const headsign = direction.headsign ? ` · ${direction.headsign}` : "";
    return `<option value="${escapeHtml(direction.direction_id)}">${escapeHtml(direction.direction_label + headsign)}</option>`;
  }).join("");
  if (!directions.some(direction => String(direction.direction_id) === String(appState.selectedDirection))) {
    appState.selectedDirection = "all";
  }
  select.value = appState.selectedDirection;
}

function directionEntries(routeId, directionId = "all") {
  if (routeId === "all") return [];
  return (routeCatalogEntry(routeId)?.directions || [])
    .filter(direction => directionId === "all" || String(direction.direction_id) === String(directionId))
    .map(direction => network?.route_directions?.[`${routeId}|${direction.direction_id}`])
    .filter(Boolean);
}

function selectionMatches(row, routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  return (routeId === "all" || String(row.route_id) === String(routeId)) &&
    (directionId === "all" || String(row.direction_id) === String(directionId));
}

function renderMap(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  if (!map || !Object.keys(mapLayers).length) return;
  Object.values(mapLayers).forEach(layer => layer.clearLayers());
  const bounds = [];

  const details = directionEntries(routeId, directionId);
  details.forEach(detail => {
    const shape = (detail.shape || []).filter(point => Array.isArray(point) && point.length === 2);
    if (shape.length > 1) {
      L.polyline(shape, {
        color: "#0066cc",
        weight: 5,
        opacity: .88,
        lineJoin: "round"
      }).addTo(mapLayers.route);
      bounds.push(...shape);
    }
  });

  const seenStops = new Set();
  details.forEach(detail => (detail.stops || []).forEach(stop => {
    if (!hasNumber(stop.lat) || !hasNumber(stop.lon)) return;
    const key = `${Number(stop.lat).toFixed(5)}|${Number(stop.lon).toFixed(5)}`;
    if (seenStops.has(key)) return;
    seenStops.add(key);
    L.circleMarker([Number(stop.lat), Number(stop.lon)], {
      radius: 3,
      color: "#1d1d1f",
      weight: 1,
      fillColor: "#ffffff",
      fillOpacity: 1
    })
      .bindPopup(`<strong>${escapeHtml(stop.name || "Muni stop")}</strong><br>${escapeHtml(stop.stop_id || "")}`)
      .addTo(mapLayers.stops);
  }));

  const vehicles = (snapshot.vehicles || []).filter(vehicle => selectionMatches(vehicle, routeId, directionId));
  vehicles.forEach(vehicle => {
    if (!hasNumber(vehicle.lat) || !hasNumber(vehicle.lon)) return;
    const point = [Number(vehicle.lat), Number(vehicle.lon)];
    bounds.push(point);
    const routeDetail = directionEntries(String(vehicle.route_id), String(vehicle.direction_id))[0];
    const routeHealth = (snapshot.routes || []).find(row => selectionMatches(row, String(vehicle.route_id), String(vehicle.direction_id)))?.health || "NO_DATA";
    const destination = vehicle.destination || routeDetail?.headsign || (language === "zh" ? "终点信息不可用" : "destination unavailable");
    const speed = hasNumber(vehicle.speed_mps) ? `${fmt(Number(vehicle.speed_mps) * 2.23694, 1)} mph` : (language === "zh" ? "未回报" : "not reported");
    const sampleLabel = transitSource().isSample ? `<br><span class="event-scope">${language === "zh" ? "演示样本" : "sample record"}</span>` : "";
    L.circleMarker(point, {radius: 6, color: "#ffffff", weight: 2, fillColor: "#0066cc", fillOpacity: .98})
      .bindPopup(`<div class="vehicle-popup"><strong>${language === "zh" ? "线路" : "Route"} ${escapeHtml(vehicle.route_id || "—")}</strong>${sampleLabel}<br>→ ${escapeHtml(destination)}<br>${language === "zh" ? "车辆" : "Vehicle"} ${escapeHtml(vehicle.vehicle_id || "—")}<br>${language === "zh" ? "速度" : "Speed"}: ${escapeHtml(speed)}<br>${language === "zh" ? "上次回报" : "Last report"}: ${hasNumber(vehicle.age_seconds) ? `${fmt(vehicle.age_seconds)} sec ago` : "—"}<br>${language === "zh" ? "线路状态" : "Route health"}: ${escapeHtml(healthCopy(routeHealth))}</div>`)
      .addTo(mapLayers.vehicles);
  });

  const issueRows = (snapshot.routes || []).filter(row => selectionMatches(row, routeId, directionId));
  issueRows.flatMap(row => (row.spacing_events || []).map(event => ({...event, route_id:row.route_id, direction_id:row.direction_id}))).forEach(event => {
    if (!hasNumber(event.lat) || !hasNumber(event.lon)) return;
    const point = [Number(event.lat), Number(event.lon)];
    const label = event.type === "BUNCHING" ? (language === "zh" ? "车辆聚集" : "Bunching") : (language === "zh" ? "服务缺口" : "Service gap");
    L.circleMarker(point, {radius: 8, color: "#ffffff", weight: 2, fillColor: "#ff9500", fillOpacity: 1})
      .bindPopup(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(event.location_name || event.reference_stop_id || "Observation point")}<br>${fmt(event.gap_min,1)} min ${language === "zh" ? "预测间隔" : "predicted spacing"}`)
      .addTo(mapLayers.issues);
  });

  (snapshot.road_events || []).filter(event => routeId === "all" || !(event.route_ids || []).length || (event.route_ids || []).map(String).includes(String(routeId))).forEach(event => {
    if (!hasNumber(event.lat) || !hasNumber(event.lon)) return;
    L.circleMarker([Number(event.lat), Number(event.lon)], {radius: 7, color: "#ffffff", weight: 2, fillColor: "#8e44ad", fillOpacity: 1})
      .bindPopup(`<strong>${escapeHtml(event.title || "Road event")}</strong><br>${escapeHtml(event.description || "")}`)
      .addTo(mapLayers.roads);
  });

  syncMapLayers();

  if (bounds.length === 1) map.setView(bounds[0], 14);
  else if (bounds.length > 1) map.fitBounds(bounds, {padding:[34,34], maxZoom:14});
  else map.setView([37.7749, -122.4194], 12);

  const direction = routeCatalogEntry(routeId)?.directions?.find(item => String(item.direction_id) === String(directionId));
  const directionLabel = direction ? ` · ${direction.direction_label}${direction.headsign ? ` → ${direction.headsign}` : ""}` : "";
  document.getElementById("map-label").textContent = routeId === "all" ?
    (language === "zh" ? "全部回报车辆" : "All reporting vehicles") :
    `${language === "zh" ? "线路" : "Route"} ${routeId}${directionLabel}`;
}

function median(values) {
  const ordered = values.map(Number).filter(Number.isFinite).sort((a,b) => a-b);
  if (!ordered.length) return null;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function combinedRoute(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const rows = (snapshot.routes || []).filter(row => selectionMatches(row, routeId, directionId));
  const vehicles = (snapshot.vehicles || []).filter(vehicle => selectionMatches(vehicle, routeId, directionId));
  const severity = {UNSTABLE:3, WATCH:2, LIMITED_REALTIME_DATA:1, NO_DATA:0, STABLE:0};
  const qualityScore = {GOOD:3, MODERATE:2, LIMITED:1};
  const evidenceQuality = rows.map(row => row.evidence_quality).filter(Boolean).sort((a,b)=>(qualityScore[b]||0)-(qualityScore[a]||0))[0] || "LIMITED";
  return {
    health: rows.length ? rows.slice().sort((a,b)=>(severity[b.health]||0)-(severity[a.health]||0))[0].health : "NO_DATA",
    live_position_count: vehicles.length,
    median_headway_min: median(rows.map(row => row.median_headway_min)),
    bunching_events: rows.reduce((sum,row)=>sum+Number(row.bunching_events || 0),0),
    service_gap_events: rows.reduce((sum,row)=>sum+Number(row.large_gap_events || 0),0),
    severe_gap_events: rows.reduce((sum,row)=>sum+Number(row.severe_gap_events || 0),0),
    speed_mph: median(vehicles.map(vehicle => Number(vehicle.speed_mps) * 2.23694)),
    evidence_count: rows.reduce((sum,row)=>sum+Number(row.predictions_observed || 0),0),
    evidence_quality: evidenceQuality,
    spacing_events: rows.flatMap(row => (row.spacing_events || []).map(event => ({...event, route_id:row.route_id, direction_id:row.direction_id})))
  };
}

function metricRow(label, value, subtext = "") {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}${subtext ? `<span class="metric-subtext">${escapeHtml(subtext)}</span>` : ""}</dd></div>`;
}

function routeAdvice(health, evidenceCount) {
  if (!evidenceCount || health === "NO_DATA") {
    return {code:"NO_CURRENT_GUIDANCE", label:language === "zh" ? "先查看时刻与提示" : "Check schedule and notices"};
  }
  if (health === "UNSTABLE") {
    return {code:"ALLOW_EXTRA", label:language === "zh" ? "建议预留额外时间" : "Allow extra time"};
  }
  if (["WATCH", "LIMITED_REALTIME_DATA"].includes(health)) {
    return {code:"CHECK", label:language === "zh" ? "出发前再次查看" : "Check again before leaving"};
  }
  return {code:"USE_NORMALLY", label:language === "zh" ? "可按通常方式使用" : "Use normally"};
}

function renderIssueDetails(events, hasIssueCount) {
  const container = document.getElementById("focus-issues");
  if (!events.length) {
    container.innerHTML = hasIssueCount ? `<div class="issue-card"><strong>${language === "zh" ? "已检测到间隔异常" : "Spacing issue detected"}</strong><span>${language === "zh" ? "当前快照没有提供可定位的事件明细。" : "This snapshot does not include a locatable event record."}</span></div>` : "";
    return;
  }
  container.innerHTML = events.slice(0,4).map(event => {
    const label = event.type === "BUNCHING" ? (language === "zh" ? "车辆聚集" : "Bunching") : (language === "zh" ? "服务缺口" : "Service gap");
    const location = event.location_name || event.reference_stop_id || (language === "zh" ? "位置尚不可用" : "location unavailable");
    const detail = `${hasNumber(event.gap_min) ? `${fmt(event.gap_min,1)} min · ` : ""}${location}`;
    const canLocate = hasNumber(event.lat) && hasNumber(event.lon);
    return `<${canLocate ? "button type=\"button\"" : "div"} class="issue-card" ${canLocate ? `data-lat="${escapeHtml(event.lat)}" data-lon="${escapeHtml(event.lon)}"` : ""}><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}${canLocate ? ` · ${language === "zh" ? "点击定位" : "Locate on map"}` : ""}</span></${canLocate ? "button" : "div"}>`;
  }).join("");
  container.querySelectorAll("button[data-lat][data-lon]").forEach(button => button.addEventListener("click", () => {
    appState.layers.issues = true;
    const toggle = document.querySelector('[data-layer="issues"]');
    if (toggle) toggle.checked = true;
    syncMapLayers();
    map.setView([Number(button.dataset.lat), Number(button.dataset.lon)], 16);
  }));
}

function renderRouteFocus(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const route = routeCatalogEntry(routeId);
  const direction = route?.directions?.find(item => String(item.direction_id) === String(directionId));
  const routeName = route ? `${route.route_short_name || route.route_id}${route.route_long_name ? ` ${route.route_long_name}` : ""}` : "";
  const directionName = direction ? ` · ${direction.direction_label}${direction.headsign ? ` → ${direction.headsign}` : ""}` : "";
  const metrics = document.getElementById("focus-metrics");
  document.getElementById("focus-route-name").textContent = routeId === "all" ? (language === "zh" ? "全网覆盖概览" : "Network coverage overview") : `${routeName}${directionName}`;

  if (routeId === "all") {
    const coverage = coverageSummary();
    const sampleNote = transitSource().isLive ? "" : (language === "zh" ? "（当前为保留样本）" : " (retained sample)");
    document.getElementById("focus-route-status").textContent = language === "zh" ? `分别显示各方向状态，不用最差一条线路代表全网${sampleNote}` : `Direction-by-direction status; one troubled route does not define the network${sampleNote}`;
    metrics.innerHTML = [
      metricRow(language === "zh" ? "地图车辆位置" : "Vehicle positions on map", fmt((snapshot.vehicles || []).length), transitSource().isSample ? (language === "zh" ? "演示记录" : "sample records") : ""),
      metricRow(language === "zh" ? "有证据线路" : "Routes with evidence", `${coverage.routesWithEvidence} / ${coverage.totalRoutes}`),
      metricRow(language === "zh" ? "已覆盖方向" : "Directions represented", `${coverage.directionsWithEvidence} / ${coverage.totalDirections}`),
      metricRow(language === "zh" ? "稳定" : "Stable", fmt(coverage.healthCounts.STABLE)),
      metricRow(language === "zh" ? "需留意" : "Watch", fmt(coverage.healthCounts.WATCH)),
      metricRow(language === "zh" ? "不稳定" : "Unstable", fmt(coverage.healthCounts.UNSTABLE)),
      metricRow(language === "zh" ? "无方向级快照" : "No route-direction snapshot", fmt(coverage.noData))
    ].join("");
    document.getElementById("focus-issues").innerHTML = "";
    document.getElementById("focus-explanation").textContent = language === "zh" ?
      "这里展示的是数据覆盖率和各方向分布，不是对整个 Muni 系统下一个单一健康结论。未出现的线路表示当前快照没有证据，并不表示没有运营。" :
      "This view reports coverage and a direction-level distribution, not a single verdict on all of Muni. A missing route means no evidence in this snapshot—not no service.";
    return;
  }

  const data = combinedRoute(routeId, directionId);
  const advice = routeAdvice(data.health, data.evidence_count);
  const positionLabel = transitSource().isSample ? (language === "zh" ? "样本位置" : "Sample positions") : (language === "zh" ? "地图实时车辆" : "Live positions on map");
  document.getElementById("focus-route-status").textContent = healthCopy(data.health);
  metrics.innerHTML = [
    metricRow(language === "zh" ? "此刻建议" : "Right-now guidance", advice.label, advice.code),
    metricRow(positionLabel, fmt(data.live_position_count), transitSource().isSample ? (language === "zh" ? "不是当前车队数量" : "not a current fleet count") : ""),
    metricRow(language === "zh" ? "预测证据" : "Predictions observed", fmt(data.evidence_count), qualityCopy(data.evidence_quality)),
    metricRow(language === "zh" ? "预测班距中位数" : "Median predicted spacing", Number.isFinite(data.median_headway_min) ? `${fmt(data.median_headway_min,1)} min` : "—"),
    metricRow(language === "zh" ? "车辆聚集事件" : "Bunching events", data.bunching_events ? (language === "zh" ? `检测到 ${data.bunching_events} 个` : `${data.bunching_events} detected`) : (language === "zh" ? "未检测到" : "None detected")),
    metricRow(language === "zh" ? "服务缺口事件" : "Service-gap events", data.service_gap_events ? `${data.service_gap_events}${data.severe_gap_events ? (language === "zh" ? ` · ${data.severe_gap_events} 个严重缺口` : ` · ${data.severe_gap_events} severe`) : ""}` : (language === "zh" ? "未检测到" : "None detected")),
    metricRow(language === "zh" ? "已回报位置速度中位数" : "Median reported position speed", Number.isFinite(data.speed_mph) ? `${fmt(data.speed_mph,1)} mph` : (language === "zh" ? "未回报" : "not reported"))
  ].join("");
  renderIssueDetails(data.spacing_events, data.bunching_events + data.service_gap_events > 0);
  document.getElementById("focus-explanation").textContent = language === "zh" ?
    `当前查看 ${routeId}${direction ? ` 的 ${direction.direction_label}` : " 的全部方向"}。车辆位置和预测证据分开计数；健康度按 route + direction 计算。` :
    `Viewing ${routeId}${direction ? ` ${direction.direction_label}` : " across directions"}. Vehicle positions and prediction evidence are counted separately; health remains route + direction specific.`;
}

function renderRouteGrid() {
  const rows = (snapshot.routes || []).slice().sort((a,b) => Number(b.predictions_observed || 0)-Number(a.predictions_observed || 0)).slice(0,12);
  const grid = document.getElementById("route-grid");
  const note = transitSource().isLive ? "" : `<p class="coverage-note">${language === "zh" ? "下列卡片来自保留的演示交通样本，不代表当前车队或当前服务。" : "The cards below use a retained transit sample; they do not represent the current fleet or current service."}</p>`;
  grid.innerHTML = note + (rows.length ? rows.map(row => {
    const positions = (snapshot.vehicles || []).filter(vehicle => selectionMatches(vehicle, row.route_id, row.direction_id)).length;
    return `
    <article class="route-card" tabindex="0" role="button" data-route="${escapeHtml(row.route_id)}" data-direction="${escapeHtml(row.direction_id)}" aria-pressed="${String(row.route_id) === String(appState.selectedRoute) && String(row.direction_id) === String(appState.selectedDirection)}" aria-label="Focus route ${escapeHtml(row.route_id)} direction ${escapeHtml(row.direction_id)}">
      <span class="route-number">${escapeHtml(row.route_id)}</span>
      <span class="direction">${escapeHtml(row.direction_label || `direction ${row.direction_id ?? "—"}`)}</span>
      <p class="health">${escapeHtml(healthCopy(row.health))}</p>
      <p class="detail">${positions} ${language === "zh" ? "个地图位置" : "map positions"} · ${fmt(row.predictions_observed)} ${language === "zh" ? "条预测证据" : "predictions"}<br>${hasNumber(row.median_headway_min) ? `${fmt(row.median_headway_min,1)} min ${language === "zh" ? "中位班距" : "median spacing"}` : (language === "zh" ? "班距证据有限" : "limited spacing evidence")}</p>
      <span class="card-action">${language === "zh" ? "查看线路 →" : "View route →"}</span>
    </article>`;
  }).join("") : `<p>${language === "zh" ? "当前没有线路级实时数据。" : "No route-level realtime data is available."}</p>`);
  grid.querySelectorAll(".route-card").forEach(card => {
    const select = () => selectRoute(card.dataset.route, card.dataset.direction, true);
    card.addEventListener("click", select);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }});
  });
}

function renderEvents(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const list = (id, events, emptyText) => {
    document.getElementById(id).innerHTML = events.length ? events.slice(0,5).map(item => {
      const ids = normalizedRouteIds(item);
      const scope = ids.length ? `${language === "zh" ? "线路" : "Route"} ${ids.join(", ")}` : (item.route_match_status === "UNAVAILABLE" ? (language === "zh" ? "路线匹配不可用 · 仅作全网背景" : "Route match unavailable · network context") : (language === "zh" ? "全网提示" : "Network-wide notice"));
      return `<article class="event-item"><span class="event-scope">${escapeHtml(scope)}</span><strong>${escapeHtml(item.title || item.route_id || "Notice")}</strong><p>${escapeHtml(item.description || item.status || "Current context available.")}</p></article>`;
    }).join("") : `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  };
  const normalizedRouteIds = item => {
    const explicit = (item.route_ids || []).map(String).filter(Boolean);
    if (explicit.length) return explicit;
    const legacy = String(item.title || "").match(/^Route\s+([^ ·:]+)/i);
    return legacy ? [legacy[1]] : [];
  };
  const matchesRoute = item => {
    if (routeId === "all") return true;
    const ids = normalizedRouteIds(item);
    if (!ids.length) return true;
    if (!ids.includes(String(routeId))) return false;
    return directionId === "all" || item.direction_id === undefined || item.direction_id === null || String(item.direction_id) === String(directionId);
  };
  const alerts = (snapshot.alerts || []).filter(matchesRoute);
  const roads = (snapshot.road_events || []).filter(matchesRoute);
  list(
    "alert-list",
    alerts,
    language === "zh" ? `当前没有与 ${routeId === "all" ? "全网" : routeId} 匹配的服务提示。` : `No service notices matched ${routeId === "all" ? "the network" : routeId}.`
  );
  list(
    "road-list",
    roads,
    language === "zh" ? `当前没有与 ${routeId === "all" ? "全网" : routeId} 匹配的道路事件。` : `No route-matched road events for ${routeId === "all" ? "the network" : routeId}.`
  );
}

function allPlannerStops() {
  const unique = new Map();
  const patterns = network?.patterns || network?.route_directions || {};
  Object.values(patterns).forEach(direction => {
    (direction.stops || []).forEach(stop => {
      if (!stop.stop_id || unique.has(String(stop.stop_id))) return;
      unique.set(String(stop.stop_id), {...stop, stop_id: String(stop.stop_id)});
    });
  });
  return [...unique.values()].sort((a,b) => String(a.name).localeCompare(String(b.name)) || String(a.stop_id).localeCompare(String(b.stop_id)));
}

function stopLabel(stop) {
  return stop ? `${stop.name || "Muni stop"} · ${stop.stop_id}` : "";
}

function renderStopOptions() {
  plannerStops = allPlannerStops();
  stopSearchIndex = new Map();
  plannerStops.forEach(stop => {
    stopSearchIndex.set(stopLabel(stop), stop.stop_id);
    stopSearchIndex.set(stop.stop_id, stop.stop_id);
  });
}

function localStopMatches(query, limit = 12) {
  const folded = query.trim().toLocaleLowerCase();
  if (folded.length < 2) return [];
  return plannerStops
    .filter(stop => String(stop.name || "").toLocaleLowerCase().includes(folded) || String(stop.stop_id).includes(folded))
    .slice(0, limit);
}

function renderStopSuggestions(input, list, rows) {
  const unique = new Map();
  rows.forEach(stop => {
    const normalized = {...stop, stop_id: String(stop.stop_id)};
    if (!normalized.stop_id || unique.has(normalized.stop_id)) return;
    unique.set(normalized.stop_id, normalized);
    stopSearchIndex.set(stopLabel(normalized), normalized.stop_id);
    stopSearchIndex.set(normalized.stop_id, normalized.stop_id);
  });
  const suggestions = [...unique.values()].slice(0, 12);
  list.innerHTML = suggestions.map(stop => `
    <button type="button" role="option" data-stop-id="${escapeHtml(stop.stop_id)}" data-stop-label="${escapeHtml(stopLabel(stop))}">
      <strong>${escapeHtml(stop.name || "Muni stop")}</strong>
      <span>${escapeHtml((stop.route_ids || []).slice(0, 6).join(" · ") || `Stop ${stop.stop_id}`)}</span>
    </button>`).join("");
  list.hidden = suggestions.length === 0;
  input.setAttribute("aria-expanded", String(suggestions.length > 0));
  list.querySelectorAll("button[data-stop-id]").forEach(option => option.addEventListener("mousedown", event => {
    event.preventDefault();
    input.value = option.dataset.stopLabel;
    stopSearchIndex.set(input.value, option.dataset.stopId);
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }));
}

function scheduleStopSearch(input, list) {
  const query = input.value.trim();
  const timer = stopSearchTimers.get(input.id);
  if (timer) clearTimeout(timer);
  if (query.length < 2) {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    return;
  }
  renderStopSuggestions(input, list, localStopMatches(query));
  const token = (stopSearchTokens.get(input.id) || 0) + 1;
  stopSearchTokens.set(input.id, token);
  stopSearchTimers.set(input.id, setTimeout(async () => {
    if (!PLANNER_API_BASE) return;
    try {
      const response = await fetch(`${PLANNER_API_BASE}/stops?q=${encodeURIComponent(query)}&limit=12`);
      if (!response.ok) return;
      const payload = await response.json();
      if (stopSearchTokens.get(input.id) === token && input.value.trim() === query) {
        renderStopSuggestions(input, list, payload.stops || []);
      }
    } catch (_) {
      // Local GTFS search remains available while the free beta API wakes up.
    }
  }, 300));
}

function resolveStopInput(value) {
  const exact = stopSearchIndex.get(String(value).trim());
  if (exact) return exact;
  const idMatch = String(value).match(/·\s*([^·]+)\s*$/);
  return idMatch && stopSearchIndex.has(idMatch[1].trim()) ? idMatch[1].trim() : null;
}

function setPlannerStatus(message = "", isError = false) {
  const status = document.getElementById("planner-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function setPlannerError(message) {
  const status = document.getElementById("planner-status");
  status.replaceChildren();
  status.classList.add("error");
  status.append(document.createTextNode(message));
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "planner-retry";
  retry.textContent = language === "zh" ? "重试" : "Retry";
  retry.addEventListener("click", () => planTrip());
  status.append(retry);
}

function selectedJourney() {
  const alternatives = appState.plannerResult?.alternatives || [];
  return alternatives.find(row => row.journey_id === appState.selectedJourneyId) || alternatives[0] || null;
}

function renderModeCards(modes) {
  const grid = document.getElementById("mode-grid");
  const safetyReady = appState.plannerResult?.meta?.safety_status === "STOP_LEVEL_LIVE";
  const visibleModes = modes.filter(mode => mode.mode !== "SAFETY_FIRST" || safetyReady);
  grid.dataset.modeCount = String(visibleModes.length);
  grid.innerHTML = visibleModes.map(mode => `
    <button type="button" class="mode-card" data-mode="${escapeHtml(mode.mode)}" aria-pressed="${mode.mode === appState.selectedMode}">
      <span class="mode-label">${escapeHtml(mode.mode.replaceAll("_", "-"))}${mode.mode === "BALANCED" ? (language === "zh" ? " · 默认" : " · Default") : ""}</span>
      <p class="mode-route">${escapeHtml(mode.route || "—")}</p>
      <p class="mode-eta">${fmt(mode.eta_min,1)} min</p>
      <p>${escapeHtml(mode.explanation || "")}</p>
      <dl>
        <div><dt>${language === "zh" ? "步行" : "Walking"}</dt><dd>${fmt(mode.walking_min,1)} min</dd></div>
        <div><dt>${language === "zh" ? "换乘" : "Transfers"}</dt><dd>${fmt(mode.transfer_count)}</dd></div>
        <div><dt>${language === "zh" ? "稳定度" : "Reliability"}</dt><dd>${escapeHtml(healthCopy(mode.reliability_label))}</dd></div>
      </dl>
    </button>`).join("");
  grid.querySelectorAll(".mode-card").forEach(card => card.addEventListener("click", () => {
    const mode = card.dataset.mode;
    const winner = (appState.plannerResult?.modes || []).find(row => row.mode === mode);
    appState.selectedMode = mode;
    if (winner) appState.selectedJourneyId = winner.winner_journey_id;
    renderJourney();
  }));
}

function renderJourneyMap(journey) {
  initJourneyMap();
  if (!journeyMap || !journeyLayer) return;
  journeyLayer.clearLayers();
  const bounds = [];
  (journey.map?.route_paths || []).forEach(path => {
    const points = (path.points || []).filter(point => Array.isArray(point) && point.length === 2);
    if (points.length < 2) return;
    L.polyline(points, {color: path.color || "#0066cc", weight: 6, opacity: .9, lineJoin: "round"})
      .bindPopup(`${language === "zh" ? "线路" : "Route"} ${escapeHtml(path.route_id || "—")}`)
      .addTo(journeyLayer);
    bounds.push(...points);
  });
  (journey.map?.walk_paths || []).forEach(points => {
    const valid = (points || []).filter(point => Array.isArray(point) && point.length === 2);
    if (valid.length < 2) return;
    L.polyline(valid, {color: "#6e6e73", weight: 3, opacity: .78, dashArray: "4 8"}).addTo(journeyLayer);
    bounds.push(...valid);
  });
  const roleColors = {ORIGIN:"#1d1d1f", DESTINATION:"#1d1d1f", BOARD:"#0066cc", ALIGHT:"#0066cc", TRANSFER_FROM:"#ff9500", TRANSFER_TO:"#ff9500"};
  const seen = new Set();
  (journey.map?.points || []).forEach(point => {
    if (!hasNumber(point.lat) || !hasNumber(point.lon)) return;
    const key = `${point.role}|${point.stop_id}`;
    if (seen.has(key)) return;
    seen.add(key);
    const latLng = [Number(point.lat), Number(point.lon)];
    L.circleMarker(latLng, {radius: point.role === "ORIGIN" || point.role === "DESTINATION" ? 8 : 6, color:"#ffffff", weight:2, fillColor:roleColors[point.role] || "#0066cc", fillOpacity:1})
      .bindPopup(`<strong>${escapeHtml(point.name || "Muni stop")}</strong><br>${escapeHtml(point.role || "STOP")}`)
      .addTo(journeyLayer);
    bounds.push(latLng);
  });
  setTimeout(() => {
    journeyMap.invalidateSize();
    if (bounds.length > 1) journeyMap.fitBounds(bounds, {padding:[32,32], maxZoom:15});
  }, 0);
  document.getElementById("journey-map-label").textContent = journey.route_sequence;
}

function timelineRow(leg) {
  if (leg.type === "WALK") {
    const transfer = leg.transfer ? (language === "zh" ? "换乘步行" : "Transfer walk") : (language === "zh" ? "步行" : "Walk");
    return {title: `${transfer} → ${leg.to?.name || "next stop"}`, detail: `${fmt(leg.duration_min,1)} min · ${fmt(leg.distance_m)} m`};
  }
  if (leg.type === "WAIT") {
    const buffer = hasNumber(leg.estimated_buffer_min) ? ` · ${language === "zh" ? "估算换乘余量" : "estimated transfer buffer"} ${fmt(leg.estimated_buffer_min,1)} min` : "";
    return {title: `${language === "zh" ? "等候" : "Wait for"} ${leg.route_id || "Muni"}`, detail: `${fmt(leg.duration_min,1)} min${buffer}`};
  }
  if (leg.type === "RIDE") {
    const toward = leg.headsign ? ` · ${language === "zh" ? "开往" : "toward"} ${leg.headsign}` : "";
    return {title: `${language === "zh" ? "乘坐" : "Ride"} ${leg.route_id}${toward}`, detail: `${leg.from?.name || "—"} → ${leg.to?.name || "—"} · ${fmt(leg.duration_min,1)} min · ${fmt(leg.stop_count)} ${language === "zh" ? "站" : "stops"}`};
  }
  return {title: leg.type || "Step", detail: ""};
}

function renderJourneyTimeline(journey) {
  document.getElementById("selected-journey-title").textContent = journey.route_sequence;
  const transfer = journey.transfer ? ` · ${journey.transfer.catchability === "CATCHABLE" ? (language === "zh" ? "换乘余量尚可" : "Catchable transfer") : (language === "zh" ? "换乘较紧" : "Tight transfer")}` : "";
  document.getElementById("selected-journey-summary").textContent = `${fmt(journey.eta_min,1)} min · ${fmt(journey.walking_min,1)} min ${language === "zh" ? "步行" : "walking"}${transfer}`;
  const rows = [
    {title: appState.plannerResult?.origin?.name || "Origin", detail: language === "zh" ? "出发" : "Start"},
    ...(journey.legs || []).map(timelineRow),
    {title: appState.plannerResult?.destination?.name || "Destination", detail: language === "zh" ? "到达" : "Arrive"}
  ];
  document.getElementById("journey-timeline").innerHTML = rows.map(row => `<li><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("");
}

function renderJourneyEvidence(journey) {
  document.getElementById("journey-reliability-status").textContent = healthCopy(journey.reliability);
  document.getElementById("journey-reliability-detail").innerHTML = (journey.reliability_detail || []).map(row => `
    <div class="evidence-row"><span>${escapeHtml(`${row.route_id} · ${healthCopy(row.health)}`)}</span><strong>${hasNumber(row.median_headway_min) ? `${fmt(row.median_headway_min,1)} min` : (language === "zh" ? "证据有限" : "limited")}</strong></div>
    <p class="fine-print">${fmt(row.bunching_events)} ${language === "zh" ? "次聚集" : "bunching"} · ${fmt(row.large_gap_events)} ${language === "zh" ? "个较大缺口" : "large gaps"} · ${fmt(row.predictions_observed)} ${language === "zh" ? "条预测" : "predictions"}</p>`).join("");

  const safety = journey.safety || {};
  document.getElementById("journey-safety-status").textContent = language === "zh" ? "仅有城市背景" : "City context only";
  const percentileRows = [
    [language === "zh" ? "上车区域" : "Boarding area", safety.boarding_percentile],
    [language === "zh" ? "换乘区域" : "Transfer area", safety.transfer_percentile],
    [language === "zh" ? "目的地区域" : "Destination area", safety.destination_percentile]
  ];
  document.getElementById("journey-safety-detail").innerHTML = percentileRows.map(([label,value]) => `
    <div class="evidence-row"><span>${escapeHtml(label)}</span><strong>${hasNumber(value) ? `${fmt(value)}th` : (language === "zh" ? "尚未评分" : "not scored")}</strong></div>`).join("") +
    `<p class="evidence-note">${escapeHtml(safety.disclaimer || "Historical incident context is not a crime forecast.")}</p>`;
}

function renderAlternatives(alternatives) {
  const list = document.getElementById("alternatives-list");
  const costKey = {FASTEST:"fastest", BALANCED:"balanced", SAFETY_FIRST:"safety_first"}[appState.selectedMode] || "balanced";
  const ranked = [...alternatives].sort((left, right) =>
    Number(left.costs?.[costKey] ?? left.eta_min) - Number(right.costs?.[costKey] ?? right.eta_min)
    || Number(left.eta_min) - Number(right.eta_min)
  );
  const modeLabel = appState.selectedMode.replaceAll("_", "-").toLocaleLowerCase();
  list.innerHTML = ranked.map((row,index) => `
    <button type="button" class="alternative-card" data-journey-id="${escapeHtml(row.journey_id)}" aria-pressed="${row.journey_id === appState.selectedJourneyId}">
      <div class="alternative-card-header"><span class="alternative-card-route">${escapeHtml(row.route_sequence)}</span><span class="alternative-card-eta">${fmt(row.eta_min,1)} min</span></div>
      <p class="alternative-card-meta">${fmt(row.walking_min,1)} min ${language === "zh" ? "步行" : "walk"} · ${fmt(row.transfer_count)} ${language === "zh" ? "次换乘" : "transfers"} · ${escapeHtml(healthCopy(row.reliability))}</p>
      ${index === 0 ? `<span class="alternative-card-badge">${language === "zh" ? `当前 ${modeLabel} 推荐` : `Recommended for ${modeLabel}`}</span>` : row.pareto_efficient ? `<span class="alternative-card-badge">Pareto efficient</span>` : ""}
    </button>`).join("");
  list.querySelectorAll(".alternative-card").forEach(card => card.addEventListener("click", () => {
    appState.selectedJourneyId = card.dataset.journeyId;
    renderJourney();
  }));
}

function renderPlannerEmpty() {
  document.getElementById("journey-od").textContent = language === "zh" ? "选择起点和终点后开始规划。" : "Choose an origin and destination to begin.";
  document.getElementById("mode-grid").innerHTML = `<div class="planner-empty">${language === "zh" ? "这里不会显示与用户输入无关的固定示例结果。" : "No fixed example result will be substituted for your trip."}</div>`;
  document.getElementById("alternatives-list").innerHTML = `<p class="planner-empty-inline">${language === "zh" ? "提交行程后，备选方案会显示在这里。" : "Alternatives will appear here after you submit a trip."}</p>`;
  document.getElementById("journey-workspace").hidden = true;
  document.getElementById("journey-evidence").hidden = true;
}

function renderJourney() {
  const result = appState.plannerResult;
  if (!result) {
    renderPlannerEmpty();
    return;
  }
  const journey = selectedJourney();
  if (!journey) return;
  document.getElementById("journey-od").textContent = `${result.origin.name} → ${result.destination.name}`;
  document.getElementById("journey-workspace").hidden = false;
  document.getElementById("journey-evidence").hidden = false;
  renderModeCards(result.modes || []);
  renderAlternatives(result.alternatives || []);
  renderJourneyMap(journey);
  renderJourneyTimeline(journey);
  renderJourneyEvidence(journey);
}

async function planTrip() {
  const originId = resolveStopInput(document.getElementById("origin-input").value);
  const destinationId = resolveStopInput(document.getElementById("destination-input").value);
  if (!originId || !destinationId) {
    setPlannerStatus(language === "zh" ? "请从列表中选择两个有效的 Muni 站点。" : "Choose two valid Muni stops from the list.", true);
    return;
  }
  if (originId === destinationId) {
    setPlannerStatus(language === "zh" ? "起点和终点不能相同。" : "Origin and destination must be different.", true);
    return;
  }
  if (!PLANNER_API_BASE) {
    appState.plannerResult = null;
    renderPlannerEmpty();
    setPlannerError(language === "zh" ? "行程服务尚未配置，当前不能生成可靠的路线结果。" : "The journey service is not configured, so no route result can be generated right now.");
    return;
  }
  const requestKey = `${originId}|${destinationId}|${appState.selectedMode}`;
  const button = document.getElementById("plan-trip-button");
  button.disabled = true;
  setPlannerStatus(language === "zh" ? "正在比较直达和一次换乘方案…" : "Comparing direct and one-transfer journeys…");
  const coldStartMessage = setTimeout(() => setPlannerStatus(
    language === "zh" ? "规划服务正在启动。Public Beta 闲置后首次请求可能需要约一分钟…" : "The planner is starting. The first Public Beta request after inactivity can take about a minute…"
  ), 7000);
  try {
    const response = await fetch(`${PLANNER_API_BASE}/plan-trip`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({origin_stop_id: originId, destination_stop_id: destinationId, mode: appState.selectedMode})
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || `Planner returned HTTP ${response.status}`);
    appState.plannerResult = payload;
    appState.plannerRequestKey = requestKey;
    appState.selectedMode = payload.selected_mode || appState.selectedMode;
    appState.selectedJourneyId = payload.selected_journey_id;
    setPlannerStatus(language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 个候选方案；ETA 为当前证据下的估算。` : `Compared ${payload.alternatives?.length || 0} candidates; ETA is estimated from current evidence.`);
    renderJourney();
  } catch (error) {
    appState.plannerResult = null;
    appState.selectedJourneyId = null;
    renderPlannerEmpty();
    setPlannerError(`${language === "zh" ? "暂时无法规划这趟行程" : "We couldn't plan this trip right now"}: ${error.message}`);
  } finally {
    clearTimeout(coldStartMessage);
    button.disabled = false;
  }
}

function renderContext() {
  const parking = snapshot.parking || {};
  document.getElementById("parking-status").textContent = parking.status || (language === "zh" ? "证据有限" : "Limited evidence");
  document.getElementById("parking-detail").textContent = parking.detail || "Paid-session demand proxy; not guaranteed physical occupancy.";
  const safety = snapshot.safety || {};
  document.getElementById("safety-status").textContent = safety.status || (language === "zh" ? "相对背景" : "Relative context");
  document.getElementById("safety-detail").textContent = safety.detail || "Historical incidents provide relative context, not crime probability.";
}

function renderRouteView() {
  renderMap();
  renderRouteFocus();
  renderRouteGrid();
  renderEvents();
}

function selectRoute(routeId, directionId = "all", shouldScroll = false) {
  appState.selectedRoute = routeId;
  appState.selectedDirection = directionId;
  document.getElementById("route-select").value = routeId;
  renderDirectionSelector();
  document.getElementById("direction-select").value = appState.selectedDirection;
  renderRouteView();
  if (shouldScroll) document.getElementById("network").scrollIntoView({behavior: "smooth"});
}

function setRouteScope(scope) {
  appState.routeScope = scope === "all" ? "all" : "evidence";
  renderRouteSelector();
  renderDirectionSelector();
  renderRouteView();
}

function renderAll({networkChanged = false} = {}) {
  setLanguage(language);
  renderMeta();
  renderHero();
  renderRouteSelector();
  renderDirectionSelector();
  renderRouteView();
  if (networkChanged || plannerStops.length === 0) renderStopOptions();
  renderJourney();
  renderContext();
}

async function loadData({includeNetwork = false} = {}) {
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  try {
    const cacheBuster = Date.now();
    const snapshotRequest = fetch(`data/latest.json?t=${cacheBuster}`, {cache:"no-store"});
    const networkRequest = includeNetwork || !network
      ? fetch("data/network.json", {cache:"default"})
      : Promise.resolve(null);
    const [snapshotResponse, networkResponse] = await Promise.all([snapshotRequest, networkRequest]);
    if (!snapshotResponse.ok) throw new Error(`Snapshot request returned HTTP ${snapshotResponse.status}`);
    if (networkResponse && !networkResponse.ok) throw new Error(`Network catalog request returned HTTP ${networkResponse.status}`);
    snapshot = await snapshotResponse.json();
    if (networkResponse) network = await networkResponse.json();
    renderAll({networkChanged: Boolean(networkResponse)});
    document.getElementById("error-banner").hidden = true;
  } catch (error) {
    document.getElementById("error-banner").textContent = `${language === "zh" ? "无法载入页面数据" : "Could not load page data"}: ${error.message}`;
    document.getElementById("error-banner").hidden = false;
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(language);
  initMap();
  document.getElementById("language-toggle").addEventListener("click", () => {
    setLanguage(language === "en" ? "zh" : "en");
    if (snapshot && network) renderAll();
  });
  document.getElementById("refresh-button").addEventListener("click", () => loadData());
  document.querySelectorAll(".scope-button").forEach(button => button.addEventListener("click", () => setRouteScope(button.dataset.scope)));
  document.querySelectorAll("#map-layer-control input[data-layer]").forEach(input => input.addEventListener("change", () => {
    appState.layers[input.dataset.layer] = input.checked;
    syncMapLayers();
  }));
  document.getElementById("route-select").addEventListener("change", event => selectRoute(event.target.value, "all"));
  document.getElementById("direction-select").addEventListener("change", event => selectRoute(appState.selectedRoute, event.target.value));
  document.getElementById("trip-planner-form").addEventListener("submit", event => {
    event.preventDefault();
    planTrip();
  });
  document.getElementById("swap-stops").addEventListener("click", () => {
    const origin = document.getElementById("origin-input");
    const destination = document.getElementById("destination-input");
    [origin.value, destination.value] = [destination.value, origin.value];
    appState.plannerRequestKey = null;
  });
  [
    [document.getElementById("origin-input"), document.getElementById("origin-suggestions")],
    [document.getElementById("destination-input"), document.getElementById("destination-suggestions")]
  ].forEach(([input, list]) => {
    input.addEventListener("input", () => scheduleStopSearch(input, list));
    input.addEventListener("focus", () => scheduleStopSearch(input, list));
    input.addEventListener("blur", () => setTimeout(() => {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }, 150));
  });
  document.getElementById("example-trip-button").addEventListener("click", () => {
    const origin = plannerStops.find(stop => stop.stop_id === "13161");
    const destination = plannerStops.find(stop => stop.stop_id === "15659");
    if (!origin || !destination) return;
    document.getElementById("origin-input").value = stopLabel(origin);
    document.getElementById("destination-input").value = stopLabel(destination);
    appState.plannerRequestKey = null;
    planTrip();
  });
  loadData({includeNetwork:true});
  setInterval(() => loadData(), 5 * 60 * 1000);
});
