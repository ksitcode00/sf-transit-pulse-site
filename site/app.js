const I18N = {
  en: {
    navNetwork: "Muni now", navJourney: "Plan a trip", navContext: "More travel info", refresh: "Get latest update", skipToMuni: "Skip to Muni updates",
    eyebrow: "San Francisco Muni · Live updates", heroTitle: "Know your next move.",
    heroLead: "See where vehicles are, spot longer waits, and compare routes before you leave.",
    planJourney: "Plan a trip", viewNetwork: "Check Muni now", howWorks: "See how results are made", vehiclesReporting: "vehicle locations found",
    routesObserved: "routes with live updates", activeNotices: "service updates", liveNetwork: "Muni right now",
    seeCityMove: "Check your route before you go.", focusRoute: "Choose a route", focusDirection: "Choose a direction", mapHint: "The map updates when you choose a route or direction.",
    routePulse: "What's happening", vehicles: "Vehicle locations", medianGap: "Time between vehicles", bunching: "Vehicles close together", serviceGaps: "Long waits", currentSpeed: "Reported speed", evidence: "Arrival estimates checked",
    routeOverview: "Routes with the clearest live picture", directionNote: "Each direction can run differently, so we check them separately.",
    streetsService: "What may affect your ride", explainWhy: "See service and street updates together.",
    causalityNote: "A street event near a route may affect service, but it does not prove what caused a delay.",
    serviceNotices: "Muni service updates", roadEvents: "Nearby street work", journeyDecision: "Plan your trip",
    whereGoing: "Where do you want to go?", plannerLead: "Choose two Muni stops. We'll compare direct trips and trips with one transfer using the latest available data.",
    dynamicPlanner: "Live predictions + estimates · Public Beta", fromStop: "Starting stop", toStop: "Destination stop", findRoute: "Compare routes", tryExample: "Try a sample trip",
    journeyMapHint: "Transit legs are solid; walking connections are dotted.", journeyTimeline: "Your trip",
    journeyReliability: "How steady is this trip?", journeySafety: "Historical incident context",
    threeWays: "Choose what matters most.", referenceCase: "Reference trip", alternatives: "Other routes",
    tradeoffs: "Compare time, walking, and transfers.", route: "Route", eta: "Estimated trip time", walk: "Walking", reliability: "Current service",
    exposure: "Historical incident context", cityContext: "More travel info", moreThanBus: "Other things that may affect your trip.",
    parkingDemand: "Recent parking activity", safetyContext: "Historical incident context", dataQuality: "How current is this data?",
    methodEyebrow: "How we build each result", evidenceTitle: "What we check before recommending a trip.",
    northStarBody: "SF Transit Pulse answers one practical question: What should I take right now, and why?", evidenceBody: "We only say what the available data supports.",
    observe: "Collect current updates", observeBody: "Check vehicle locations, arrival estimates, service notices, route paths, and when each source was updated.",
    diagnose: "Check each route direction", diagnoseBody: "Look for steady vehicle spacing, vehicles too close together, long waits, and limited live data in each direction.",
    build: "Build trips you may be able to make", buildBody: "Compare direct and one-transfer trips. When complete live predictions are available, check whether two specific trips connect; otherwise label the time as an estimate.",
    compare: "Compare what matters to you", compareBody: "Fastest favors time. Balanced also considers steady service, walking, and transfers. Safety-first is waiting for trip-level historical incident data.",
    boundariesTitle: "Important limits", boundarySafety: "Historical incident data cannot tell whether you will be safe.", boundaryRoad: "A nearby street event does not prove what caused a transit delay.", boundaryMissing: "No live update does not mean a route has stopped running.", boundaryCost: "A comparison score is not an arrival time.", boundaryTransfer: "Live predictions can change, so a possible transfer is not guaranteed.",
    explain: "Explain the recommendation", explainBody: "Show why one route ranks first, what the other options offer, and where the data is limited.",
    footerNote: "An independent research prototype. Not an official SFMTA service.", reportIssue: "Report an issue"
  },
  zh: {
    navNetwork: "现在的 Muni", navJourney: "规划行程", navContext: "更多出行信息", refresh: "获取最新数据", skipToMuni: "跳到 Muni 实时信息",
    eyebrow: "旧金山 Muni · 实时更新", heroTitle: "出发前，先选清楚怎么坐。",
    heroLead: "查看车辆位置和可能的长时间等待，再比较适合你的路线。",
    planJourney: "规划行程", viewNetwork: "查看现在的 Muni", howWorks: "看看结果怎么来的", vehiclesReporting: "个车辆位置",
    routesObserved: "条线路有实时信息", activeNotices: "条服务更新", liveNetwork: "现在的 Muni",
    seeCityMove: "出发前，先看看你的线路。", focusRoute: "选择线路", focusDirection: "选择方向", mapHint: "选择线路或方向后，地图会跟着更新。",
    routePulse: "现在运行得怎么样", vehicles: "车辆位置", medianGap: "车辆通常相隔多久", bunching: "几辆车挤在一起", serviceGaps: "两班车间隔过长", currentSpeed: "回报速度", evidence: "已查看的到站信息",
    routeOverview: "实时信息最完整的线路", directionNote: "同一条线路的两个方向可能不一样，所以会分开查看。",
    streetsService: "可能影响行程的情况", explainWhy: "把公交和道路更新放在一起看。",
    causalityNote: "线路附近的道路事件可能影响公交，但不能单凭位置接近就认定它造成了延误。",
    serviceNotices: "Muni 服务更新", roadEvents: "附近道路施工与事件", journeyDecision: "规划行程",
    whereGoing: "你想从哪里去哪里？", plannerLead: "选择两个 Muni 站点。我们会用最新数据比较直达和一次换乘的路线。",
    dynamicPlanner: "实时预测与估算 · 测试版", fromStop: "起点站", toStop: "终点站", findRoute: "比较路线", tryExample: "试试示例行程",
    journeyMapHint: "实线是公交路段，虚线是步行连接。", journeyTimeline: "行程步骤",
    journeyReliability: "这趟行程稳不稳定？", journeySafety: "历史事件参考",
    threeWays: "按你最在意的事情来选。", referenceCase: "参考行程", alternatives: "其他路线",
    tradeoffs: "比较时间、步行和换乘。", route: "线路", eta: "预计行程时间", walk: "步行", reliability: "当前运行情况",
    exposure: "历史事件参考", cityContext: "更多出行信息", moreThanBus: "看看其他可能影响出行的情况。",
    parkingDemand: "近期停车付费情况", safetyContext: "历史事件参考", dataQuality: "这些数据有多新？",
    methodEyebrow: "每个结果是怎么得出的", evidenceTitle: "推荐路线前，我们会检查这些信息。",
    northStarBody: "SF Transit Pulse 只想回答一个实用问题：我现在该坐什么？为什么？", evidenceBody: "数据能说明多少，我们就只说多少。",
    observe: "收集最新信息", observeBody: "查看车辆位置、预计到站时间、服务通知、线路路径，以及每份数据的更新时间。",
    diagnose: "分方向检查每条线路", diagnoseBody: "查看车辆间隔是否稳定、是否挤在一起、会不会等很久，以及实时信息是否足够。",
    build: "找出可能坐得上的路线", buildBody: "比较直达和一次换乘。有完整实时预测时，会检查两趟具体班次是否接得上；数据不足时会明确写成估算。",
    compare: "按你的需要比较", compareBody: "最快到达优先看时间；综合推荐也考虑等车稳定性、步行和换乘；安全优先仍在等待行程级历史事件数据。",
    boundariesTitle: "请注意这些限制", boundarySafety: "历史事件记录不能判断你这次出行是否安全。", boundaryRoad: "附近有道路事件，不代表它一定造成了公交延误。", boundaryMissing: "没有实时信息，不代表这条线路已经停运。", boundaryCost: "路线比较分数不等于预计到达时间。", boundaryTransfer: "实时到站预测仍会变化，所以显示能换乘也不代表一定赶得上。",
    explain: "说明推荐理由", explainBody: "告诉你为什么这条路线排在前面、其他路线有什么不同，以及哪些数据仍然不足。",
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
  document.getElementById("language-toggle").setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换到中文");
  const originInput = document.getElementById("origin-input");
  const destinationInput = document.getElementById("destination-input");
  const swapButton = document.getElementById("swap-stops");
  if (originInput) originInput.placeholder = language === "zh" ? "输入站名，再从列表中选择" : "Enter a stop name, then choose from the list";
  if (destinationInput) destinationInput.placeholder = language === "zh" ? "输入站名，再从列表中选择" : "Enter a stop name, then choose from the list";
  if (swapButton) {
    const label = language === "zh" ? "交换起点和终点" : "Swap starting and destination stops";
    swapButton.setAttribute("aria-label", label);
    swapButton.title = label;
  }
  const routeSelect = document.getElementById("route-select");
  const directionSelect = document.getElementById("direction-select");
  const networkMap = document.getElementById("map");
  if (routeSelect) routeSelect.setAttribute("aria-label", language === "zh" ? "选择 Muni 线路" : "Choose a Muni route");
  if (directionSelect) directionSelect.setAttribute("aria-label", language === "zh" ? "选择线路方向" : "Choose a route direction");
  if (networkMap) networkMap.setAttribute("aria-label", language === "zh" ? "Muni 实时车辆位置地图" : "Map of current Muni vehicle locations");
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
  const raw = String(health || "NO_DATA");
  let key = raw.toUpperCase();
  if (!["STABLE", "WATCH", "UNSTABLE", "LIMITED_REALTIME_DATA", "NO_DATA"].includes(key)) {
    if (key.includes("UNSTABLE")) key = "UNSTABLE";
    else if (key.includes("LIMITED") || key.includes("NO DATA")) key = "LIMITED_REALTIME_DATA";
    else if (key.includes("WATCH")) key = "WATCH";
    else if (key.includes("STABLE")) key = "STABLE";
  }
  const en = {STABLE:"Vehicles are arriving steadily", WATCH:"Some waits may be longer", UNSTABLE:"Wait times may vary a lot", LIMITED_REALTIME_DATA:"Not enough live data", NO_DATA:"Not enough live data"};
  const zh = {STABLE:"车辆到站间隔比较稳定", WATCH:"部分路段可能要多等一会", UNSTABLE:"等车时间可能变化较大", LIMITED_REALTIME_DATA:"实时信息不足", NO_DATA:"实时信息不足"};
  return (language === "zh" ? zh : en)[key] || raw.replaceAll("_", " ");
}

function qualityCopy(value) {
  const key = String(value || "LIMITED");
  const en = {GOOD:"Enough live data", MODERATE:"Some live data", LIMITED:"Very little live data"};
  const zh = {GOOD:"实时信息较充足", MODERATE:"有一些实时信息", LIMITED:"实时信息很少"};
  return (language === "zh" ? zh : en)[key] || key;
}

function transitSource() {
  const declared = snapshot?.meta?.source_status?.transit || {};
  const containsDemoIds = (snapshot?.vehicles || []).some(row => String(row.vehicle_id || "").startsWith("demo-"));
  const status = declared.status || (containsDemoIds ? "retained_sample" : snapshot?.meta?.status === "live" ? "live" : "retained");
  return {status, observed_at: declared.observed_at || null, isLive: status === "live", isSample: status === "retained_sample" || containsDemoIds};
}

function vehicleCoverage() {
  const knownRouteIds = new Set((network?.routes || []).map(route => String(route.route_id)));
  const all = snapshot?.vehicles || [];
  const mapped = [];
  const unassigned = [];
  all.forEach(vehicle => {
    const routeId = String(vehicle.route_id || "").trim();
    if (routeId && routeId !== "UNKNOWN" && knownRouteIds.has(routeId)) mapped.push(vehicle);
    else unassigned.push(vehicle);
  });
  return {mapped, unassigned, total: all.length};
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
  const sourceLabel = transit.isLive ? (language === "zh" ? "511 实时车辆与到站信息" : "Live vehicles and arrivals from 511") :
    transit.isSample ? (language === "zh" ? "演示数据 · 不是当前车辆" : "Demo data · not current vehicles") :
    (language === "zh" ? "上一次成功获取的数据 · 目前尚未更新" : "Last successful update · not current");
  const transitAge = transit.observed_at ? ` · ${timeAgo(transit.observed_at)}` : "";
  document.getElementById("freshness-label").textContent = sourceLabel + transitAge;
  document.getElementById("generated-at").textContent = generated ? `${language === "zh" ? "页面更新时间" : "Page updated"}: ${generated.toLocaleString()}` : (language === "zh" ? "页面更新时间不明" : "Page update time unavailable");
  document.getElementById("quality-status").textContent = sourceLabel;
  const failures = meta.errors || [];
  const sourceCheckMessage = failures.length ?
    (language === "zh" ? `${failures.length} 项数据暂时无法更新。页面会明确标出旧数据或演示数据。` : `${failures.length} data source${failures.length === 1 ? " is" : "s are"} temporarily unavailable. Older or demo data is clearly labeled.`) :
    (language === "zh" ? "本次更新已成功检查所有已连接的数据。" : "All connected data sources were checked successfully.");
  const unassignedCount = vehicleCoverage().unassigned.length;
  const unassignedMessage = unassignedCount ? (language === "zh"
    ? `${unassignedCount} 个实时车辆位置暂时无法对应到乘客线路，因此不会显示在地图或用于线路分析。`
    : `${unassignedCount} live vehicle location${unassignedCount === 1 ? "" : "s"} cannot be matched to a passenger route, so we leave them off the map and out of route analysis.`) : "";
  document.getElementById("quality-detail").textContent = [sourceCheckMessage, unassignedMessage].filter(Boolean).join(" ");
  const transitFreshness = transit.observed_at ? timeAgo(transit.observed_at) : (transit.isSample ? (language === "zh" ? "演示数据 · 时间不明" : "Demo data · time unavailable") : (language === "zh" ? "更新时间不明" : "Update time unavailable"));
  const freshnessRows = [
    [language === "zh" ? "车辆与到站时间" : "Vehicles and arrivals", transitFreshness],
    [language === "zh" ? "线路和站点" : "Routes and stops", network?.meta?.feed_version ? `${language === "zh" ? "数据版本" : "Data version"} ${network.meta.feed_version}` : "—"],
    [language === "zh" ? "停车付费活动" : "Paid parking activity", timeAgo(snapshot.parking?.source_snapshot_time)],
    [language === "zh" ? "历史事件记录" : "Historical incident records", snapshot?.meta?.source_status?.safety?.observed_at ? timeAgo(snapshot.meta.source_status.safety.observed_at) : (language === "zh" ? "更新时间不明" : "Update time unavailable")]
  ];
  document.getElementById("source-freshness").innerHTML = freshnessRows.map(([label,value]) => `<div class="evidence-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function renderHero() {
  const coverage = coverageSummary();
  const transit = transitSource();
  const vehicles = vehicleCoverage();
  document.getElementById("vehicle-count").textContent = fmt(vehicles.mapped.length);
  document.getElementById("unassigned-count").textContent = fmt(vehicles.unassigned.length);
  document.getElementById("route-count").textContent = `${coverage.routesWithEvidence} / ${coverage.totalRoutes || "—"}`;
  document.getElementById("issue-count").textContent = fmt(coverage.issues);
  document.getElementById("vehicle-count-label").textContent = transit.isLive ? (language === "zh" ? "个已匹配线路的实时车辆" : "live vehicles matched to a route") : (language === "zh" ? "个已匹配线路的演示车辆" : "demo vehicles matched to a route");
  document.getElementById("unassigned-count-label").textContent = transit.isLive ? (language === "zh" ? "个暂时无法归属线路的位置" : "live positions not assigned to a route") : (language === "zh" ? "个无法归属线路的演示位置" : "demo positions not assigned to a route");
  document.getElementById("route-count-label").textContent = transit.isLive ? (language === "zh" ? "条线路当前有实时回报" : "routes reporting right now") : (language === "zh" ? "条线路出现在演示数据中" : "routes shown in demo data");
  document.getElementById("issue-count-label").textContent = language === "zh" ? "个方向可能需要多等" : "directions with possible longer waits";
  const overviewTitle = document.querySelector('[data-i18n="routeOverview"]');
  if (overviewTitle) overviewTitle.textContent = transit.isLive ? (language === "zh" ? "实时信息最完整的线路" : "Routes with the clearest live picture") : (language === "zh" ? "演示数据中的线路" : "Routes in the demo data");
}

function renderRouteSelector() {
  const select = document.getElementById("route-select");
  const evidenceRouteIds = new Set((snapshot.routes || []).map(row => String(row.route_id)));
  const allRoutes = network?.routes || [];
  const routes = appState.routeScope === "evidence" ? allRoutes.filter(route => evidenceRouteIds.has(String(route.route_id))) : allRoutes;
  const overviewLabel = language === "zh" ? "查看全部 Muni" : "View all Muni";
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
  document.getElementById("evidence-routes-button").textContent = transitSource().isLive ? (language === "zh" ? "现在有实时信息" : "Live updates available") : (language === "zh" ? "演示数据中的线路" : "Routes in demo data");
  document.getElementById("all-routes-button").textContent = language === "zh" ? "全部 Muni 线路" : "All Muni routes";
  const layerLabels = {
    vehicles: language === "zh" ? "车辆" : "Vehicles",
    route: language === "zh" ? "线路路径" : "Route path",
    stops: language === "zh" ? "站点" : "Stops",
    issues: language === "zh" ? "等待时间异常" : "Uneven or long waits",
    roads: language === "zh" ? "道路施工与事件" : "Street work and events"
  };
  const legend = document.querySelector("#map-layer-control legend");
  if (legend) legend.textContent = language === "zh" ? "地图上显示" : "Show on map";
  document.querySelectorAll("#map-layer-control input[data-layer]").forEach(input => {
    const label = input.parentElement?.querySelector("span");
    if (label) label.textContent = layerLabels[input.dataset.layer] || input.dataset.layer;
  });
}

function routeCatalogEntry(routeId) {
  return (network?.routes || []).find(route => String(route.route_id) === String(routeId)) || null;
}

function directionLabelCopy(value, directionId = "") {
  const label = String(value || "");
  if (language !== "zh") return label || `Direction ${directionId}`;
  const numbered = label.match(/^Direction\s+(\d+)$/i);
  if (numbered) return `方向 ${numbered[1]}`;
  return label || `方向 ${directionId}`;
}

function renderDirectionSelector() {
  const select = document.getElementById("direction-select");
  const directions = routeCatalogEntry(appState.selectedRoute)?.directions || [];
  select.disabled = appState.selectedRoute === "all" || !directions.length;
  select.innerHTML = `<option value="all">${language === "zh" ? "全部方向" : "All directions"}</option>` + directions.map(direction => {
    const headsign = direction.headsign ? ` · ${direction.headsign}` : "";
    return `<option value="${escapeHtml(direction.direction_id)}">${escapeHtml(directionLabelCopy(direction.direction_label, direction.direction_id) + headsign)}</option>`;
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

  const vehicles = vehicleCoverage().mapped.filter(vehicle => selectionMatches(vehicle, routeId, directionId));
  vehicles.forEach(vehicle => {
    if (!hasNumber(vehicle.lat) || !hasNumber(vehicle.lon)) return;
    const point = [Number(vehicle.lat), Number(vehicle.lon)];
    bounds.push(point);
    const routeDetail = directionEntries(String(vehicle.route_id), String(vehicle.direction_id))[0];
    const routeHealth = (snapshot.routes || []).find(row => selectionMatches(row, String(vehicle.route_id), String(vehicle.direction_id)))?.health || "NO_DATA";
    const destination = vehicle.destination || routeDetail?.headsign || (language === "zh" ? "暂时没有终点信息" : "Destination not available");
    const speed = hasNumber(vehicle.speed_mps) ? `${fmt(Number(vehicle.speed_mps) * 2.23694, 1)} mph` : (language === "zh" ? "暂无数据" : "Not reported");
    const sampleLabel = transitSource().isSample ? `<br><span class="event-scope">${language === "zh" ? "演示数据" : "Demo data"}</span>` : "";
    L.circleMarker(point, {radius: 6, color: "#ffffff", weight: 2, fillColor: "#0066cc", fillOpacity: .98})
      .bindPopup(`<div class="vehicle-popup"><strong>${language === "zh" ? "线路" : "Route"} ${escapeHtml(vehicle.route_id || "—")}</strong>${sampleLabel}<br>→ ${escapeHtml(destination)}<br>${language === "zh" ? "车辆编号" : "Vehicle"}: ${escapeHtml(vehicle.vehicle_id || "—")}<br>${language === "zh" ? "回报速度" : "Reported speed"}: ${escapeHtml(speed)}<br>${language === "zh" ? "位置更新时间" : "Location updated"}: ${hasNumber(vehicle.age_seconds) ? (language === "zh" ? `${fmt(vehicle.age_seconds)} 秒前` : `${fmt(vehicle.age_seconds)} sec ago`) : "—"}<br>${language === "zh" ? "当前运行情况" : "Current service"}: ${escapeHtml(healthCopy(routeHealth))}</div>`)
      .addTo(mapLayers.vehicles);
  });

  const issueRows = (snapshot.routes || []).filter(row => selectionMatches(row, routeId, directionId));
  issueRows.flatMap(row => (row.spacing_events || []).map(event => ({...event, route_id:row.route_id, direction_id:row.direction_id}))).forEach(event => {
    if (!hasNumber(event.lat) || !hasNumber(event.lon)) return;
    const point = [Number(event.lat), Number(event.lon)];
    const label = event.type === "BUNCHING" ? (language === "zh" ? "几辆车挤在一起" : "Vehicles close together") : (language === "zh" ? "两班车间隔过长" : "Long wait between vehicles");
    L.circleMarker(point, {radius: 8, color: "#ffffff", weight: 2, fillColor: "#ff9500", fillOpacity: 1})
      .bindPopup(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(event.location_name || event.reference_stop_id || (language === "zh" ? "附近站点" : "Nearby stop"))}<br>${language === "zh" ? `预计相隔 ${fmt(event.gap_min,1)} 分钟` : `Estimated ${fmt(event.gap_min,1)} minutes apart`}`)
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
  const directionLabel = direction ? ` · ${directionLabelCopy(direction.direction_label, direction.direction_id)}${direction.headsign ? ` → ${direction.headsign}` : ""}` : "";
  document.getElementById("map-label").textContent = routeId === "all" ?
    (language === "zh" ? "全部已匹配到线路的车辆" : "All vehicles matched to a route") :
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
  const vehicles = vehicleCoverage().mapped.filter(vehicle => selectionMatches(vehicle, routeId, directionId));
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
    return {code:"NO_CURRENT_GUIDANCE", label:language === "zh" ? "实时信息不足，请同时查看官方时刻和通知" : "Live data is limited; also check the official schedule and notices"};
  }
  if (health === "UNSTABLE") {
    return {code:"ALLOW_EXTRA", label:language === "zh" ? "建议预留额外时间" : "Allow extra time"};
  }
  if (["WATCH", "LIMITED_REALTIME_DATA"].includes(health)) {
    return {code:"CHECK", label:language === "zh" ? "部分等待可能较久，出发前再看一次" : "Some waits may be longer; check again before leaving"};
  }
  return {code:"USE_NORMALLY", label:language === "zh" ? "可按通常方式使用" : "Use normally"};
}

