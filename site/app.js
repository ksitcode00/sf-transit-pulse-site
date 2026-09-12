const I18N = {
  en: {
    navNetwork: "Network", navJourney: "Journey", navContext: "City context", refresh: "Refresh",
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
    whereGoing: "Where are you going?", plannerLead: "Choose any cached Muni stop. The planner compares direct and one-transfer journeys.",
    dynamicPlanner: "Dynamic planner · Scheme A", fromStop: "From", toStop: "To", findRoute: "Find best route",
    journeyMapHint: "Transit legs are solid; walking connections are dotted.", journeyTimeline: "Journey timeline",
    journeyReliability: "Journey reliability", journeySafety: "Journey safety context",
    threeWays: "Three ways to choose.", referenceCase: "Reference case", alternatives: "Alternatives",
    tradeoffs: "The trade-offs stay visible.", route: "Route", eta: "ETA", walk: "Walk", reliability: "Reliability",
    exposure: "Exposure context", cityContext: "City context", moreThanBus: "More than the bus.",
    parkingDemand: "Parking demand", safetyContext: "Safety context", dataQuality: "Data quality",
    methodEyebrow: "Method", evidenceTitle: "Evidence before confidence.",
    evidenceBody: "The page never changes actual ETA with preference penalties. FASTEST, BALANCED, and SAFETY_FIRST compare the same candidates while keeping travel time, reliability, walking, and relative exposure separate and explainable.",
    collect: "Collect", collectBody: "Fetch official transit and city feeds on a controlled schedule.",
    normalize: "Normalize", normalizeBody: "Align identifiers, directions, timestamps, units, and freshness.",
    explain: "Explain", explainBody: "Publish observations, limitations, and decision reasons together.",
    footerNote: "An independent research prototype. Not an official SFMTA service."
  },
  zh: {
    navNetwork: "实时路网", navJourney: "行程选择", navContext: "城市背景", refresh: "刷新",
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
    whereGoing: "你想去哪里？", plannerLead: "选择任意缓存中的 Muni 站点，比较直达与一次换乘方案。",
    dynamicPlanner: "动态规划器 · 方案 A", fromStop: "从哪里出发", toStop: "到哪里", findRoute: "寻找最佳路线",
    journeyMapHint: "实线是公交路段，虚线是步行连接。", journeyTimeline: "行程步骤",
    journeyReliability: "行程可靠性", journeySafety: "行程安全背景",
    threeWays: "用三种方式做选择。", referenceCase: "固定验证案例", alternatives: "其他方案",
    tradeoffs: "把每个取舍清清楚楚地摆出来。", route: "线路", eta: "到达时间", walk: "步行", reliability: "稳定度",
    exposure: "相对暴露背景", cityContext: "城市背景", moreThanBus: "不只看公交。",
    parkingDemand: "停车需求", safetyContext: "安全背景", dataQuality: "数据质量",
    methodEyebrow: "计算方法", evidenceTitle: "先看证据，再谈信心。",
    evidenceBody: "偏好权重永远不会修改真实 ETA。FASTEST、BALANCED 和 SAFETY_FIRST 使用同一个候选集合，并把时间、稳定度、步行与相对暴露分别展示。",
    collect: "获取", collectBody: "按照受控频率获取官方交通与城市数据。",
    normalize: "标准化", normalizeBody: "统一 ID、方向、时区、单位和数据新鲜度。",
    explain: "解释", explainBody: "把观测结果、限制条件和推荐原因一起发布。",
    footerNote: "独立研究原型，并非 SFMTA 官方服务。"
  }
};

let language = localStorage.getItem("sf-transit-language") || "en";
let snapshot = null;
let network = null;
let map = null;
let featureLayer = null;
let journeyMap = null;
let journeyLayer = null;
let stopSearchIndex = new Map();
const PLANNER_API_BASE = String(window.SF_TRANSIT_API_BASE || "").replace(/\/$/, "");
const appState = {
  selectedRoute: "all",
  selectedDirection: "all",
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
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  featureLayer = L.layerGroup().addTo(map);
}