function renderIssueDetails(events, hasIssueCount) {
  const container = document.getElementById("focus-issues");
  if (!events.length) {
    container.innerHTML = hasIssueCount ? `<div class="issue-card"><strong>${language === "zh" ? "等待时间可能不均匀" : "Wait times may be uneven"}</strong><span>${language === "zh" ? "目前还不能在地图上标出具体位置。" : "A specific map location is not available yet."}</span></div>` : "";
    return;
  }
  container.innerHTML = events.slice(0,4).map(event => {
    const label = event.type === "BUNCHING" ? (language === "zh" ? "几辆车挤在一起" : "Vehicles close together") : (language === "zh" ? "两班车间隔过长" : "Long wait between vehicles");
    const location = event.location_name || event.reference_stop_id || (language === "zh" ? "具体位置不明" : "Location not available");
    const detail = `${hasNumber(event.gap_min) ? (language === "zh" ? `预计相隔 ${fmt(event.gap_min,1)} 分钟 · ` : `Estimated ${fmt(event.gap_min,1)} min apart · `) : ""}${location}`;
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
  const directionName = direction ? ` · ${directionLabelCopy(direction.direction_label, direction.direction_id)}${direction.headsign ? ` → ${direction.headsign}` : ""}` : "";
  const metrics = document.getElementById("focus-metrics");
  document.getElementById("focus-route-name").textContent = routeId === "all" ? (language === "zh" ? "所有 Muni 线路" : "All Muni routes") : `${routeName}${directionName}`;

  if (routeId === "all") {
    const coverage = coverageSummary();
    const vehicles = vehicleCoverage();
    const sampleNote = transitSource().isLive ? "" : (language === "zh" ? "（目前显示演示数据）" : " (demo data shown)");
    document.getElementById("focus-route-status").textContent = language === "zh" ? `每个方向分开查看，不会因为一条线路有问题就说整个 Muni 都不稳定${sampleNote}` : `We check each direction separately, so one troubled route does not label all of Muni as unstable${sampleNote}`;
    metrics.innerHTML = [
      metricRow(language === "zh" ? "地图上的车辆" : "Vehicles on the map", fmt(vehicles.mapped.length), transitSource().isSample ? (language === "zh" ? "演示数据" : "demo data") : ""),
      metricRow(language === "zh" ? "未归属线路的位置" : "Positions without a route", fmt(vehicles.unassigned.length), language === "zh" ? "已从地图和线路分析中排除" : "left off the map and out of route analysis"),
      metricRow(language === "zh" ? "当前有实时回报的线路" : "Routes reporting right now", `${coverage.routesWithEvidence} / ${coverage.totalRoutes}`),
      metricRow(language === "zh" ? "已检查的方向" : "Directions checked", `${coverage.directionsWithEvidence} / ${coverage.totalDirections}`),
      metricRow(language === "zh" ? "车辆间隔较稳定" : "Steady vehicle spacing", fmt(coverage.healthCounts.STABLE)),
      metricRow(language === "zh" ? "部分等待可能较久" : "Some waits may be longer", fmt(coverage.healthCounts.WATCH)),
      metricRow(language === "zh" ? "等车时间变化较大" : "Waits may vary a lot", fmt(coverage.healthCounts.UNSTABLE)),
      metricRow(language === "zh" ? "实时信息不足" : "Not enough live data", fmt(coverage.noData))
    ].join("");
    document.getElementById("focus-issues").innerHTML = "";
    document.getElementById("focus-explanation").textContent = language === "zh" ?
      "这里只显示能对应到乘客线路的车辆。暂时无法归属线路的位置不会被猜测，也不会参与线路判断。没有实时信息的线路可能仍在正常运营。" :
      "We only show vehicles matched to a passenger route. We do not guess where unassigned positions belong or use them in route results. A route without live data may still be operating.";
    return;
  }

  const data = combinedRoute(routeId, directionId);
  const advice = routeAdvice(data.health, data.evidence_count);
  const positionLabel = transitSource().isSample ? (language === "zh" ? "演示车辆位置" : "Demo vehicle locations") : (language === "zh" ? "地图上的实时车辆" : "Live vehicles on the map");
  document.getElementById("focus-route-status").textContent = healthCopy(data.health);
  metrics.innerHTML = [
    metricRow(language === "zh" ? "现在怎么做" : "What to do now", advice.label),
    metricRow(positionLabel, fmt(data.live_position_count), transitSource().isSample ? (language === "zh" ? "不是当前车辆数量" : "not a current vehicle count") : ""),
    metricRow(language === "zh" ? "已查看的到站信息" : "Arrival estimates checked", fmt(data.evidence_count), qualityCopy(data.evidence_quality)),
    metricRow(language === "zh" ? "车辆通常相隔多久" : "Vehicles are usually this far apart", Number.isFinite(data.median_headway_min) ? (language === "zh" ? `${fmt(data.median_headway_min,1)} 分钟` : `${fmt(data.median_headway_min,1)} min`) : "—"),
    metricRow(language === "zh" ? "几辆车挤在一起" : "Groups of close-together vehicles", data.bunching_events ? (language === "zh" ? `发现 ${data.bunching_events} 处` : `${data.bunching_events} found`) : (language === "zh" ? "没有发现" : "None found")),
    metricRow(language === "zh" ? "两班车间隔过长" : "Long gaps between vehicles", data.service_gap_events ? `${data.service_gap_events}${data.severe_gap_events ? (language === "zh" ? ` · 其中 ${data.severe_gap_events} 处很长` : ` · ${data.severe_gap_events} very long`) : ""}` : (language === "zh" ? "没有发现" : "None found")),
    metricRow(language === "zh" ? "车辆通常回报的速度" : "Typical reported speed", Number.isFinite(data.speed_mph) ? `${fmt(data.speed_mph,1)} mph` : (language === "zh" ? "暂无数据" : "Not reported"))
  ].join("");
  renderIssueDetails(data.spacing_events, data.bunching_events + data.service_gap_events > 0);
  document.getElementById("focus-explanation").textContent = language === "zh" ?
    `正在查看 ${routeId}${direction ? ` 的${directionLabelCopy(direction.direction_label, direction.direction_id)}` : " 的全部方向"}。每个方向单独检查。车辆位置和到站信息来自不同数据，所以数量可能不一样。` :
    `Viewing ${routeId}${direction ? ` ${directionLabelCopy(direction.direction_label, direction.direction_id)}` : " in all directions"}. We check each direction separately. Vehicle locations and arrival estimates come from different sources, so their counts may differ.`;
}

function renderRouteGrid() {
  const rows = (snapshot.routes || []).slice().sort((a,b) => Number(b.predictions_observed || 0)-Number(a.predictions_observed || 0)).slice(0,12);
  const grid = document.getElementById("route-grid");
  const note = transitSource().isLive ? "" : `<p class="coverage-note">${language === "zh" ? "下面显示的是演示数据，不代表现在的车辆或服务。" : "The cards below show demo data, not current vehicles or service."}</p>`;
  grid.innerHTML = note + (rows.length ? rows.map(row => {
    const positions = vehicleCoverage().mapped.filter(vehicle => selectionMatches(vehicle, row.route_id, row.direction_id)).length;
    return `
    <article class="route-card" tabindex="0" role="button" data-route="${escapeHtml(row.route_id)}" data-direction="${escapeHtml(row.direction_id)}" aria-pressed="${String(row.route_id) === String(appState.selectedRoute) && String(row.direction_id) === String(appState.selectedDirection)}" aria-label="${language === "zh" ? `查看线路 ${escapeHtml(row.route_id)} 的方向 ${escapeHtml(row.direction_id)}` : `View route ${escapeHtml(row.route_id)} direction ${escapeHtml(row.direction_id)}`}">
      <span class="route-number">${escapeHtml(row.route_id)}</span>
      <span class="direction">${escapeHtml(directionLabelCopy(row.direction_label, row.direction_id ?? "—"))}</span>
      <p class="health">${escapeHtml(healthCopy(row.health))}</p>
      <p class="detail">${positions} ${language === "zh" ? "个车辆位置" : "vehicle locations"} · ${fmt(row.predictions_observed)} ${language === "zh" ? "条到站信息" : "arrival estimates"}<br>${hasNumber(row.median_headway_min) ? (language === "zh" ? `车辆通常相隔 ${fmt(row.median_headway_min,1)} 分钟` : `Usually ${fmt(row.median_headway_min,1)} min between vehicles`) : (language === "zh" ? "实时信息不足，暂时不能估算车辆间隔" : "Not enough live data to estimate vehicle spacing")}</p>
      <span class="card-action">${language === "zh" ? "查看线路 →" : "View route →"}</span>
    </article>`;
  }).join("") : `<p>${language === "zh" ? "目前没有可显示的线路实时信息。请稍后获取最新数据。" : "No route updates are available right now. Get the latest update in a few minutes."}</p>`);
  grid.querySelectorAll(".route-card").forEach(card => {
    const select = () => selectRoute(card.dataset.route, card.dataset.direction, true);
    card.addEventListener("click", select);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }});
  });
}

function eventTextCopy(value) {
  const text = String(value || "");
  if (language !== "zh") return text;
  return text
    .replace(/STOP TEMP\. MOVED/gi, "站点临时移位。")
    .replace(/STOP PERMANENTLY MOVED/gi, "站点已永久移位。")
    .replace(/Board at stop island/gi, "请在站台岛上车")
    .replace(/Board at/gi, "请在此上车：")
    .replace(/\bACTIVE\b/gi, "进行中")
    .replace(/\s+OR\s+/gi, " 或 ");
}

function roadEventTitleCopy(item) {
  const title = String(item.title || "");
  if (language !== "zh") return title || "Street work update";
  const road = title.match(/\b(?:CA|US|I)-\d+\b/i)?.[0] || "道路";
  const direction = /Eastbound and Westbound/i.test(title) ? "双向" :
    /Eastbound/i.test(title) ? "东向" : /Westbound/i.test(title) ? "西向" :
    /Northbound/i.test(title) ? "北向" : /Southbound/i.test(title) ? "南向" : "";
  const activity = /Long-term construction/i.test(title) ? "长期施工" : "施工";
  const location = title.match(/(?:east of|west of|at|between)\s+([^.;]+)/i)?.[1];
  const closure = /Lane closed/i.test(title) ? "，部分车道封闭" : "";
  return `${road}${direction ? ` ${direction}` : ""}${activity}${location ? `，位置：${location}` : ""}${closure}。`;
}