function initJourneyMap() {
  if (!window.L || journeyMap) return;
  journeyMap = L.map("journey-map", { zoomControl: true, scrollWheelZoom: false }).setView([37.7749, -122.4194], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

function renderMeta() {
  const meta = snapshot.meta || {};
  const generated = meta.generated_at ? new Date(meta.generated_at) : null;
  const ageMin = generated ? Math.max(0, (Date.now() - generated.getTime()) / 60000) : null;
  const sourceLabel = meta.status === "live" ? (language === "zh" ? "自动实时快照" : "Automatic live snapshot") :
    meta.status === "partial_live" ? (language === "zh" ? "部分实时 · 交通密钥待配置" : "Partially live · transit secret pending") :
    (language === "zh" ? "演示快照" : "Demonstration snapshot");
  const ageLabel = ageMin == null ? "" : ` · ${Math.round(ageMin)} ${language === "zh" ? "分钟前" : "min ago"}`;
  document.getElementById("freshness-label").textContent = sourceLabel + ageLabel;
  document.getElementById("generated-at").textContent = generated ? `${language === "zh" ? "生成时间" : "Generated"}: ${generated.toLocaleString()}` : "Snapshot time unavailable";
  document.getElementById("quality-status").textContent = sourceLabel;
  const failures = meta.errors || [];
  document.getElementById("quality-detail").textContent = failures.length ? `${failures.length} source warning${failures.length === 1 ? "" : "s"}. The last valid values remain labeled.` : "All configured source checks completed for this snapshot.";
  const freshnessRows = [
    [language === "zh" ? "车辆与班距" : "Vehicles + headways", timeAgo(meta.generated_at)],
    [language === "zh" ? "静态路网" : "Static network", network?.meta?.feed_version ? `${language === "zh" ? "版本" : "version"} ${network.meta.feed_version}` : "—"],
    [language === "zh" ? "停车数据" : "Parking", timeAgo(snapshot.parking?.source_snapshot_time)],
    [language === "zh" ? "安全背景" : "Safety context", snapshot.safety?.status || "—"]
  ];
  document.getElementById("source-freshness").innerHTML = freshnessRows.map(([label,value]) => `<div class="evidence-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function renderHero() {
  const system = snapshot.system || {};
  document.getElementById("vehicle-count").textContent = fmt(system.vehicle_count);
  document.getElementById("route-count").textContent = fmt(network?.meta?.route_count ?? system.route_count);
  document.getElementById("alert-count").textContent = fmt(system.alert_count);
}

function renderRouteSelector() {
  const select = document.getElementById("route-select");
  const routes = network?.routes || [];
  select.innerHTML = `<option value="all">${language === "zh" ? "全部线路" : "All routes"}</option>` + routes.map(route => {
    const shortName = route.route_short_name || route.route_id;
    const longName = route.route_long_name ? ` — ${route.route_long_name}` : "";
    return `<option value="${escapeHtml(route.route_id)}">${escapeHtml(shortName + longName)}</option>`;
  }).join("");
  if (!routes.some(route => String(route.route_id) === String(appState.selectedRoute))) {
    appState.selectedRoute = "all";
  }
  select.value = appState.selectedRoute;
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
  if (!map || !featureLayer) return;
  featureLayer.clearLayers();
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
      }).addTo(featureLayer);
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
      .addTo(featureLayer);
  }));

  const vehicles = (snapshot.vehicles || []).filter(vehicle => selectionMatches(vehicle, routeId, directionId));
  vehicles.forEach(vehicle => {
    if (!hasNumber(vehicle.lat) || !hasNumber(vehicle.lon)) return;
    const point = [Number(vehicle.lat), Number(vehicle.lon)];
    bounds.push(point);
    L.circleMarker(point, {radius: 6, color: "#ffffff", weight: 2, fillColor: "#0066cc", fillOpacity: .98})
      .bindPopup(`<div class="vehicle-popup"><strong>Route ${escapeHtml(vehicle.route_id || "—")}</strong><br>${escapeHtml(vehicle.direction_label || `Direction ${vehicle.direction_id ?? "—"}`)}<br>${fmt(vehicle.age_seconds)} sec since report</div>`)
      .addTo(featureLayer);
  });

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
  return {
    health: rows.length ? rows.slice().sort((a,b)=>(severity[b.health]||0)-(severity[a.health]||0))[0].health : "NO_DATA",
    vehicle_count: vehicles.length || rows.reduce((sum,row)=>sum+Number(row.vehicle_count || 0),0),
    median_headway_min: median(rows.map(row => row.median_headway_min)),
    bunching_events: rows.reduce((sum,row)=>sum+Number(row.bunching_events || 0),0),
    service_gap_events: rows.reduce((sum,row)=>sum+Number(row.large_gap_events || 0),0),
    severe_gap_events: rows.reduce((sum,row)=>sum+Number(row.severe_gap_events || 0),0),
    speed_mph: median(vehicles.map(vehicle => Number(vehicle.speed_mps) * 2.23694)),
    evidence_count: rows.reduce((sum,row)=>sum+Number(row.predictions_observed || 0),0)
  };
}

function renderRouteFocus(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const data = combinedRoute(routeId, directionId);
  const route = routeCatalogEntry(routeId);
  const direction = route?.directions?.find(item => String(item.direction_id) === String(directionId));
  const routeName = route ? `${route.route_short_name || route.route_id}${route.route_long_name ? ` ${route.route_long_name}` : ""}` : "";
  const directionName = direction ? ` · ${direction.direction_label}${direction.headsign ? ` → ${direction.headsign}` : ""}` : "";
  document.getElementById("focus-route-name").textContent = routeId === "all" ? (language === "zh" ? "全网概览" : "Network overview") : `${routeName}${directionName}`;
  document.getElementById("focus-route-status").textContent = healthCopy(data.health);
  document.getElementById("focus-vehicles").textContent = fmt(data.vehicle_count);
  document.getElementById("focus-headway").textContent = Number.isFinite(data.median_headway_min) ? `${fmt(data.median_headway_min,1)} min` : "—";
  document.getElementById("focus-bunching").textContent = fmt(data.bunching_events);
  document.getElementById("focus-gaps").textContent = `${fmt(data.service_gap_events)}${data.severe_gap_events ? ` (${data.severe_gap_events} severe)` : ""}`;
  document.getElementById("focus-speed").textContent = Number.isFinite(data.speed_mph) ? `${fmt(data.speed_mph,1)} mph` : "—";
  document.getElementById("focus-evidence").textContent = fmt(data.evidence_count);
  document.getElementById("focus-explanation").textContent = language === "zh" ?
    `当前查看 ${routeId === "all" ? "全网" : routeId}${direction ? ` 的 ${direction.direction_label}` : " 的全部方向"}。健康度按 route + direction 计算；证据不足时显示 NO DATA。` :
    `Viewing ${routeId === "all" ? "the network" : routeId}${direction ? ` ${direction.direction_label}` : " across directions"}. Health is route + direction specific; sparse evidence remains NO DATA.`;
}

function renderRouteGrid() {
  const rows = (snapshot.routes || []).slice().sort((a,b) => Number(b.vehicle_count || 0)-Number(a.vehicle_count || 0)).slice(0,12);
  const grid = document.getElementById("route-grid");
  grid.innerHTML = rows.length ? rows.map(row => `
    <article class="route-card" tabindex="0" role="button" data-route="${escapeHtml(row.route_id)}" data-direction="${escapeHtml(row.direction_id)}" aria-pressed="${String(row.route_id) === String(appState.selectedRoute) && String(row.direction_id) === String(appState.selectedDirection)}" aria-label="Focus route ${escapeHtml(row.route_id)} direction ${escapeHtml(row.direction_id)}">
      <span class="route-number">${escapeHtml(row.route_id)}</span>
      <span class="direction">${escapeHtml(row.direction_label || `direction ${row.direction_id ?? "—"}`)}</span>
      <p class="health">${escapeHtml(healthCopy(row.health))}</p>
      <p class="detail">${fmt(row.vehicle_count)} ${language === "zh" ? "辆车" : "vehicles"} · ${hasNumber(row.median_headway_min) ? `${fmt(row.median_headway_min,1)} min ${language === "zh" ? "中位班距" : "median gap"}` : (language === "zh" ? "班距证据有限" : "limited headway evidence")}</p>
    </article>`).join("") : `<p>${language === "zh" ? "当前没有线路级实时数据。" : "No route-level realtime data is available."}</p>`;
  grid.querySelectorAll(".route-card").forEach(card => {
    const select = () => selectRoute(card.dataset.route, card.dataset.direction, true);
    card.addEventListener("click", select);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }});
  });
}

function renderEvents(routeId = appState.selectedRoute) {
  const list = (id, events, emptyText) => {
    document.getElementById(id).innerHTML = events.length ? events.slice(0,5).map(item => `<article class="event-item"><strong>${escapeHtml(item.title || item.route_id || "Notice")}</strong><p>${escapeHtml(item.description || item.status || "Current context available.")}</p></article>`).join("") : `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  };
  const matchesRoute = item => routeId === "all" || (item.route_ids || []).map(String).includes(String(routeId));
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
  Object.values(network?.route_directions || {}).forEach(direction => {
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
  const rows = allPlannerStops();
  stopSearchIndex = new Map();
  rows.forEach(stop => {
    stopSearchIndex.set(stopLabel(stop), stop.stop_id);
    stopSearchIndex.set(stop.stop_id, stop.stop_id);
  });
  document.getElementById("stop-options").innerHTML = rows.map(stop =>
    `<option value="${escapeHtml(stopLabel(stop))}"></option>`
  ).join("");

  const originInput = document.getElementById("origin-input");
  const destinationInput = document.getElementById("destination-input");
  if (!originInput.value) originInput.value = stopLabel(rows.find(stop => stop.stop_id === "13161") || rows[0]);
  if (!destinationInput.value) destinationInput.value = stopLabel(rows.find(stop => stop.stop_id === "15659") || rows[1]);
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

function selectedJourney() {
  const alternatives = appState.plannerResult?.alternatives || [];
  return alternatives.find(row => row.journey_id === appState.selectedJourneyId) || alternatives[0] || null;
}

function renderModeCards(modes) {
  const grid = document.getElementById("mode-grid");
  grid.innerHTML = modes.map(mode => `
    <button type="button" class="mode-card ${mode.mode === "BALANCED" ? "recommended" : ""}" data-mode="${escapeHtml(mode.mode)}" aria-pressed="${mode.mode === appState.selectedMode}">
      <span class="mode-label">${escapeHtml(mode.mode.replaceAll("_", "-"))}${mode.mode === "BALANCED" ? " ★" : ""}</span>
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
  list.innerHTML = alternatives.map((row,index) => `
    <button type="button" class="alternative-card" data-journey-id="${escapeHtml(row.journey_id)}" aria-pressed="${row.journey_id === appState.selectedJourneyId}">
      <div class="alternative-card-header"><span class="alternative-card-route">${escapeHtml(row.route_sequence)}</span><span class="alternative-card-eta">${fmt(row.eta_min,1)} min</span></div>
      <p class="alternative-card-meta">${fmt(row.walking_min,1)} min ${language === "zh" ? "步行" : "walk"} · ${fmt(row.transfer_count)} ${language === "zh" ? "次换乘" : "transfers"} · ${escapeHtml(healthCopy(row.reliability))}</p>
      ${row.pareto_efficient ? `<span class="alternative-card-badge">${index === 0 ? (language === "zh" ? "当前综合推荐" : "Best overall") : "Pareto efficient"}</span>` : ""}
    </button>`).join("");
  list.querySelectorAll(".alternative-card").forEach(card => card.addEventListener("click", () => {
    appState.selectedJourneyId = card.dataset.journeyId;
    renderJourney();
  }));
}

function renderLegacyJourney() {
  const legacy = snapshot?.journey || {};
  document.getElementById("journey-od").textContent = `${legacy.origin || "4th St & Market St"} → ${legacy.destination || "Market St & Buchanan St"}`;
  const modes = legacy.modes || [];
  document.getElementById("mode-grid").innerHTML = modes.map(mode => `
    <div class="mode-card ${mode.mode === "BALANCED" ? "recommended" : ""}">
      <span class="mode-label">${escapeHtml(mode.mode)}</span><p class="mode-route">${escapeHtml(mode.route || "—")}</p><p class="mode-eta">${fmt(mode.eta_min,1)} min</p><p>${escapeHtml(mode.explanation || "")}</p>
    </div>`).join("");
  document.getElementById("alternatives-list").innerHTML = (legacy.alternatives || []).map(row => `
    <div class="alternative-card"><div class="alternative-card-header"><span class="alternative-card-route">${escapeHtml(row.route_sequence)}</span><span class="alternative-card-eta">${fmt(row.eta_min,1)} min</span></div><p class="alternative-card-meta">${fmt(row.walking_min,1)} min ${language === "zh" ? "步行" : "walk"} · ${escapeHtml(row.reliability || "—")}</p></div>`).join("");
  document.getElementById("journey-workspace").hidden = true;
  document.getElementById("journey-evidence").hidden = true;
}

function renderJourney() {
  const result = appState.plannerResult;
  if (!result) {
    renderLegacyJourney();
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

async function planTrip({silent = false} = {}) {
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
    setPlannerStatus(language === "zh" ? "行程后端尚未配置；下面保留固定验证案例。" : "Planner backend is not configured; the fixed validation case remains below.", true);
    return;
  }
  const requestKey = `${originId}|${destinationId}|${appState.selectedMode}`;
  if (silent && requestKey === appState.plannerRequestKey) return;
  const button = document.getElementById("plan-trip-button");
  button.disabled = true;
  setPlannerStatus(language === "zh" ? "正在比较直达和一次换乘方案…" : "Comparing direct and one-transfer journeys…");
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
    if (!silent) setPlannerStatus(`${language === "zh" ? "暂时无法规划" : "Could not plan this trip"}: ${error.message}`, true);
    else setPlannerStatus(language === "zh" ? "行程 API 尚未上线；当前显示固定验证案例。" : "Journey API is not online yet; showing the fixed validation case.", true);
    renderLegacyJourney();
  } finally {
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

function renderAll() {
  setLanguage(language);
  renderMeta();
  renderHero();
  renderRouteSelector();
  renderDirectionSelector();
  renderRouteView();
  renderStopOptions();
  renderJourney();
  renderContext();
}

async function loadData() {
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  try {
    const cacheBuster = Date.now();
    const [snapshotResponse, networkResponse] = await Promise.all([
      fetch(`data/latest.json?t=${cacheBuster}`, {cache:"no-store"}),
      fetch(`data/network.json?t=${cacheBuster}`, {cache:"no-store"})
    ]);
    if (!snapshotResponse.ok) throw new Error(`Snapshot request returned HTTP ${snapshotResponse.status}`);
    if (!networkResponse.ok) throw new Error(`Network catalog request returned HTTP ${networkResponse.status}`);
    [snapshot, network] = await Promise.all([snapshotResponse.json(), networkResponse.json()]);
    renderAll();
    planTrip({silent:true});
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
  document.getElementById("refresh-button").addEventListener("click", loadData);
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
    planTrip();
  });
  loadData();
  setInterval(loadData, 5 * 60 * 1000);
});