function renderEvents(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const list = (id, events, emptyText) => {
    document.getElementById(id).innerHTML = events.length ? events.slice(0,5).map(item => {
      const ids = normalizedRouteIds(item);
      const scope = ids.length ? `${language === "zh" ? "可能影响线路" : "May affect route"} ${ids.join(", ")}` : (item.route_match_status === "UNAVAILABLE" ? (language === "zh" ? "暂时无法确定具体线路" : "Specific routes not identified yet") : (language === "zh" ? "可能影响多条线路" : "May affect several routes"));
      const title = id === "road-list" ? roadEventTitleCopy(item) : eventTextCopy(item.title || item.route_id || (language === "zh" ? "出行提示" : "Travel update"));
      const sourceDetail = item.description || item.status || "";
      const detail = eventTextCopy(sourceDetail);
      const showDetail = detail && String(sourceDetail).trim() !== String(item.title || "").trim();
      return `<article class="event-item"><span class="event-scope">${escapeHtml(scope)}</span><strong>${escapeHtml(title)}</strong>${showDetail ? `<p>${escapeHtml(detail)}</p>` : ""}</article>`;
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
    language === "zh" ? `${routeId === "all" ? "目前没有新的 Muni 服务通知。" : `目前没有找到与 ${routeId} 相关的 Muni 服务通知。`}` : `${routeId === "all" ? "There are no new Muni service notices." : `No Muni service notices were found for ${routeId}.`}`
  );
  list(
    "road-list",
    roads,
    language === "zh" ? `${routeId === "all" ? "目前没有可显示的道路施工或事件。" : `目前没有找到与 ${routeId} 相关的道路施工或事件。`}` : `${routeId === "all" ? "No street work or events are available right now." : `No street work or events were found for ${routeId}.`}`
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

function modeName(mode) {
  const key = String(mode || "BALANCED");
  const en = {FASTEST:"Fastest", BALANCED:"Balanced", SAFETY_FIRST:"Safety-first"};
  const zh = {FASTEST:"最快到达", BALANCED:"综合推荐", SAFETY_FIRST:"安全优先"};
  return (language === "zh" ? zh : en)[key] || key.replaceAll("_", "-");
}

function modeExplanation(mode, available = true) {
  const key = String(mode || "BALANCED");
  if (key === "SAFETY_FIRST" && !available) {
    return language === "zh"
      ? "暂时不能使用：站点级历史事件数据还没有接入路线比较。"
      : "Not available yet: stop-level historical incident data is not connected to route comparison.";
  }
  const en = {
    FASTEST:"Gets you there soonest based on current estimates.",
    BALANCED:"Balances time, steady service, walking, and transfers.",
    SAFETY_FIRST:"Also considers trip-level historical incident context."
  };
  const zh = {
    FASTEST:"按当前估算，优先选择最快到达的路线。",
    BALANCED:"同时考虑时间、等车稳定性、步行和换乘。",
    SAFETY_FIRST:"还会参考这趟行程沿途的历史事件情况。"
  };
  return (language === "zh" ? zh : en)[key] || "";
}

// Feature 20 · Realtime trip copy / 班次级实时结果文案
// 中文：时间统一按旧金山时区显示；同时把“完整实时预测、部分实时、估算”分开，
// 避免用户在其他时区打开网页时看到错误钟点，也避免把估算包装成实时 ETA。
// English: Always show San Francisco clock time and name the evidence level so
// an estimate is never presented as a concrete realtime arrival.
function sfTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}

function timingSource(status) {
  if (status === "REALTIME_TRIP_PREDICTION") {
    return language === "zh" ? "实时到站预测" : "Live arrival prediction";
  }
  if (status === "MIXED_REALTIME") {
    return language === "zh" ? "部分实时，部分估算" : "Part live, part estimated";
  }
  return language === "zh" ? "根据当前班次间隔估算" : "Estimated from current service spacing";
}

function renderModeCards(modes) {
  const grid = document.getElementById("mode-grid");
  const safetyReady = appState.plannerResult?.meta?.safety_status === "STOP_LEVEL_LIVE";
  grid.dataset.modeCount = String(modes.length);
  grid.innerHTML = modes.map(mode => {
    const unavailable = mode.mode === "SAFETY_FIRST" && !safetyReady;
    const availability = unavailable ? (language === "zh" ? " · 暂不可用" : " · Not available yet") : "";
    const explanation = modeExplanation(mode.mode, !unavailable);
    return `
    <button type="button" class="mode-card ${unavailable ? "unavailable" : ""}" data-mode="${escapeHtml(mode.mode)}" aria-pressed="${!unavailable && mode.mode === appState.selectedMode}" ${unavailable ? "disabled aria-disabled=\"true\"" : ""}>
      <span class="mode-label">${escapeHtml(modeName(mode.mode))}${mode.mode === "BALANCED" ? (language === "zh" ? " · 默认" : " · Default") : ""}${availability}</span>
      <p class="mode-route">${unavailable ? (language === "zh" ? "还不能比较" : "Cannot compare yet") : escapeHtml(mode.route || "—")}</p>
      <p class="mode-eta">${unavailable ? "—" : `${fmt(mode.eta_min,1)} min`}</p>
      <p>${escapeHtml(explanation)}</p>
      <dl>
        <div><dt>${language === "zh" ? "步行" : "Walking"}</dt><dd>${unavailable ? "—" : `${fmt(mode.walking_min,1)} min`}</dd></div>
        <div><dt>${language === "zh" ? "换乘" : "Transfers"}</dt><dd>${unavailable ? "—" : fmt(mode.transfer_count)}</dd></div>
        <div><dt>${language === "zh" ? "当前运行" : "Current service"}</dt><dd>${unavailable ? "—" : escapeHtml(healthCopy(mode.reliability_label))}</dd></div>
      </dl>
    </button>`;
  }).join("");
  grid.querySelectorAll(".mode-card:not([disabled])").forEach(card => card.addEventListener("click", () => {
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
    const departure = sfTime(leg.predicted_departure);
    const slack = hasNumber(leg.catch_slack_min)
      ? (language === "zh" ? ` · 换乘余量 ${Number(leg.catch_slack_min) >= 0 ? "+" : ""}${fmt(leg.catch_slack_min,1)} 分钟` : ` · Transfer slack ${Number(leg.catch_slack_min) >= 0 ? "+" : ""}${fmt(leg.catch_slack_min,1)} min`)
      : "";
    const time = departure
      ? (language === "zh" ? `预计 ${departure} 发车` : `Predicted departure ${departure}`)
      : `${fmt(leg.duration_min,1)} min`;
    return {
      title: `${language === "zh" ? "等候" : "Wait for"} ${leg.route_id || "Muni"}`,
      detail: `${time}${slack} · ${timingSource(leg.timing_status)}`
    };
  }
  if (leg.type === "RIDE") {
    const toward = leg.headsign ? ` · ${language === "zh" ? "开往" : "toward"} ${leg.headsign}` : "";
    const departure = sfTime(leg.predicted_departure);
    const arrival = sfTime(leg.predicted_arrival);
    const clock = departure && arrival ? `${departure} → ${arrival} · ` : "";
    const trip = leg.trip_id ? (language === "zh" ? ` · 班次 ${leg.trip_id}` : ` · Trip ${leg.trip_id}`) : "";
    return {
      title: `${language === "zh" ? "乘坐" : "Ride"} ${leg.route_id}${toward}`,
      detail: `${leg.from?.name || "—"} → ${leg.to?.name || "—"} · ${clock}${fmt(leg.duration_min,1)} min · ${fmt(leg.stop_count)} ${language === "zh" ? "站" : "stops"}${trip} · ${timingSource(leg.timing_status)}`
    };
  }
  return {title: leg.type || "Step", detail: ""};
}

function renderJourneyTimeline(journey) {
  document.getElementById("selected-journey-title").textContent = journey.route_sequence;
  const transferCopy = {
    CATCHABLE: language === "zh" ? "按当前预测，换乘时间充足" : "Current predictions leave enough time to transfer",
    TIGHT: language === "zh" ? "按当前预测，换乘时间较紧" : "Current predictions show a tight transfer",
    MISS: language === "zh" ? "按当前预测，可能赶不上换乘" : "Current predictions suggest you may miss the connection"
  };
  const transfer = journey.transfer ? ` · ${transferCopy[journey.transfer.catchability] || (language === "zh" ? "换乘时间为估算" : "Transfer time is estimated")}` : "";
  document.getElementById("selected-journey-summary").textContent = `${fmt(journey.eta_min,1)} min · ${fmt(journey.walking_min,1)} min ${language === "zh" ? "步行" : "walking"} · ${timingSource(journey.eta_status)}${transfer}`;
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
    <div class="evidence-row"><span>${escapeHtml(`${row.route_id} · ${healthCopy(row.health)}`)}</span><strong>${hasNumber(row.median_headway_min) ? (language === "zh" ? `通常相隔 ${fmt(row.median_headway_min,1)} 分钟` : `Usually ${fmt(row.median_headway_min,1)} min apart`) : (language === "zh" ? "实时信息不足" : "Not enough live data")}</strong></div>
    <p class="fine-print">${language === "zh" ? `${fmt(row.bunching_events)} 处车辆挤在一起 · ${fmt(row.large_gap_events)} 处间隔过长 · 查看了 ${fmt(row.predictions_observed)} 条到站信息` : `${fmt(row.bunching_events)} close-together groups · ${fmt(row.large_gap_events)} long gaps · ${fmt(row.predictions_observed)} arrival estimates checked`}</p>`).join("");

  const safety = journey.safety || {};
  document.getElementById("journey-safety-status").textContent = language === "zh" ? "暂时没有行程级评分" : "No trip-level rating yet";
  const percentileRows = [
    [language === "zh" ? "上车区域" : "Boarding area", safety.boarding_percentile],
    [language === "zh" ? "换乘区域" : "Transfer area", safety.transfer_percentile],
    [language === "zh" ? "目的地区域" : "Destination area", safety.destination_percentile]
  ];
  document.getElementById("journey-safety-detail").innerHTML = percentileRows.map(([label,value]) => `
    <div class="evidence-row"><span>${escapeHtml(label)}</span><strong>${hasNumber(value) ? (language === "zh" ? `高于 ${fmt(value)}% 的区域` : `${fmt(value)}th percentile`) : (language === "zh" ? "暂无评分" : "Not rated")}</strong></div>`).join("") +
    `<p class="evidence-note">${language === "zh" ? "历史事件记录只能用于比较区域背景，不能预测犯罪，也不能保证个人安全。" : "Historical incident records only compare area context. They do not predict crime or guarantee personal safety."}</p>`;
}

function renderAlternatives(alternatives) {
  const list = document.getElementById("alternatives-list");
  const costKey = {FASTEST:"fastest", BALANCED:"balanced", SAFETY_FIRST:"safety_first"}[appState.selectedMode] || "balanced";
  const ranked = [...alternatives].sort((left, right) =>
    Number(left.costs?.[costKey] ?? left.eta_min) - Number(right.costs?.[costKey] ?? right.eta_min)
    || Number(left.eta_min) - Number(right.eta_min)
  );
  const selectedModeLabel = modeName(appState.selectedMode);
  list.innerHTML = ranked.map((row,index) => `
    <button type="button" class="alternative-card" data-journey-id="${escapeHtml(row.journey_id)}" aria-pressed="${row.journey_id === appState.selectedJourneyId}">
      <div class="alternative-card-header"><span class="alternative-card-route">${escapeHtml(row.route_sequence)}</span><span class="alternative-card-eta">${fmt(row.eta_min,1)} min</span></div>
      <p class="alternative-card-meta">${fmt(row.walking_min,1)} min ${language === "zh" ? "步行" : "walk"} · ${fmt(row.transfer_count)} ${language === "zh" ? "次换乘" : "transfers"} · ${escapeHtml(healthCopy(row.reliability))}</p>
      ${index === 0 ? `<span class="alternative-card-badge">${language === "zh" ? `${selectedModeLabel}的首选` : `Top choice for ${selectedModeLabel}`}</span>` : row.pareto_efficient ? `<span class="alternative-card-badge">${language === "zh" ? "值得一起比较" : "Worth comparing"}</span>` : ""}
    </button>`).join("");
  list.querySelectorAll(".alternative-card").forEach(card => card.addEventListener("click", () => {
    appState.selectedJourneyId = card.dataset.journeyId;
    renderJourney();
  }));
}

function renderPlannerEmpty() {
  document.getElementById("journey-od").textContent = language === "zh" ? "选择起点和终点后开始规划。" : "Choose an origin and destination to begin.";
  document.getElementById("mode-grid").dataset.modeCount = "3";
  document.getElementById("mode-grid").innerHTML = [
    ["FASTEST", true],
    ["BALANCED", true],
    ["SAFETY_FIRST", false]
  ].map(([mode, available], index) => `<div class="mode-card mode-preview ${available ? "" : "unavailable"}"><span class="mode-label">${modeName(mode)}${index === 1 ? (language === "zh" ? " · 默认" : " · Default") : ""}${available ? "" : (language === "zh" ? " · 暂不可用" : " · Not available yet")}</span><p>${modeExplanation(mode, available)}</p></div>`).join("");
  document.getElementById("alternatives-list").innerHTML = `<p class="planner-empty-inline">${language === "zh" ? "比较这趟行程后，其他可选路线会显示在这里。如果规划服务暂时不可用，我们会直接告诉你。" : "Other routes will appear here after you compare this trip. If trip planning is unavailable, we'll tell you directly."}</p>`;
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
    setPlannerError(language === "zh" ? "行程规划暂时不可用。你仍然可以在上方查看线路和实时车辆位置。" : "Trip planning is not available yet. You can still check routes and live vehicle locations above.");
    return;
  }
  const requestKey = `${originId}|${destinationId}|${appState.selectedMode}`;
  const button = document.getElementById("plan-trip-button");
  button.disabled = true;
  setPlannerStatus(language === "zh" ? "正在比较直达和一次换乘路线…" : "Comparing direct trips and trips with one transfer…");
  const coldStartMessage = setTimeout(() => setPlannerStatus(
    language === "zh" ? "行程规划正在启动。长时间没人使用后，第一次查询可能需要约一分钟…" : "Trip planning is starting. The first search after a quiet period may take about a minute…"
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
    const hasLivePrediction = (payload.alternatives || []).some(row => row.eta_status === "REALTIME_TRIP_PREDICTION");
    setPlannerStatus(hasLivePrediction
      ? (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。部分方案使用实时到站预测；预测仍可能变化。` : `Compared ${payload.alternatives?.length || 0} routes. Some options use live arrival predictions, which can still change.`)
      : (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。目前没有完整班次预测，时间按当前运行情况估算。` : `Compared ${payload.alternatives?.length || 0} routes. Complete trip predictions are unavailable, so times use current service estimates.`));
    renderJourney();
  } catch (error) {
    appState.plannerResult = null;
    appState.selectedJourneyId = null;
    renderPlannerEmpty();
    setPlannerError(language === "zh" ? "暂时无法比较路线。规划服务可能正在启动或短暂不可用，请一分钟后再试。" : "We couldn't compare routes. The trip service may be starting or temporarily unavailable. Try again in a minute.");
  } finally {
    clearTimeout(coldStartMessage);
    button.disabled = false;
  }
}

function renderContext() {
  const parking = snapshot.parking || {};
  const parkingStarts = String(parking.detail || "").match(/[\d,]+/)?.[0];
  document.getElementById("parking-status").textContent = language === "zh" ? "最近 3 小时的停车付费活动" : "Paid parking activity in the last 3 hours";
  document.getElementById("parking-detail").textContent = parkingStarts
    ? (language === "zh" ? `最近的数据中有 ${parkingStarts} 次停车付费开始记录。它反映付费活动，不代表实际还有多少空位。` : `${parkingStarts} paid parking sessions began in the latest data. This shows payment activity, not the number of open spaces.`)
    : (language === "zh" ? "停车付费记录可以反映附近活动多少，但不代表实际还有多少空位。" : "Parking payments can show nearby activity, but not the number of open spaces.");
  const safety = snapshot.safety || {};
  document.getElementById("safety-status").textContent = language === "zh" ? "过去 365 天的历史记录" : "Historical records from the past 365 days";
  document.getElementById("safety-detail").textContent = language === "zh" ? "这些记录只能帮助比较不同区域的历史情况，不能预测犯罪，也不能判断某个地方是否安全。" : "These records only compare past conditions across areas. They do not predict crime or label a place safe or unsafe.";
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
    document.getElementById("error-banner").textContent = language === "zh" ? "无法获取最新公交信息。请检查网络连接，然后点击“获取最新数据”。" : "We couldn't load the latest transit update. Check your connection, then select “Get latest update.”";
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
