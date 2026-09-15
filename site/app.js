const I18N = {
  en: {
    navNetwork: "Muni now", navJourney: "Plan a trip", navContext: "More travel info", refresh: "Check now", skipToMuni: "Skip to Muni updates",
    eyebrow: "SF Transit Pulse", heroTitle: "Know what to take. Know why.",
    heroLead: "Live Muni reliability and explainable journey recommendations.",
    planJourney: "Plan a trip", viewNetwork: "Explore Muni →", howWorks: "See how results are made", vehiclesReporting: "vehicle locations found",
    routesObserved: "routes with recent updates", activeNotices: "service updates", liveNetwork: "Muni right now",
    seeCityMove: "Check your route before you go.", focusRoute: "Choose a route", focusDirection: "Choose a direction", mapHint: "The map updates when you choose a route or direction.",
    routePulse: "What's happening", vehicles: "Vehicle locations", medianGap: "Time between vehicles", bunching: "Vehicles close together", serviceGaps: "Long waits", currentSpeed: "Reported speed", evidence: "Arrival estimates checked",
    routeOverview: "Routes needing attention", directionNote: "Each direction can run differently, so we check them separately.",
    viewRouteDetails: "View details →", viewAllRoutes: "View all routes →", showFewerRoutes: "Show fewer routes", openUpdates: "Open updates ＋", closeUpdates: "Close updates −",
    currentUpdates: "Current trip context", currentUpdatesTitle: "Service and street updates you can see now", viewAllUpdates: "View all updates →",
    streetsService: "What may affect your ride", explainWhy: "See service and street updates together.",
    causalityNote: "A street event near a route may affect service, but it does not prove what caused a delay.",
    serviceNotices: "Muni service updates", roadEvents: "Nearby street work", journeyDecision: "Plan your trip",
    whereGoing: "Where do you want to go?", plannerLead: "Choose two Muni stops. We'll compare direct trips and trips with one transfer using the latest available data.",
    dynamicPlanner: "Latest predictions + on-device planning · Public Beta", fromStop: "Starting stop", toStop: "Destination stop", browseAllStops: "Browse all stops", findRoute: "Compare routes", tryExample: "Try a sample trip",
    findingOptions: "Finding your best options…", loadingTrips: "Feasible Muni trips", loadingPredictions: "Current predictions", loadingTransfers: "Transfers", loadingReliability: "Route reliability",
    whyRoute: "Why this route?", exploreTrip: "Explore full trip →", recommendationEvidence: "Recommendation evidence", compareTwo: "Compare two options",
    quickComparison: "Quick comparison", recommendedVsFastest: "Recommended route vs fastest route", compareOtherOptions: "Compare any two routes →",
    visibleEvidence: "What may affect this trip", visibleEvidenceTitle: "Current movement, street work, and historical context",
    movementStreetTitle: "Current movement and street updates", historicalAreasTitle: "Historical context by trip area",
    journeyMapHint: "Transit legs are solid; walking connections are dotted.", journeyTimeline: "Your trip",
    journeyReliability: "How steady is this trip?", journeySafety: "Historical incident context", journeyParking: "Parking near your destination",
    threeWays: "Choose what matters most.", referenceCase: "Reference trip", alternatives: "Other routes",
    tradeoffs: "Compare time, walking, and transfers.", route: "Route", eta: "Estimated trip time", walk: "Walking", reliability: "Current service",
    exposure: "Historical incident context", cityContext: "More travel info", moreThanBus: "Other things that may affect your trip.",
    parkingDemand: "Recent parking activity", safetyContext: "Historical incident context", safetyExpand: "Read what this can—and cannot—tell you", dataQuality: "How current is this data?",
    methodEyebrow: "How we build each result", evidenceTitle: "What we check before recommending a trip.",
    northStarBody: "SF Transit Pulse answers one practical question: What should I take right now, and why?", evidenceBody: "We only say what the available data supports.",
    observe: "Collect current updates", observeBody: "Check vehicle locations, arrival estimates, service notices, route paths, and when each source was updated.",
    diagnose: "Check each route direction", diagnoseBody: "Look for steady vehicle spacing, vehicles too close together, long waits, and limited live data in each direction.",
    build: "Build trips you may be able to make", buildBody: "Compare direct and one-transfer trips. When complete live predictions are available, check whether two specific trips connect; otherwise label the time as an estimate.",
    compare: "Compare what matters to you", compareBody: "Fastest favors time. Balanced weighs time, steady service, walking, transfers, and only large historical differences. Historical context gives those past differences more weight.",
    boundariesTitle: "Important limits", boundarySafety: "Historical incident data cannot tell whether you will be safe.", boundaryRoad: "A nearby street event does not prove what caused a transit delay.", boundaryMissing: "No live update does not mean a route has stopped running.", boundaryCost: "A comparison score is not an arrival time.", boundaryTransfer: "Live predictions can change, so a possible transfer is not guaranteed.",
    explain: "Explain the recommendation", explainBody: "Show why one route ranks first, what the other options offer, and where the data is limited.",
    nearbyEyebrow: "Start from where you are", nearbyTitle: "Find Muni stops near you",
    nearbyLead: "Choose a distance, then allow location access. We'll show every Muni stop inside that range and the routes you can take there.",
    nearbyRadiusLabel: "Search within", nearbyButton: "Find nearby stops",
    nearbyPrivacy: "Your location is used only on this page to calculate distance. It is not uploaded or saved.",
    nearbyInitial: "Select “Find nearby stops” when you're ready to share your location with this page.",
    highlightsEyebrow: "Beyond a single ETA", highlightsTitle: "See what an ETA alone can miss.",
    highlightDirection: "Direction health", highlightDirectionBody: "Check each direction separately for uneven spacing and longer waits.",
    highlightTransfer: "Can you catch the transfer?", highlightTransferBody: "See the expected connection buffer when two concrete trips are available.",
    highlightWhy: "Why this route?", highlightWhyBody: "Open the evidence only when you want to understand the recommendation.",
    decisionStoryEyebrow: "A useful tradeoff", decisionStoryTitle: "Fastest isn't always the easiest trip.",
    storyFastest: "FASTEST", storyFastMeta: "8 min walk · 1 transfer · Watch",
    storyBalanced: "BALANCED", storyBalancedMeta: "3 min walk · Direct · Stable",
    decisionStoryMiddle: "Less walking. No transfer. Steadier service.",
    comparisonEyebrow: "Option A vs Option B", comparisonTitle: "Compare two routes side by side",
    comparisonHelp: "Choose any two options to see the tradeoffs without switching back and forth.",
    freshnessFeature: "Old data doesn't stay “live.”",
    footerNote: "An independent research prototype. Not an official SFMTA service.", footerVersion: "v1.4 · Decision Support Beta",
    footerData: "Data: 511 SF Bay · DataSF · SFMTA", footerMap: "Map © OpenStreetMap contributors", reportIssue: "Report an issue"
  },
  zh: {
    navNetwork: "现在的 Muni", navJourney: "规划行程", navContext: "更多出行信息", refresh: "立即检查", skipToMuni: "跳到 Muni 实时信息",
    eyebrow: "SF Transit Pulse", heroTitle: "知道坐什么，也知道为什么。",
    heroLead: "查看 Muni 当前运行情况，并获得说得清理由的行程推荐。",
    planJourney: "规划行程", viewNetwork: "查看 Muni →", howWorks: "看看结果怎么来的", vehiclesReporting: "个车辆位置",
    routesObserved: "条线路有近期信息", activeNotices: "条服务更新", liveNetwork: "现在的 Muni",
    seeCityMove: "出发前，先看看你的线路。", focusRoute: "选择线路", focusDirection: "选择方向", mapHint: "选择线路或方向后，地图会跟着更新。",
    routePulse: "现在运行得怎么样", vehicles: "车辆位置", medianGap: "车辆通常相隔多久", bunching: "几辆车挤在一起", serviceGaps: "两班车间隔过长", currentSpeed: "回报速度", evidence: "已查看的到站信息",
    routeOverview: "需要留意的线路", directionNote: "同一条线路的两个方向可能不一样，所以会分开查看。",
    viewRouteDetails: "查看详情 →", viewAllRoutes: "查看全部线路 →", showFewerRoutes: "收起线路", openUpdates: "展开更新 ＋", closeUpdates: "收起更新 −",
    currentUpdates: "当前出行背景", currentUpdatesTitle: "现在可查看的公交与道路更新", viewAllUpdates: "查看全部更新 →",
    streetsService: "可能影响行程的情况", explainWhy: "把公交和道路更新放在一起看。",
    causalityNote: "线路附近的道路事件可能影响公交，但不能单凭位置接近就认定它造成了延误。",
    serviceNotices: "Muni 服务更新", roadEvents: "附近道路施工与事件", journeyDecision: "规划行程",
    whereGoing: "你想从哪里去哪里？", plannerLead: "选择两个 Muni 站点。我们会用最新数据比较直达和一次换乘的路线。",
    dynamicPlanner: "最新预测与本机计算 · 测试版", fromStop: "起点站", toStop: "终点站", browseAllStops: "浏览全部站点", findRoute: "比较路线", tryExample: "试试示例行程",
    findingOptions: "正在寻找适合你的路线…", loadingTrips: "可以乘坐的 Muni 路线", loadingPredictions: "当前到站预测", loadingTransfers: "换乘是否接得上", loadingReliability: "线路运行稳定性",
    whyRoute: "为什么推荐这条？", exploreTrip: "查看完整行程 →", recommendationEvidence: "推荐依据", compareTwo: "比较两个方案",
    quickComparison: "快速比较", recommendedVsFastest: "推荐路线与最快路线", compareOtherOptions: "任意比较两条路线 →",
    visibleEvidence: "可能影响这趟行程的情况", visibleEvidenceTitle: "当前行驶、道路施工与历史背景",
    movementStreetTitle: "当前行驶与道路更新", historicalAreasTitle: "行程各区域的历史背景",
    journeyMapHint: "实线是公交路段，虚线是步行连接。", journeyTimeline: "行程步骤",
    journeyReliability: "这趟行程稳不稳定？", journeySafety: "历史事件参考", journeyParking: "目的地附近停车情况",
    threeWays: "按你最在意的事情来选。", referenceCase: "参考行程", alternatives: "其他路线",
    tradeoffs: "比较时间、步行和换乘。", route: "线路", eta: "预计行程时间", walk: "步行", reliability: "当前运行情况",
    exposure: "历史事件参考", cityContext: "更多出行信息", moreThanBus: "看看其他可能影响出行的情况。",
    parkingDemand: "近期停车付费情况", safetyContext: "历史事件参考", safetyExpand: "了解这些记录能说明什么、不能说明什么", dataQuality: "这些数据有多新？",
    methodEyebrow: "每个结果是怎么得出的", evidenceTitle: "推荐路线前，我们会检查这些信息。",
    northStarBody: "SF Transit Pulse 只想回答一个实用问题：我现在该坐什么？为什么？", evidenceBody: "数据能说明多少，我们就只说多少。",
    observe: "收集最新信息", observeBody: "查看车辆位置、预计到站时间、服务通知、线路路径，以及每份数据的更新时间。",
    diagnose: "分方向检查每条线路", diagnoseBody: "查看车辆间隔是否稳定、是否挤在一起、会不会等很久，以及实时信息是否足够。",
    build: "找出可能坐得上的路线", buildBody: "比较直达和一次换乘。有完整实时预测时，会检查两趟具体班次是否接得上；数据不足时会明确写成估算。",
    compare: "按你的需要比较", compareBody: "最快到达只优先看时间；综合推荐兼顾稳定性、步行和换乘，只轻微考虑明显偏高的历史差异；历史背景优先会更重视过去记录的差异。",
    boundariesTitle: "请注意这些限制", boundarySafety: "历史事件记录不能判断你这次出行是否安全。", boundaryRoad: "附近有道路事件，不代表它一定造成了公交延误。", boundaryMissing: "没有实时信息，不代表这条线路已经停运。", boundaryCost: "路线比较分数不等于预计到达时间。", boundaryTransfer: "实时到站预测仍会变化，所以显示能换乘也不代表一定赶得上。",
    explain: "说明推荐理由", explainBody: "告诉你为什么这条路线排在前面、其他路线有什么不同，以及哪些数据仍然不足。",
    nearbyEyebrow: "从你现在的位置出发", nearbyTitle: "查找附近的 Muni 站点",
    nearbyLead: "先选择距离，再允许获取位置。我们会列出范围内的全部 Muni 站点，以及每个站可以乘坐的线路。",
    nearbyRadiusLabel: "查找范围", nearbyButton: "查找附近站点",
    nearbyPrivacy: "你的位置只会在这个页面中用于计算距离，不会上传或保存。",
    nearbyInitial: "准备好后，点击“查找附近站点”并选择是否允许本页使用你的位置。",
    highlightsEyebrow: "不只看一个到达时间", highlightsTitle: "看看单一 ETA 容易漏掉什么。",
    highlightDirection: "分方向看运行情况", highlightDirectionBody: "两个方向分开检查车辆间隔和可能的长时间等待。",
    highlightTransfer: "这次换乘赶得上吗？", highlightTransferBody: "有具体班次预测时，直接显示预计可用的换乘余量。",
    highlightWhy: "为什么推荐这条？", highlightWhyBody: "需要了解理由时再展开证据，平时不用面对所有技术细节。",
    decisionStoryEyebrow: "更实用的取舍", decisionStoryTitle: "最快，不一定是最省事。",
    storyFastest: "最快到达", storyFastMeta: "步行 8 分钟 · 换乘 1 次 · 需留意",
    storyBalanced: "综合推荐", storyBalancedMeta: "步行 3 分钟 · 直达 · 较稳定",
    decisionStoryMiddle: "少走路、不换乘，运行也更稳定。",
    comparisonEyebrow: "方案 A 与方案 B", comparisonTitle: "并排比较两条路线",
    comparisonHelp: "选择任意两个方案，不用来回切换就能看清差别。",
    freshnessFeature: "旧数据不会一直被叫作“实时”。",
    footerNote: "独立研究原型，并非 SFMTA 官方服务。", footerVersion: "v1.4 · 出行决策测试版",
    footerData: "数据：511 SF Bay · DataSF · SFMTA", footerMap: "地图 © OpenStreetMap 贡献者", reportIssue: "报告问题"
  }
};

const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
let language = ["en", "zh"].includes(requestedLanguage)
  ? requestedLanguage
  : (localStorage.getItem("sf-transit-language") || "en");
let snapshot = null;
let network = null;
let map = null;
let mapLayers = {};
let journeyMap = null;
let journeyLayer = null;
let stopSearchIndex = new Map();
let plannerStops = [];
const stopBrowseState = new WeakMap();
let userLocation = null;
let nearbyFeedback = null;
let overlayReturnFocus = null;
// Feature 25B · Scheme B worker bridge / 方案 B 浏览器线程连接
// 中文：旧版在这里保存 Render 地址；现在主页面只和本地 Web Worker 通信。
// 每次实时快照更新后，Worker 会收到新的无密钥数据并重新建立查询索引。
// English: The old boundary stored a Render URL. The page now talks only to a
// local Web Worker, which rebuilds its indexes whenever the public snapshot changes.
let plannerWorker = null;
let plannerWorkerSequence = 0;
let plannerEngineReady = null;
let plannerEngineInitialized = false;
let safetyContextLoaded = false;
let safetyContextRequest = null;
const plannerWorkerRequests = new Map();
const appState = {
  selectedRoute: "all",
  selectedDirection: "all",
  routeScope: "evidence",
  layers: {vehicles:true, route:true, stops:false, issues:true, roads:false},
  selectedMode: "BALANCED",
  selectedJourneyId: null,
  compareJourneyIds: [],
  comparisonOpen: false,
  evidenceOpen: false,
  routeDetailsOpen: false,
  showAllRoutes: false,
  plannerResult: null,
  plannerRequestKey: null
};

function plannerWorkerCall(type, payload = {}) {
  if (!window.Worker) return Promise.reject(new Error("This browser does not support background route planning."));
  if (!plannerWorker) {
    plannerWorker = new Worker("planner-worker.js?v=35", {type: "module"});
    plannerWorker.addEventListener("message", event => {
      const request = plannerWorkerRequests.get(event.data?.id);
      if (!request) return;
      plannerWorkerRequests.delete(event.data.id);
      if (event.data.ok) request.resolve(event.data.result);
      else request.reject(new Error(event.data.error || "Browser planning failed."));
    });
    plannerWorker.addEventListener("error", event => {
      const error = new Error(event.message || "The browser planner could not start.");
      for (const request of plannerWorkerRequests.values()) request.reject(error);
      plannerWorkerRequests.clear();
      plannerWorker?.terminate();
      plannerWorker = null;
      plannerEngineInitialized = false;
    });
  }
  const id = ++plannerWorkerSequence;
  return new Promise((resolve, reject) => {
    plannerWorkerRequests.set(id, {resolve, reject});
    plannerWorker.postMessage({id, type, payload});
  });
}

function syncPlannerEngine({networkChanged = false} = {}) {
  if (!network || !snapshot) return null;
  const initialize = networkChanged || !plannerEngineInitialized;
  plannerEngineReady = plannerWorkerCall(
    initialize ? "initialize" : "update-realtime",
    initialize ? {network, realtime: snapshot} : {realtime: snapshot}
  ).then(result => {
    plannerEngineInitialized = true;
    return result;
  });
  // A click on Compare routes reports initialization errors in plain language.
  // This handler prevents a background refresh from creating an unhandled rejection.
  plannerEngineReady.catch(() => {});
  return plannerEngineReady;
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
const hasNumber = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const fmt = (value, digits = 0) => hasNumber(value) ? Number(value).toFixed(digits) : "—";
const minutesCopy = (value, digits = 1) => language === "zh" ? `${fmt(value, digits)} 分钟` : `${fmt(value, digits)} min`;
const ordinal = value => {
  if (!hasNumber(value)) return "—";
  const number = Math.round(Number(value));
  const remainder = number % 100;
  const suffix = remainder >= 11 && remainder <= 13 ? "th" : ({1:"st", 2:"nd", 3:"rd"}[number % 10] || "th");
  return `${number}${suffix}`;
};

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

function isOlderThan(value, maxAgeMinutes) {
  const timestamp = value ? new Date(value).getTime() : NaN;
  return !Number.isFinite(timestamp) || Date.now() - timestamp > maxAgeMinutes * 60000;
}

function freshnessDisplay(value, maxAgeMinutes) {
  if (!value) return {
    text: language === "zh" ? "更新时间不明 · 暂不使用" : "Time unavailable · not used",
    className: "freshness-outdated"
  };
  const outdated = isOlderThan(value, maxAgeMinutes);
  return {
    text: `${timeAgo(value)} · ${outdated ? (language === "zh" ? "已过期" : "Outdated") : (language === "zh" ? "可使用" : "Current")}`,
    className: outdated ? "freshness-outdated" : "freshness-current"
  };
}

function sourceStatusUnavailable(source) {
  return ["unavailable", "failed", "error"].includes(String(source?.status || "").toLowerCase());
}

function sourceFreshnessDisplay(source, maxAgeMinutes, observedAt = source?.observed_at) {
  if (sourceStatusUnavailable(source)) return {
    text: language === "zh" ? "数据暂时不可用" : "Temporarily unavailable",
    className: "freshness-outdated"
  };
  const result = freshnessDisplay(observedAt, maxAgeMinutes);
  const status = String(source?.status || "").toLowerCase();
  if (status === "retained_client_cache") {
    result.text = language === "zh"
      ? `使用上一次已载入的数据 · ${result.text}`
      : `Using the last loaded copy · ${result.text}`;
  } else if (status.startsWith("retained")) {
    result.text = language === "zh"
      ? `沿用上一次成功更新 · ${result.text}`
      : `Using the latest successful update · ${result.text}`;
  }
  return result;
}

function syncDisruptionDisclosure() {
  const details = document.querySelector(".disruption-details");
  const action = details?.querySelector(".details-action");
  if (action) action.textContent = I18N[language][details.open ? "closeUpdates" : "openUpdates"];
}

function setLanguage(next, {syncUrl = false} = {}) {
  language = next;
  localStorage.setItem("sf-transit-language", language);
  if (syncUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", url);
  }
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
  if (originInput) originInput.placeholder = language === "zh" ? "输入站名，或浏览全部站点" : "Search by name, or browse all stops";
  if (destinationInput) destinationInput.placeholder = language === "zh" ? "输入站名，或浏览全部站点" : "Search by name, or browse all stops";
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
  if (networkMap) {
    const source = transitSource();
    const mapSourceLabel = source.isCached
      ? (language === "zh" ? "Muni 近期缓存车辆位置地图" : "Map of recently cached Muni vehicle locations")
      : source.isSample
        ? (language === "zh" ? "Muni 演示车辆位置地图" : "Map of demo Muni vehicle locations")
        : source.isCurrent
          ? (language === "zh" ? "Muni 实时车辆位置地图" : "Map of live Muni vehicle locations")
          : (language === "zh" ? "Muni 车辆位置地图" : "Map of Muni vehicle locations");
    networkMap.setAttribute("aria-label", mapSourceLabel);
  }
  const originList = document.getElementById("origin-suggestions");
  const destinationList = document.getElementById("destination-suggestions");
  if (originList) originList.setAttribute("aria-label", language === "zh" ? "起点站选项" : "Starting stop choices");
  if (destinationList) destinationList.setAttribute("aria-label", language === "zh" ? "终点站选项" : "Destination stop choices");
  const localizedLabels = {
    "route-detail-close": language === "zh" ? "关闭线路详情" : "Close route details",
    "why-route-close": language === "zh" ? "关闭推荐依据" : "Close recommendation evidence",
    "comparison-close": language === "zh" ? "关闭路线比较" : "Close route comparison",
    "mode-grid": language === "zh" ? "选择路线排序方式" : "Choose a route ranking preference"
  };
  Object.entries(localizedLabels).forEach(([id, label]) => document.getElementById(id)?.setAttribute("aria-label", label));
  syncDisruptionDisclosure();
  updateStopBrowseButtons();
  document.querySelectorAll("#nearby-radius option").forEach(option => {
    option.textContent = `${option.value} ${language === "zh" ? "米" : "m"}`;
  });
  if (nearbyFeedback) {
    setNearbyStatus(nearbyCopy(nearbyFeedback.key, nearbyFeedback.values), nearbyFeedback.isError);
  }
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
  const observedAt = declared.observed_at || null;
  const isSample = status === "retained_sample" || containsDemoIds;
  const isCached = !isSample && String(status).startsWith("retained");
  const freshEnough = !isOlderThan(observedAt, 10);
  return {
    status,
    observed_at: observedAt,
    isLive: status === "live",
    isCached,
    isCurrent: !isSample && (status === "live" || isCached) && freshEnough,
    isSample
  };
}

function vehicleCoverage() {
  const knownRouteIds = new Set((network?.routes || []).map(route => String(route.route_id)));
  const source = transitSource();
  const all = source.isCurrent || source.isSample ? (snapshot?.vehicles || []) : [];
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
  const source = transitSource();
  const rows = source.isCurrent || source.isSample ? (snapshot?.routes || []) : [];
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
  const transitStale = isOlderThan(transit.observed_at, 10);
  const sourceLabel = transit.isLive && !transitStale ? (language === "zh" ? "511 实时车辆与到站信息" : "Live vehicles and arrivals from 511") :
    transit.isCached && !transitStale ? (language === "zh" ? "近期缓存的车辆与到站预测" : "Recent cached vehicles and arrival predictions") :
    transit.isLive && transitStale ? (language === "zh" ? "公交数据过旧 · 行程时间将使用估算" : "Transit data is out of date · trip times use estimates") :
    transit.isCached && transitStale ? (language === "zh" ? "缓存的公交数据已过期 · 行程时间将使用估算" : "Cached transit data is out of date · trip times use estimates") :
    transit.isSample ? (language === "zh" ? "演示数据 · 不是当前车辆" : "Demo data · not current vehicles") :
    (language === "zh" ? "上一次成功获取的数据 · 目前尚未更新" : "Last successful update · not current");
  const transitAge = transit.observed_at ? ` · ${timeAgo(transit.observed_at)}` : "";
  const topSourceLabel = transitStale && (transit.isLive || transit.isCached)
    ? (language === "zh" ? "数据更新延迟 · 正在自动检查" : "Update delayed · checking automatically")
    : sourceLabel;
  document.getElementById("freshness-label").textContent = topSourceLabel + transitAge;
  document.getElementById("freshness-label").title = transitStale && (transit.isLive || transit.isCached)
    ? (language === "zh" ? "网页仍会每 5 分钟检查一次新数据；过旧数据不会用于实时判断。" : "The page still checks for new data every 5 minutes; outdated data is not used for live judgments.")
    : sourceLabel;
  document.querySelector(".live-dot")?.classList.toggle("delayed", Boolean(transitStale || !transit.isCurrent));
  document.getElementById("generated-at").textContent = generated ? `${language === "zh" ? "页面更新时间" : "Page updated"}: ${generated.toLocaleString()}` : (language === "zh" ? "页面更新时间不明" : "Page update time unavailable");
  document.getElementById("quality-status").textContent = sourceLabel;
  const failures = meta.errors || [];
  const unavailableSources = Object.entries(meta.source_status || {})
    .filter(([, source]) => sourceStatusUnavailable(source))
    .map(([name]) => name);
  const retainedSources = Object.values(meta.source_status || {})
    .filter(source => String(source?.status || "").toLowerCase().startsWith("retained"));
  const sourceCheckMessage = transitStale && (transit.isLive || transit.isCached)
    ? (language === "zh" ? "最新公交数据已超过 10 分钟，因此不会用于实时到站或当前车速判断。网页会每 5 分钟自动检查更新。" : "The latest transit data is more than 10 minutes old, so it is not used for live arrivals or current speed. The page checks for updates every 5 minutes.")
    : failures.length || unavailableSources.length ?
    (language === "zh" ? `${Math.max(failures.length, unavailableSources.length)} 项数据暂时无法更新。页面不会把“没拿到数据”说成“没有事件”。` : `${Math.max(failures.length, unavailableSources.length)} data source${Math.max(failures.length, unavailableSources.length) === 1 ? " is" : "s are"} temporarily unavailable. Missing data is not presented as “no events.”`) : retainedSources.length ?
    (language === "zh" ? "公交数据已更新；更新较慢的来源沿用上一次成功结果，并按各自时间判断是否还能使用。" : "Transit is updated. Slower sources use their latest successful update and remain subject to their own freshness limits.") :
    (language === "zh" ? "本次更新已成功检查所有已连接的数据。" : "All connected data sources were checked successfully.");
  const unassignedCount = vehicleCoverage().unassigned.length;
  const unassignedMessage = unassignedCount ? (language === "zh"
    ? `${unassignedCount} 个车辆位置暂时无法对应到乘客线路，因此不会显示在地图或用于线路分析。`
    : `${unassignedCount} vehicle location${unassignedCount === 1 ? "" : "s"} cannot be matched to a passenger route, so we leave them off the map and out of route analysis.`) : "";
  document.getElementById("quality-detail").textContent = [sourceCheckMessage, unassignedMessage].filter(Boolean).join(" ");
  const transitFreshness = transit.isSample
    ? {text: language === "zh" ? "演示数据 · 不是当前状态" : "Demo data · not current", className:"freshness-outdated"}
    : transit.isCached
      ? sourceFreshnessDisplay({status:"retained", observed_at:transit.observed_at}, 10)
      : freshnessDisplay(transit.observed_at, 10);
  const roadFreshness = sourceFreshnessDisplay(meta.source_status?.roads, 30);
  const rawRoadCount = meta.source_status?.roads?.raw_event_count;
  const parsedRoadCount = meta.source_status?.roads?.parsed_event_count;
  if (hasNumber(rawRoadCount) && hasNumber(parsedRoadCount)) {
    roadFreshness.text += language === "zh"
      ? ` · 收到 ${fmt(rawRoadCount)} 条，保留 ${fmt(parsedRoadCount)} 条可用事件`
      : ` · ${fmt(rawRoadCount)} received, ${fmt(parsedRoadCount)} usable`;
  }
  const freshnessRows = [
    [language === "zh" ? "车辆与到站时间" : "Vehicles and arrivals", transitFreshness],
    [language === "zh" ? "服务通知" : "Service notices", sourceFreshnessDisplay(meta.source_status?.alerts, 30)],
    [language === "zh" ? "道路事件" : "Street events", roadFreshness],
    [language === "zh" ? "最近可用的停车付费活动" : "Latest paid-parking activity", sourceFreshnessDisplay(meta.source_status?.parking, 180, snapshot.parking?.source_snapshot_time)],
    [language === "zh" ? "历史事件记录" : "Historical incident records", sourceFreshnessDisplay(meta.source_status?.safety, 48 * 60)],
    [language === "zh" ? "线路和站点" : "Routes and stops", {text: network?.meta?.feed_version ? `${language === "zh" ? "数据版本" : "Data version"} ${network.meta.feed_version}` : "—", className:"freshness-current"}]
  ];
  document.getElementById("source-freshness").innerHTML = freshnessRows.map(([label,value]) => `<div class="evidence-row ${value.className}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value.text)}</strong></div>`).join("");
}

function renderHero() {
  const coverage = coverageSummary();
  const transit = transitSource();
  const vehicles = vehicleCoverage();
  document.getElementById("vehicle-count").textContent = fmt(vehicles.mapped.length);
  document.getElementById("unassigned-count").textContent = fmt(vehicles.unassigned.length);
  document.getElementById("route-count").textContent = `${coverage.routesWithEvidence} / ${coverage.totalRoutes || "—"}`;
  document.getElementById("issue-count").textContent = fmt(coverage.issues);
  document.getElementById("vehicle-count-label").textContent = transit.isCurrent
    ? transit.isCached
      ? (language === "zh" ? "个近期缓存的车辆位置" : "recent cached vehicle locations")
      : (language === "zh" ? "个已匹配线路的实时车辆" : "live vehicles matched to a route")
    : transit.isSample ? (language === "zh" ? "个已匹配线路的演示车辆" : "demo vehicles matched to a route")
      : (language === "zh" ? "个可作当前判断的车辆" : "vehicles current enough to use");
  document.getElementById("unassigned-count-label").textContent = transit.isCurrent
    ? transit.isCached
      ? (language === "zh" ? "个缓存中未归属线路的位置" : "cached positions not assigned to a route")
      : (language === "zh" ? "个暂时无法归属线路的位置" : "live positions not assigned to a route")
    : transit.isSample ? (language === "zh" ? "个无法归属线路的演示位置" : "demo positions not assigned to a route")
      : (language === "zh" ? "个可作当前判断的未归属位置" : "unassigned positions current enough to use");
  document.getElementById("route-count-label").textContent = transit.isCurrent
    ? transit.isCached
      ? (language === "zh" ? "条线路有近期缓存信息" : "routes with recent cached updates")
      : (language === "zh" ? "条线路当前有实时回报" : "routes reporting right now")
    : transit.isSample ? (language === "zh" ? "条线路出现在演示数据中" : "routes shown in demo data")
      : (language === "zh" ? "条线路有足够新的数据" : "routes with data current enough to use");
  document.getElementById("issue-count-label").textContent = language === "zh" ? "个方向可能需要多等" : "directions with possible longer waits";
  const overviewTitle = document.querySelector('[data-i18n="routeOverview"]');
  if (overviewTitle) overviewTitle.textContent = transit.isCurrent
    ? transit.isCached
      ? (language === "zh" ? "近期缓存信息最完整的线路" : "Routes with the clearest recent cached picture")
      : (language === "zh" ? "实时信息最完整的线路" : "Routes with the clearest live picture")
    : transit.isSample ? (language === "zh" ? "演示数据中的线路" : "Routes in the demo data")
      : (language === "zh" ? "当前没有足够新的线路信息" : "No route information is current enough to show");
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
  const source = transitSource();
  document.getElementById("evidence-routes-button").textContent = source.isCurrent
    ? source.isCached
      ? (language === "zh" ? "近期缓存信息" : "Recent cached updates")
      : (language === "zh" ? "现在有实时信息" : "Live updates available")
    : source.isSample ? (language === "zh" ? "演示数据中的线路" : "Routes in demo data")
      : (language === "zh" ? "暂无可用的实时信息" : "No current updates available");
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
    const vehicleSource = transitSource();
    const sampleLabel = vehicleSource.isSample
      ? `<br><span class="event-scope">${language === "zh" ? "演示数据" : "Demo data"}</span>`
      : vehicleSource.isCached
        ? `<br><span class="event-scope">${language === "zh" ? "近期缓存" : "Recent cache"}</span>`
        : "";
    L.circleMarker(point, {radius: 6, color: "#ffffff", weight: 2, fillColor: "#0066cc", fillOpacity: .98})
      .bindPopup(`<div class="vehicle-popup"><strong>${language === "zh" ? "线路" : "Route"} ${escapeHtml(vehicle.route_id || "—")}</strong>${sampleLabel}<br>→ ${escapeHtml(destination)}<br>${language === "zh" ? "车辆编号" : "Vehicle"}: ${escapeHtml(vehicle.vehicle_id || "—")}<br>${language === "zh" ? "回报速度" : "Reported speed"}: ${escapeHtml(speed)}<br>${language === "zh" ? "位置更新时间" : "Location updated"}: ${hasNumber(vehicle.age_seconds) ? (language === "zh" ? `${fmt(vehicle.age_seconds)} 秒前` : `${fmt(vehicle.age_seconds)} sec ago`) : "—"}<br>${language === "zh" ? "当前运行情况" : "Current service"}: ${escapeHtml(healthCopy(routeHealth))}</div>`)
      .addTo(mapLayers.vehicles);
  });

  const transit = transitSource();
  const issueRows = transit.isCurrent || transit.isSample
    ? (snapshot.routes || []).filter(row => selectionMatches(row, routeId, directionId)) : [];
  issueRows.flatMap(row => (row.spacing_events || []).map(event => ({...event, route_id:row.route_id, direction_id:row.direction_id}))).forEach(event => {
    if (!hasNumber(event.lat) || !hasNumber(event.lon)) return;
    const point = [Number(event.lat), Number(event.lon)];
    const label = event.type === "BUNCHING" ? (language === "zh" ? "几辆车挤在一起" : "Vehicles close together") : (language === "zh" ? "两班车间隔过长" : "Long wait between vehicles");
    L.circleMarker(point, {radius: 8, color: "#ffffff", weight: 2, fillColor: "#ff9500", fillOpacity: 1})
      .bindPopup(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(event.location_name || event.reference_stop_id || (language === "zh" ? "附近站点" : "Nearby stop"))}<br>${language === "zh" ? `预计相隔 ${fmt(event.gap_min,1)} 分钟` : `Estimated ${fmt(event.gap_min,1)} minutes apart`}`)
      .addTo(mapLayers.issues);
  });

  const roadsObserved = snapshot?.meta?.source_status?.roads?.observed_at;
  const roadsAvailable = !sourceStatusUnavailable(snapshot?.meta?.source_status?.roads);
  const currentRoads = !roadsAvailable || isOlderThan(roadsObserved, 30) ? [] : (snapshot.road_events || []);
  currentRoads.filter(event => routeId === "all" || !(event.route_ids || []).length || (event.route_ids || []).map(String).includes(String(routeId))).forEach(event => {
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
  const source = transitSource();
  const allVehiclesLabel = source.isCached
    ? (language === "zh" ? "近期缓存中已匹配到线路的车辆" : "Route-matched vehicles from the recent cache")
    : source.isSample
      ? (language === "zh" ? "演示数据中已匹配到线路的车辆" : "Route-matched vehicles in demo data")
      : source.isCurrent
        ? (language === "zh" ? "全部已匹配到线路的实时车辆" : "All live vehicles matched to a route")
        : (language === "zh" ? "当前没有足够新的车辆位置" : "No vehicle locations are current enough to show");
  document.getElementById("map-label").textContent = routeId === "all" ?
    allVehiclesLabel :
    `${language === "zh" ? "线路" : "Route"} ${routeId}${directionLabel}`;
}

function median(values) {
  const ordered = values.map(Number).filter(Number.isFinite).sort((a,b) => a-b);
  if (!ordered.length) return null;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function combinedRoute(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const source = transitSource();
  const rows = source.isCurrent || source.isSample
    ? (snapshot.routes || []).filter(row => selectionMatches(row, routeId, directionId)) : [];
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
    return {code:"NO_CURRENT_GUIDANCE", label:language === "zh" ? "当前信息不足，请同时查看官方时刻和通知" : "Current data is limited; also check the official schedule and notices"};
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
    const source = transitSource();
    const sampleNote = source.isCached
      ? (language === "zh" ? "（使用 10 分钟内的近期缓存）" : " (using a recent cache under 10 minutes old)")
      : source.isCurrent ? "" : source.isSample
      ? (language === "zh" ? "（目前显示演示数据）" : " (demo data shown)")
      : (language === "zh" ? "（旧数据已隐藏）" : " (outdated data hidden)");
    document.getElementById("focus-route-status").textContent = language === "zh" ? `每个方向分开查看，不会因为一条线路有问题就说整个 Muni 都不稳定${sampleNote}` : `We check each direction separately, so one troubled route does not label all of Muni as unstable${sampleNote}`;
    metrics.innerHTML = [
      metricRow(language === "zh" ? "地图上的车辆" : "Vehicles on the map", fmt(vehicles.mapped.length), transitSource().isSample ? (language === "zh" ? "演示数据" : "demo data") : ""),
      metricRow(language === "zh" ? "未归属线路的位置" : "Positions without a route", fmt(vehicles.unassigned.length), language === "zh" ? "已从地图和线路分析中排除" : "left off the map and out of route analysis"),
      metricRow(source.isCached
        ? (language === "zh" ? "近期缓存中有信息的线路" : "Routes in the recent cache")
        : (language === "zh" ? "当前有实时回报的线路" : "Routes reporting right now"), `${coverage.routesWithEvidence} / ${coverage.totalRoutes}`),
      metricRow(language === "zh" ? "已检查的方向" : "Directions checked", `${coverage.directionsWithEvidence} / ${coverage.totalDirections}`),
      metricRow(language === "zh" ? "车辆间隔较稳定" : "Steady vehicle spacing", fmt(coverage.healthCounts.STABLE)),
      metricRow(language === "zh" ? "部分等待可能较久" : "Some waits may be longer", fmt(coverage.healthCounts.WATCH)),
      metricRow(language === "zh" ? "等车时间变化较大" : "Waits may vary a lot", fmt(coverage.healthCounts.UNSTABLE)),
      metricRow(language === "zh" ? "当前信息不足" : "Not enough current data", fmt(coverage.noData))
    ].join("");
    document.getElementById("focus-issues").innerHTML = "";
    document.getElementById("focus-explanation").textContent = language === "zh" ?
      "这里只显示能对应到乘客线路的车辆。暂时无法归属线路的位置不会被猜测，也不会参与线路判断。没有当前信息的线路可能仍在正常运营。" :
      "We only show vehicles matched to a passenger route. We do not guess where unassigned positions belong or use them in route results. A route without current updates may still be operating.";
    return;
  }

  const data = combinedRoute(routeId, directionId);
  const advice = routeAdvice(data.health, data.evidence_count);
  const source = transitSource();
  const positionLabel = source.isSample ? (language === "zh" ? "演示车辆位置" : "Demo vehicle locations")
    : source.isCurrent ? source.isCached
      ? (language === "zh" ? "地图上的近期缓存车辆" : "Recent cached vehicles on the map")
      : (language === "zh" ? "地图上的实时车辆" : "Live vehicles on the map")
      : (language === "zh" ? "可用的当前车辆位置" : "Current vehicle locations available");
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
  const source = transitSource();
  const severity = {UNSTABLE:3, WATCH:2, LIMITED_REALTIME_DATA:1, NO_DATA:0, STABLE:0};
  const rows = source.isCurrent || source.isSample
    ? (snapshot.routes || []).slice().sort((a,b) =>
      (severity[b.health] || 0) - (severity[a.health] || 0)
      || Number(b.predictions_observed || 0) - Number(a.predictions_observed || 0)
    )
    : [];
  const grid = document.getElementById("route-grid");
  grid.classList.toggle("expanded", appState.showAllRoutes);
  const gridToggle = document.getElementById("route-grid-toggle");
  gridToggle.hidden = rows.length <= 4;
  gridToggle.setAttribute("aria-expanded", String(appState.showAllRoutes));
  gridToggle.textContent = appState.showAllRoutes
    ? I18N[language].showFewerRoutes
    : I18N[language].viewAllRoutes;
  const note = source.isCached
    ? `<p class="coverage-note">${language === "zh" ? "511 本次更新失败；以下内容来自 10 分钟内最近一次成功获取的数据。" : "The latest 511 refresh failed. These cards use the last successful update from under 10 minutes ago."}</p>`
    : source.isCurrent ? "" : `<p class="coverage-note">${source.isSample
    ? (language === "zh" ? "下面显示的是演示数据，不代表现在的车辆或服务。" : "The cards below show demo data, not current vehicles or service.")
    : (language === "zh" ? "公交数据已超过 10 分钟，旧的线路判断已隐藏。" : "Transit data is more than 10 minutes old, so outdated route judgments are hidden.")}</p>`;
  grid.innerHTML = note + (rows.length ? rows.map(row => {
    const positions = vehicleCoverage().mapped.filter(vehicle => selectionMatches(vehicle, row.route_id, row.direction_id)).length;
    return `
    <article class="route-card" tabindex="0" role="button" data-route="${escapeHtml(row.route_id)}" data-direction="${escapeHtml(row.direction_id)}" aria-pressed="${String(row.route_id) === String(appState.selectedRoute) && String(row.direction_id) === String(appState.selectedDirection)}" aria-label="${language === "zh" ? `查看线路 ${escapeHtml(row.route_id)} 的方向 ${escapeHtml(row.direction_id)}` : `View route ${escapeHtml(row.route_id)} direction ${escapeHtml(row.direction_id)}`}">
      <span class="route-number">${escapeHtml(row.route_id)}</span>
      <span class="direction">${escapeHtml(directionLabelCopy(row.direction_label, row.direction_id ?? "—"))}</span>
      <p class="health">${escapeHtml(healthCopy(row.health))}</p>
      <p class="detail">${positions} ${language === "zh" ? "个车辆位置" : "vehicle locations"} · ${fmt(row.predictions_observed)} ${language === "zh" ? "条到站信息" : "arrival estimates"}<br>${hasNumber(row.median_headway_min) ? (language === "zh" ? `车辆通常相隔 ${fmt(row.median_headway_min,1)} 分钟` : `Usually ${fmt(row.median_headway_min,1)} min between vehicles`) : (language === "zh" ? "当前信息不足，暂时不能估算车辆间隔" : "Not enough current data to estimate vehicle spacing")}</p>
      <span class="card-action">${language === "zh" ? "查看线路 →" : "View route →"}</span>
    </article>`;
  }).join("") : `<p>${language === "zh" ? "目前没有足够新的线路信息。请稍后再查看。" : "No route information is current enough to show. Check again in a few minutes."}</p>`);
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

function normalizedEventRouteIds(item) {
  const explicit = (item.route_ids || []).map(String).filter(Boolean);
  if (explicit.length) return explicit;
  const legacy = String(item.title || "").match(/^Route\s+([^ ·:]+)/i);
  return legacy ? [legacy[1]] : [];
}

function eventMatchesSelection(item, routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  if (routeId === "all") return true;
  const ids = normalizedEventRouteIds(item);
  if (!ids.length) return true;
  if (!ids.includes(String(routeId))) return false;
  return directionId === "all" || item.direction_id === undefined || item.direction_id === null || String(item.direction_id) === String(directionId);
}

function currentEventsForSelection(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const alertsAvailable = !sourceStatusUnavailable(snapshot?.meta?.source_status?.alerts);
  const roadsAvailable = !sourceStatusUnavailable(snapshot?.meta?.source_status?.roads);
  const alertsFresh = alertsAvailable && !isOlderThan(snapshot?.meta?.source_status?.alerts?.observed_at, 30);
  const roadsFresh = roadsAvailable && !isOlderThan(snapshot?.meta?.source_status?.roads?.observed_at, 30);
  return {
    alertsAvailable,
    roadsAvailable,
    alertsFresh,
    roadsFresh,
    alerts: alertsFresh ? (snapshot.alerts || []).filter(item => eventMatchesSelection(item, routeId, directionId)) : [],
    roads: roadsFresh ? (snapshot.road_events || []).filter(item => eventMatchesSelection(item, routeId, directionId)) : []
  };
}

function renderNetworkUpdateSummary(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const container = document.getElementById("network-update-items");
  if (!container) return;
  const events = currentEventsForSelection(routeId, directionId);
  const scope = routeId === "all"
    ? (language === "zh" ? "全部线路" : "All routes")
    : `${language === "zh" ? "线路" : "Route"} ${routeId}${directionId === "all" ? "" : ` · ${language === "zh" ? "方向" : "direction"} ${directionId}`}`;
  const rows = [];
  if (events.alerts.length) {
    const alert = events.alerts[0];
    rows.push(`<article class="network-update-item"><span>${language === "zh" ? "公交服务" : "Muni service"}</span><strong>${escapeHtml(eventTextCopy(alert.title || alert.description || "Service update"))}</strong><p>${escapeHtml(scope)}</p></article>`);
  }
  if (events.roads.length) {
    const road = events.roads[0];
    rows.push(`<article class="network-update-item"><span>${language === "zh" ? "道路情况" : "Street context"}</span><strong>${escapeHtml(roadEventTitleCopy(road))}</strong><p>${escapeHtml(scope)} · ${language === "zh" ? "位置接近不代表它造成了公交延误" : "Nearby does not prove it caused a transit delay"}</p></article>`);
  }
  if (!rows.length) {
    const unavailable = !events.alertsAvailable || !events.roadsAvailable;
    const stale = !events.alertsFresh || !events.roadsFresh;
    const message = unavailable
      ? (language === "zh" ? "部分更新来源暂时不可用。这不表示目前没有服务变化或道路事件。" : "Some update sources are temporarily unavailable. This does not mean service and streets are unchanged.")
      : stale
        ? (language === "zh" ? "更新已超过可用时限，旧消息已隐藏。网页会继续检查新数据。" : "Updates are beyond their usable time limit, so old messages are hidden. The page will keep checking.")
        : (language === "zh" ? `${scope}目前没有匹配到新的公交或道路更新。` : `No new Muni or street update matched ${scope.toLowerCase()}.`);
    rows.push(`<p class="network-update-empty">${escapeHtml(message)}</p>`);
  }
  container.innerHTML = rows.join("");
}

function renderEvents(routeId = appState.selectedRoute, directionId = appState.selectedDirection) {
  const list = (id, events, emptyText) => {
    document.getElementById(id).innerHTML = events.length ? events.slice(0,5).map(item => {
      const ids = normalizedEventRouteIds(item);
      const scope = ids.length ? `${language === "zh" ? "可能影响线路" : "May affect route"} ${ids.join(", ")}` : (item.route_match_status === "UNAVAILABLE" ? (language === "zh" ? "暂时无法确定具体线路" : "Specific routes not identified yet") : (language === "zh" ? "可能影响多条线路" : "May affect several routes"));
      const title = id === "road-list" ? roadEventTitleCopy(item) : eventTextCopy(item.title || item.route_id || (language === "zh" ? "出行提示" : "Travel update"));
      const sourceDetail = item.description || item.status || "";
      const detail = eventTextCopy(sourceDetail);
      const showDetail = detail && String(sourceDetail).trim() !== String(item.title || "").trim();
      return `<article class="event-item"><span class="event-scope">${escapeHtml(scope)}</span><strong>${escapeHtml(title)}</strong>${showDetail ? `<p>${escapeHtml(detail)}</p>` : ""}</article>`;
    }).join("") : `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  };
  const {alertsAvailable, roadsAvailable, alertsFresh, roadsFresh, alerts, roads} = currentEventsForSelection(routeId, directionId);
  list(
    "alert-list",
    alerts,
    !alertsAvailable
      ? (language === "zh" ? "服务通知数据暂时不可用。请稍后刷新；这不表示目前没有服务变化。" : "Service-notice data is temporarily unavailable. Try refreshing later; this does not mean service is unchanged.")
      : !alertsFresh
      ? (language === "zh" ? "服务通知数据已超过 30 分钟，旧通知已隐藏。" : "Service-notice data is more than 30 minutes old, so old notices are hidden.")
      : language === "zh" ? `${routeId === "all" ? "目前没有新的 Muni 服务通知。" : `目前没有找到与 ${routeId} 相关的 Muni 服务通知。`}` : `${routeId === "all" ? "There are no new Muni service notices." : `No Muni service notices were found for ${routeId}.`}`
  );
  list(
    "road-list",
    roads,
    !roadsAvailable
      ? (language === "zh" ? "道路事件数据暂时不可用。请稍后刷新；这不表示道路上没有施工或事件。" : "Street-event data is temporarily unavailable. Try refreshing later; this does not mean there are no street disruptions.")
      : !roadsFresh
      ? (language === "zh" ? "道路事件数据已超过 30 分钟，旧事件已隐藏。" : "Street-event data is more than 30 minutes old, so old events are hidden.")
      : language === "zh" ? `${routeId === "all" ? "目前没有可显示的道路施工或事件。" : `目前没有找到与 ${routeId} 相关的道路施工或事件。`}` : `${routeId === "all" ? "No street work or events are available right now." : `No street work or events were found for ${routeId}.`}`
  );
}

function allPlannerStops() {
  const unique = new Map();
  const patterns = network?.patterns || network?.route_directions || {};
  Object.values(patterns).forEach(direction => {
    (direction.stops || []).forEach(stop => {
      if (!stop.stop_id) return;
      const stopId = String(stop.stop_id);
      const current = unique.get(stopId) || {...stop, stop_id: stopId, route_ids: []};
      if (direction.route_id && !current.route_ids.includes(String(direction.route_id))) {
        current.route_ids.push(String(direction.route_id));
      }
      unique.set(stopId, current);
    });
  });
  unique.forEach(stop => stop.route_ids.sort((a, b) => a.localeCompare(b, undefined, {numeric:true})));
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
  closeAllStopLists();
  updateStopBrowseButtons();
}

// Feature 26 · Nearby stops / 附近站点
// 中文：只有用户点击按钮后才向浏览器请求一次当前位置。坐标不会离开本页；
// 页面直接在公开 GTFS 站点目录中计算球面距离，并按由近到远列出指定范围内的站点。
// English: Location is requested only after a button click. Coordinates stay on
// this page while the public GTFS stop catalog is filtered and sorted by distance.
function nearbyCopy(key, values = {}) {
  const copy = {
    loading: {
      en: "Getting your location… Your browser may ask for permission.",
      zh: "正在获取你的位置……浏览器可能会询问是否允许。"
    },
    catalogLoading: {
      en: "Your location is ready. The Muni stop list is still loading; results will appear here shortly.",
      zh: "已经取得你的位置。Muni 站点资料仍在加载，完成后会在这里显示结果。"
    },
    found: {
      en: `Found ${values.count} Muni ${values.count === 1 ? "stop" : "stops"} within ${values.radius} m, nearest first.`,
      zh: `在附近 ${values.radius} 米内找到 ${values.count} 个 Muni 站点，已按距离从近到远排列。`
    },
    none: {
      en: `No Muni stops were found within ${values.radius} m. Try a larger distance.`,
      zh: `附近 ${values.radius} 米内没有找到 Muni 站点。可以试试更大的范围。`
    },
    unavailable: {
      en: "This browser can't provide your location. You can still enter a stop name below.",
      zh: "这个浏览器无法提供你的位置。你仍然可以在下方输入站名。"
    },
    insecure: {
      en: "Location works only on a secure website. Open the HTTPS version of this page, then try again.",
      zh: "定位功能只能在安全网站中使用。请打开这个页面的 HTTPS 版本后重试。"
    },
    denied: {
      en: "Location access wasn't allowed. Allow location for this site in your browser settings, then try again—or enter a stop name below.",
      zh: "没有获得位置权限。请在浏览器设置中允许这个网站使用位置后重试，或直接在下方输入站名。"
    },
    positionUnavailable: {
      en: "Your device couldn't determine its location. Check location services and your connection, then try again.",
      zh: "设备暂时无法确定你的位置。请检查定位服务和网络连接后重试。"
    },
    timeout: {
      en: "Getting your location took too long. Move near a window or check location services, then try again.",
      zh: "获取位置等待时间过长。可以移到靠近窗户的位置，或检查定位服务后重试。"
    },
    genericError: {
      en: "We couldn't get your location. Check your browser's location setting, then try again.",
      zh: "暂时无法获取你的位置。请检查浏览器的定位设置后重试。"
    }
  };
  return copy[key]?.[language] || "";
}

function setNearbyStatus(message, isError = false) {
  const status = document.getElementById("nearby-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function setNearbyFeedback(key, values = {}, isError = false) {
  nearbyFeedback = {key, values, isError};
  setNearbyStatus(nearbyCopy(key, values), isError);
}

function useNearbyStop(stopId, role) {
  const stop = plannerStops.find(row => String(row.stop_id) === String(stopId));
  const input = document.getElementById(role === "destination" ? "destination-input" : "origin-input");
  if (!stop || !input) return;
  input.value = stopLabel(stop);
  stopSearchIndex.set(input.value, stop.stop_id);
  appState.plannerRequestKey = null;
  input.focus({preventScroll: true});
  document.getElementById("trip-planner-form")?.scrollIntoView({behavior: "smooth", block: "center"});
}

function renderNearbyStops() {
  const results = document.getElementById("nearby-results");
  const radius = Number(document.getElementById("nearby-radius")?.value || 200);
  if (!results || !userLocation) return;
  if (!plannerStops.length) {
    results.innerHTML = "";
    setNearbyFeedback("catalogLoading");
    return;
  }

  const matches = window.SFNearbyStops?.findNearbyStops(plannerStops, userLocation, radius) || [];
  setNearbyFeedback(matches.length ? "found" : "none", {count: matches.length, radius});
  results.innerHTML = matches.map(stop => {
    const routes = (stop.route_ids || []).join(" · ");
    const routesText = routes
      ? (language === "zh" ? `可乘线路：${routes}` : `Routes: ${routes}`)
      : (language === "zh" ? "暂时没有线路资料" : "Route information unavailable");
    return `<article class="nearby-stop-item">
      <div>
        <h4>${escapeHtml(stop.name || (language === "zh" ? "Muni 站点" : "Muni stop"))}</h4>
        <p>${escapeHtml(routesText)}</p>
      </div>
      <strong class="nearby-distance">${Math.round(stop.distance_m)} ${language === "zh" ? "米" : "m"}</strong>
      <div class="nearby-stop-actions">
        <button type="button" data-nearby-stop="${escapeHtml(stop.stop_id)}" data-nearby-role="origin">${language === "zh" ? "设为起点" : "Use as start"}</button>
        <button type="button" data-nearby-stop="${escapeHtml(stop.stop_id)}" data-nearby-role="destination">${language === "zh" ? "设为终点" : "Use as destination"}</button>
      </div>
    </article>`;
  }).join("");
  results.querySelectorAll("button[data-nearby-stop]").forEach(button => button.addEventListener("click", () => {
    useNearbyStop(button.dataset.nearbyStop, button.dataset.nearbyRole);
  }));
}

function requestUserLocation() {
  const button = document.getElementById("nearby-location-button");
  const results = document.getElementById("nearby-results");
  if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    setNearbyFeedback("insecure", {}, true);
    return;
  }
  if (!navigator.geolocation) {
    setNearbyFeedback("unavailable", {}, true);
    return;
  }

  button.disabled = true;
  if (results) results.innerHTML = "";
  setNearbyFeedback("loading");
  navigator.geolocation.getCurrentPosition(position => {
    userLocation = {lat: position.coords.latitude, lon: position.coords.longitude};
    button.disabled = false;
    renderNearbyStops();
  }, error => {
    button.disabled = false;
    const errorKey = error.code === 1 ? "denied"
      : error.code === 2 ? "positionUnavailable"
        : error.code === 3 ? "timeout" : "genericError";
    setNearbyFeedback(errorKey, {}, true);
  }, {enableHighAccuracy: true, timeout: 10000, maximumAge: 60000});
}

function localStopMatches(query, limit = 12) {
  return window.SFStopCatalog?.searchStops(plannerStops, query, limit) || [];
}

// Feature 27 · Full stop picker / 完整站点选择器
// 中文：用户可以输入站名搜索，也可以直接打开完整站点目录。目录每次加载
// 100 个站点，滚动到底会继续加载，直到全部站点都可以选择。
// English: Riders can search by name or browse the complete stop catalog. The
// list adds 100 rows near the scroll boundary until every stop is reachable.
function browseButtonForInput(input) {
  return document.getElementById(input.id === "origin-input" ? "origin-browse-button" : "destination-browse-button");
}

function updateStopBrowseButtons() {
  const total = plannerStops.length;
  const formattedTotal = total.toLocaleString(language === "zh" ? "zh-CN" : "en-US");
  [
    ["origin-browse-button", language === "zh" ? "作为起点" : "starting"],
    ["destination-browse-button", language === "zh" ? "作为终点" : "destination"]
  ].forEach(([id, role]) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.textContent = total ? `${I18N[language].browseAllStops} (${formattedTotal})` : I18N[language].browseAllStops;
    button.setAttribute("aria-label", total
      ? (language === "zh" ? `浏览全部 ${formattedTotal} 个站点${role}` : `Browse all ${formattedTotal} ${role} stops`)
      : I18N[language].browseAllStops);
  });
}

function stopOptionMarkup(stop, position, total) {
  const routes = (stop.route_ids || []).join(" · ");
  const detail = routes
    ? (language === "zh" ? `线路：${routes}` : `Routes: ${routes}`)
    : (language === "zh" ? `站点编号：${stop.stop_id}` : `Stop ID: ${stop.stop_id}`);
  return `<button type="button" role="option" aria-posinset="${position}" aria-setsize="${total}" data-stop-id="${escapeHtml(stop.stop_id)}" data-stop-label="${escapeHtml(stopLabel(stop))}">
    <strong>${escapeHtml(stop.name || (language === "zh" ? "Muni 站点" : "Muni stop"))}</strong>
    <span>${escapeHtml(detail)}</span>
  </button>`;
}

function chooseStopOption(option, input, list) {
  input.value = option.dataset.stopLabel;
  stopSearchIndex.set(input.value, option.dataset.stopId);
  appState.plannerRequestKey = null;
  input.focus({preventScroll: true});
  closeStopList(input, list);
}

function bindStopOptionButtons(input, list) {
  list.querySelectorAll("button[data-stop-id]:not([data-stop-bound])").forEach(option => {
    option.dataset.stopBound = "true";
    option.addEventListener("click", event => {
      event.preventDefault();
      chooseStopOption(option, input, list);
    });
  });
}

function closeStopList(input, list) {
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  const browseButton = browseButtonForInput(input);
  if (browseButton) browseButton.setAttribute("aria-expanded", "false");
  stopBrowseState.delete(list);
}

function closeAllStopLists(exceptList = null) {
  [
    [document.getElementById("origin-input"), document.getElementById("origin-suggestions")],
    [document.getElementById("destination-input"), document.getElementById("destination-suggestions")]
  ].forEach(([input, list]) => {
    if (input && list && list !== exceptList) closeStopList(input, list);
  });
}

function browseProgressCopy(shown, total, done) {
  const shownText = shown.toLocaleString(language === "zh" ? "zh-CN" : "en-US");
  const totalText = total.toLocaleString(language === "zh" ? "zh-CN" : "en-US");
  if (done) return language === "zh" ? `已显示全部 ${totalText} 个站点` : `All ${totalText} stops shown`;
  return language === "zh"
    ? `正在显示 ${totalText} 个站点中的 ${shownText} 个，向下滚动查看更多`
    : `Showing ${shownText} of ${totalText} stops. Scroll for more`;
}

function appendStopBrowseBatch(input, list) {
  const state = stopBrowseState.get(list);
  if (!state || state.done) return;
  const batch = window.SFStopCatalog?.nextBrowseBatch(state.rows, state.nextOffset);
  if (!batch) return;
  const options = list.querySelector(".stop-options");
  const startingPosition = state.nextOffset;
  options.insertAdjacentHTML("beforeend", batch.rows.map((stop, index) => (
    stopOptionMarkup(stop, startingPosition + index + 1, batch.total)
  )).join(""));
  state.nextOffset = batch.nextOffset;
  state.done = batch.done;
  list.querySelector(".stop-list-summary").textContent = browseProgressCopy(state.nextOffset, batch.total, batch.done);
  bindStopOptionButtons(input, list);
}

function openAllStops(input, list) {
  const browseButton = browseButtonForInput(input);
  if (!list.hidden && stopBrowseState.has(list)) {
    closeStopList(input, list);
    return;
  }
  closeAllStopLists(list);
  if (!plannerStops.length) {
    list.innerHTML = `<p class="stop-list-empty">${language === "zh" ? "站点目录仍在加载，请稍后再试。" : "The stop list is still loading. Try again in a moment."}</p>`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (browseButton) browseButton.setAttribute("aria-expanded", "true");
    return;
  }
  list.innerHTML = `<div class="stop-list-summary" role="status"></div><div class="stop-options"></div>`;
  stopBrowseState.set(list, {rows: plannerStops, nextOffset: 0, done: false});
  list.hidden = false;
  list.scrollTop = 0;
  input.setAttribute("aria-expanded", "true");
  if (browseButton) browseButton.setAttribute("aria-expanded", "true");
  appendStopBrowseBatch(input, list);
}

function renderStopSuggestions(input, list, rows) {
  closeAllStopLists(list);
  stopBrowseState.delete(list);
  const unique = new Map();
  rows.forEach(stop => {
    const normalized = {...stop, stop_id: String(stop.stop_id)};
    if (!normalized.stop_id || unique.has(normalized.stop_id)) return;
    unique.set(normalized.stop_id, normalized);
    stopSearchIndex.set(stopLabel(normalized), normalized.stop_id);
    stopSearchIndex.set(normalized.stop_id, normalized.stop_id);
  });
  const suggestions = [...unique.values()].slice(0, 12);
  list.innerHTML = suggestions.map((stop, index) => stopOptionMarkup(stop, index + 1, suggestions.length)).join("");
  list.hidden = suggestions.length === 0;
  input.setAttribute("aria-expanded", String(suggestions.length > 0));
  const browseButton = browseButtonForInput(input);
  if (browseButton) browseButton.setAttribute("aria-expanded", "false");
  bindStopOptionButtons(input, list);
}

function scheduleStopSearch(input, list) {
  const query = input.value.trim();
  if (query.length < 2) {
    closeStopList(input, list);
    return;
  }
  renderStopSuggestions(input, list, localStopMatches(query));
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

function recommendedJourneyForMode() {
  const result = appState.plannerResult;
  const winnerId = (result?.modes || []).find(row => row.mode === appState.selectedMode)?.winner_journey_id;
  return (result?.alternatives || []).find(row => row.journey_id === winnerId) || selectedJourney();
}

function modeName(mode) {
  const key = String(mode || "BALANCED");
  const en = {FASTEST:"Fastest", BALANCED:"Balanced", SAFETY_FIRST:"Historical context"};
  const zh = {FASTEST:"最快到达", BALANCED:"综合推荐", SAFETY_FIRST:"历史背景优先"};
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
    BALANCED:"Balances time, steady service, walking, transfers, and only large historical differences.",
    SAFETY_FIRST:"Gives more weight to historical report differences above the Muni-stop midpoint. It does not predict personal safety."
  };
  const zh = {
    FASTEST:"按当前估算，优先选择最快到达的路线。",
    BALANCED:"同时考虑时间、等车稳定性、步行和换乘，只轻微考虑明显偏高的历史差异。",
    SAFETY_FIRST:"更重视高于全部 Muni 站点中间水平的历史报告差异，但不能预测你这次是否安全。"
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
  if (status === "RECENT_CACHED_PREDICTION") {
    return language === "zh" ? "近期缓存的到站预测" : "Recent cached arrival prediction";
  }
  if (status === "MIXED_REALTIME") {
    return language === "zh" ? "部分实时，部分估算" : "Part live, part estimated";
  }
  if (status === "MIXED_CACHED") {
    return language === "zh" ? "部分使用近期缓存，部分估算" : "Part recent cache, part estimated";
  }
  return language === "zh" ? "根据当前班次间隔估算" : "Estimated from current service spacing";
}

function timingBadgeMarkup(status) {
  if (status === "REALTIME_TRIP_PREDICTION") {
    return `<span class="timing-badge live">${language === "zh" ? "实时预测" : "Live prediction"}</span>`;
  }
  if (status === "RECENT_CACHED_PREDICTION") {
    return `<span class="timing-badge limited">${language === "zh" ? "近期缓存预测" : "Recent cached prediction"}</span>`;
  }
  if (status === "MIXED_REALTIME") {
    return `<span class="timing-badge limited">${language === "zh" ? "实时数据有限" : "Limited live data"}</span>`;
  }
  if (status === "MIXED_CACHED") {
    return `<span class="timing-badge limited">${language === "zh" ? "缓存与估算" : "Cached + estimated"}</span>`;
  }
  return `<span class="timing-badge estimated">${language === "zh" ? "估算时间" : "Estimated"}</span>`;
}

function transferComfort(transfer) {
  if (!transfer) return language === "zh" ? "无需换乘" : "No transfer";
  const labels = {
    CATCHABLE: language === "zh" ? "换乘时间宽松" : "Comfortable transfer",
    TIGHT: language === "zh" ? "换乘时间较紧" : "Tight transfer",
    MISS: language === "zh" ? "可能赶不上" : "Risky connection"
  };
  const slack = hasNumber(transfer.catch_slack_min)
    ? (language === "zh" ? ` · 预计余量 ${fmt(transfer.catch_slack_min,1)} 分钟` : ` · ${fmt(transfer.catch_slack_min,1)} min expected slack`)
    : "";
  return `${labels[transfer.catchability] || (language === "zh" ? "换乘时间为估算" : "Transfer timing is estimated")}${slack}`;
}

function renderModeCards(modes) {
  const grid = document.getElementById("mode-grid");
  const safetyReady = appState.plannerResult?.meta?.safety_status === "JOURNEY_RELATIVE_CONTEXT";
  grid.dataset.modeCount = String(modes.length);
  grid.innerHTML = modes.map(mode => {
    const unavailable = mode.mode === "SAFETY_FIRST" && !safetyReady;
    const availability = unavailable ? (language === "zh" ? " · 暂不可用" : " · Not available yet") : "";
    return `
    <button type="button" class="mode-segment ${unavailable ? "unavailable" : ""}" data-mode="${escapeHtml(mode.mode)}" aria-pressed="${!unavailable && mode.mode === appState.selectedMode}" title="${escapeHtml(modeExplanation(mode.mode, !unavailable))}" ${unavailable ? "disabled aria-disabled=\"true\"" : ""}>
      ${escapeHtml(modeName(mode.mode))}${availability}
    </button>`;
  }).join("");
  grid.querySelectorAll(".mode-segment:not([disabled])").forEach(card => card.addEventListener("click", () => {
    const mode = card.dataset.mode;
    const winner = (appState.plannerResult?.modes || []).find(row => row.mode === mode);
    appState.selectedMode = mode;
    if (winner) appState.selectedJourneyId = winner.winner_journey_id;
    appState.evidenceOpen = false;
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
    return {title: `${transfer} → ${leg.to?.name || "next stop"}`, detail: `${minutesCopy(leg.duration_min)} · ${fmt(leg.distance_m)} ${language === "zh" ? "米" : "m"}`};
  }
  if (leg.type === "WAIT") {
    const departure = sfTime(leg.predicted_departure);
    const slack = hasNumber(leg.catch_slack_min)
      ? (language === "zh" ? ` · 换乘余量 ${Number(leg.catch_slack_min) >= 0 ? "+" : ""}${fmt(leg.catch_slack_min,1)} 分钟` : ` · Transfer slack ${Number(leg.catch_slack_min) >= 0 ? "+" : ""}${fmt(leg.catch_slack_min,1)} min`)
      : "";
    const time = departure
      ? (language === "zh" ? `预计 ${departure} 发车` : `Predicted departure ${departure}`)
      : minutesCopy(leg.duration_min);
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
      detail: `${leg.from?.name || "—"} → ${leg.to?.name || "—"} · ${clock}${minutesCopy(leg.duration_min)} · ${fmt(leg.stop_count)} ${language === "zh" ? "站" : "stops"}${trip} · ${timingSource(leg.timing_status)}`
    };
  }
  return {title: leg.type || "Step", detail: ""};
}

function renderJourneyTimeline(journey) {
  document.getElementById("selected-journey-title").textContent = journey.route_sequence;
  const transfer = journey.transfer ? ` · ${transferComfort(journey.transfer)}` : "";
  document.getElementById("selected-journey-summary").textContent = language === "zh"
    ? `${minutesCopy(journey.eta_min)} · 步行 ${minutesCopy(journey.walking_min)} · ${timingSource(journey.eta_status)}${transfer}`
    : `${minutesCopy(journey.eta_min)} · ${minutesCopy(journey.walking_min)} walking · ${timingSource(journey.eta_status)}${transfer}`;
  const rows = [
    {title: appState.plannerResult?.origin?.name || "Origin", detail: language === "zh" ? "出发" : "Start"},
    ...(journey.legs || []).map(timelineRow),
    {title: appState.plannerResult?.destination?.name || "Destination", detail: language === "zh" ? "到达" : "Arrive"}
  ];
  document.getElementById("journey-timeline").innerHTML = rows.map(row => `<li><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("");
}

function historicalContextLevel(value) {
  if (!hasNumber(value)) return language === "zh" ? "数据不足" : "Not enough data";
  const percentile = Number(value);
  if (percentile <= 25) return language === "zh" ? "历史报告相对较少" : "Fewer historical reports nearby";
  if (percentile >= 75) return language === "zh" ? "历史报告相对较多" : "More historical reports nearby";
  return language === "zh" ? "接近全市常见范围" : "Near the city’s typical range";
}

function movementStatusCopy(status) {
  const labels = {
    SLOWER_THAN_COMPARISON: language === "zh" ? "明显低于参考速度" : "Well below the comparison speed",
    SLIGHTLY_BELOW_COMPARISON: language === "zh" ? "略低于参考速度" : "A little below the comparison speed",
    NEAR_COMPARISON: language === "zh" ? "接近参考速度" : "Near the comparison speed",
    NO_LIVE_SPEED: language === "zh" ? "没有足够的近期速度" : "Not enough recent speed data"
  };
  return labels[status] || String(status || "");
}

function journeyMovementSummary(journey) {
  const firstLeg = (journey.disruption_analysis || [])[0];
  if (!firstLeg) return language === "zh" ? "没有近期速度数据" : "No recent movement data";
  const route = `${language === "zh" ? "线路" : "Route"} ${firstLeg.route_id}`;
  if (!hasNumber(firstLeg.current_speed_mph)) {
    return `${route} · ${movementStatusCopy(firstLeg.movement_status)}`;
  }
  const cacheNote = ["RECENT_CACHED_PREDICTION", "MIXED_CACHED"].includes(journey.eta_status)
    ? (language === "zh" ? "近期缓存" : "recent cache")
    : null;
  return [
    route,
    `${fmt(firstLeg.current_speed_mph,1)} mph`,
    movementStatusCopy(firstLeg.movement_status),
    cacheNote
  ].filter(Boolean).join(" · ");
}

function journeySafetySegments(journey) {
  const safety = journey.safety || {};
  const fallbackSegments = [
    {key:"origin", percentile:safety.origin_percentile},
    {key:"boarding", percentile:safety.boarding_percentile},
    {key:"along_route", percentile:safety.route_percentile},
    {key:"transfer", percentile:safety.transfer_percentile},
    {key:"destination", percentile:safety.destination_percentile}
  ].filter(row => row.percentile != null);
  return safety.segments?.length ? safety.segments : fallbackSegments;
}

function historicalSegmentLabel(key) {
  const labels = {
    origin_boarding: language === "zh" ? "起点与上车区域" : "Origin and boarding area",
    origin: language === "zh" ? "起点区域" : "Origin area",
    boarding: language === "zh" ? "上车区域" : "Boarding area",
    along_route: language === "zh" ? "沿线路段" : "Along the route",
    transfer: language === "zh" ? "换乘区域" : "Transfer area",
    destination: language === "zh" ? "目的地区域" : "Destination area"
  };
  return labels[key] || key;
}

function roadContextForJourney(journey) {
  return (journey.disruption_analysis || []).flatMap(row =>
    (row.road_context || []).map(event => ({...event, route_id: row.route_id}))
  );
}

function renderRecommendationContext(journey) {
  const context = document.getElementById("recommendation-context");
  if (!context) return;
  const roads = roadContextForJourney(journey);
  const safetyPercentile = journey.safety?.overall_percentile;
  const signals = [
    {
      label: language === "zh" ? "首段公交当前移动" : "First transit leg now",
      value: journeyMovementSummary(journey)
    },
    {
      label: language === "zh" ? "道路背景" : "Street context",
      value: sourceStatusUnavailable(snapshot?.meta?.source_status?.roads)
        ? (language === "zh" ? "道路数据暂时不可用" : "Street data temporarily unavailable")
        : roads.length
          ? (language === "zh" ? `${roads.length} 项更新与行程接近` : `${roads.length} update${roads.length === 1 ? "" : "s"} near this trip`)
          : (language === "zh" ? "没有匹配到本行程的道路更新" : "No street update matched this trip")
    },
    {
      label: language === "zh" ? "历史事件参考" : "Historical context",
      value: hasNumber(safetyPercentile)
        ? `${historicalContextLevel(safetyPercentile)} · ${language === "zh" ? `第 ${fmt(safetyPercentile)} 百分位` : `${ordinal(safetyPercentile)} percentile`}`
        : (language === "zh" ? "暂时没有行程级数据" : "No trip-level data yet")
    }
  ];
  context.innerHTML = signals.map(signal => `<div><span>${escapeHtml(signal.label)}</span><strong>${escapeHtml(signal.value)}</strong></div>`).join("");
}

function compactComparisonCard(journey, label, featured = false) {
  return `<article class="compact-comparison-card ${featured ? "featured" : ""}">
    <p>${escapeHtml(label)}</p>
    <h4>${escapeHtml(journey.route_sequence)}</h4>
    <strong class="compact-comparison-eta">${minutesCopy(journey.eta_min)}</strong>
    <dl>
      <div><dt>${language === "zh" ? "步行" : "Walking"}</dt><dd>${minutesCopy(journey.walking_min)}</dd></div>
      <div><dt>${language === "zh" ? "换乘" : "Transfers"}</dt><dd>${fmt(journey.transfer_count)}</dd></div>
      <div><dt>${language === "zh" ? "当前运行" : "Current service"}</dt><dd>${escapeHtml(healthCopy(journey.reliability))}</dd></div>
      <div><dt>${language === "zh" ? "换乘余量" : "Transfer buffer"}</dt><dd>${escapeHtml(transferComfort(journey.transfer))}</dd></div>
    </dl>
  </article>`;
}

function renderCompactComparison(journey, alternatives) {
  const section = document.getElementById("compact-comparison");
  if (!section || alternatives.length < 2) {
    if (section) section.hidden = true;
    return;
  }
  const recommended = recommendedJourneyForMode() || journey;
  const fastestMode = (appState.plannerResult?.modes || []).find(row => row.mode === "FASTEST");
  const fastest = alternatives.find(row => row.journey_id === fastestMode?.winner_journey_id)
    || [...alternatives].sort((a,b) => Number(a.eta_min) - Number(b.eta_min))[0];
  const recommendedIsFastest = fastest?.journey_id === recommended.journey_id;
  const comparison = recommendedIsFastest
    ? [...alternatives].filter(row => row.journey_id !== recommended.journey_id).sort((a,b) => Number(a.eta_min) - Number(b.eta_min))[0]
    : fastest;
  if (!comparison) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  document.getElementById("compact-comparison-title").textContent = recommendedIsFastest
    ? (language === "zh" ? "推荐路线与下一条最快路线" : "Recommended route vs next-fastest route")
    : (language === "zh" ? "推荐路线与最快路线" : "Recommended route vs fastest route");
  document.getElementById("compact-comparison-note").textContent = recommendedIsFastest
    ? (language === "zh" ? "当前推荐本身已经最快；这里显示下一条最快路线，方便看清其他取舍。" : "The recommendation is already fastest, so the next-fastest route is shown for a useful tradeoff.")
    : (language === "zh" ? "推荐不只看时间，也会考虑步行、换乘和当前运行情况。" : "The recommendation weighs walking, transfers, and current service—not time alone.");
  document.getElementById("compact-comparison-grid").innerHTML = compactComparisonCard(recommended, language === "zh" ? "当前推荐" : "Recommended", true)
    + compactComparisonCard(comparison, recommendedIsFastest ? (language === "zh" ? "下一条最快" : "Next fastest") : (language === "zh" ? "最快到达" : "Fastest"));
}

function renderJourneyContextSummary(journey) {
  const section = document.getElementById("journey-context-summary");
  if (!section) return;
  section.hidden = false;
  const movementRows = (journey.disruption_analysis || []).map(row => {
    const speed = hasNumber(row.current_speed_mph)
      ? `${fmt(row.current_speed_mph,1)} mph${hasNumber(row.comparison_speed_mph) ? ` · ${language === "zh" ? "参考" : "comparison"} ${fmt(row.comparison_speed_mph,1)} mph` : ""}`
      : (language === "zh" ? "没有足够的近期速度" : "Not enough recent speed data");
    return `<div class="summary-evidence-row"><span>${escapeHtml(`${language === "zh" ? "线路" : "Route"} ${row.route_id}`)}</span><strong>${escapeHtml(movementStatusCopy(row.movement_status))}</strong>${hasNumber(row.current_speed_mph) ? `<small>${escapeHtml(speed)}</small>` : ""}</div>`;
  }).join("") || `<p class="summary-empty">${language === "zh" ? "这趟行程暂时没有近期移动数据。" : "No recent movement data is available for this trip."}</p>`;
  const roads = roadContextForJourney(journey);
  const roadRows = roads.slice(0,2).map(road => `<div class="summary-road"><span>${language === "zh" ? "道路更新" : "Street update"}</span><strong>${escapeHtml(roadEventTitleCopy(road))}</strong></div>`).join("");
  document.getElementById("journey-movement-summary").innerHTML = movementRows + (roadRows || `<p class="summary-empty">${sourceStatusUnavailable(snapshot?.meta?.source_status?.roads)
    ? (language === "zh" ? "道路数据暂时不可用，不能判断本段是否有道路事件。" : "Street data is temporarily unavailable, so this trip cannot be checked for street events.")
    : (language === "zh" ? "没有匹配到本行程的道路更新。" : "No street update matched this trip.")}</p>`) + (roads.length ? `<p class="summary-caution">${language === "zh" ? "道路事件可能相关，但不能证明它造成了公交减速。" : "A street event may be relevant, but it does not prove what caused slower transit."}</p>` : "");

  const segments = journeySafetySegments(journey);
  document.getElementById("journey-historical-summary").innerHTML = segments.length
    ? segments.map(segment => `<div class="summary-evidence-row"><span>${escapeHtml(historicalSegmentLabel(segment.key))}</span><strong>${escapeHtml(historicalContextLevel(segment.percentile))}</strong><small>${hasNumber(segment.percentile) ? escapeHtml(language === "zh" ? `与全部 Muni 站点相比：第 ${fmt(segment.percentile)} 百分位` : `Compared with all Muni stops: ${ordinal(segment.percentile)} percentile`) : ""}</small></div>`).join("")
      + `<p class="summary-caution">${language === "zh" ? "这是过去报告的区域比较，不能预测犯罪或判断一次出行是否安全。" : "This compares past reports by area. It cannot predict crime or determine whether a trip will be safe."}</p>`
    : `<p class="summary-empty">${language === "zh" ? "这趟行程暂时没有站点级历史背景。" : "Stop-level historical context is not available for this trip."}</p>`;
}

function renderJourneyEvidence(journey) {
  document.getElementById("journey-reliability-status").textContent = healthCopy(journey.reliability);
  const reliabilityRows = (journey.reliability_detail || []).map(row => `
    <div class="evidence-row"><span>${escapeHtml(`${row.route_id} · ${healthCopy(row.health)}`)}</span><strong>${hasNumber(row.median_headway_min) ? (language === "zh" ? `通常相隔 ${fmt(row.median_headway_min,1)} 分钟` : `Usually ${fmt(row.median_headway_min,1)} min apart`) : (language === "zh" ? "实时信息不足" : "Not enough live data")}</strong></div>
    <p class="fine-print">${language === "zh" ? `${fmt(row.bunching_events)} 处车辆挤在一起 · ${fmt(row.large_gap_events)} 处间隔过长 · 查看了 ${fmt(row.predictions_observed)} 条到站信息` : `${fmt(row.bunching_events)} close-together groups · ${fmt(row.large_gap_events)} long gaps · ${fmt(row.predictions_observed)} arrival estimates checked`}</p>`).join("");

  const disruptionRows = (journey.disruption_analysis || []).map(row => {
    const speed = hasNumber(row.current_speed_mph)
      ? (language === "zh"
        ? `${fmt(row.current_speed_mph,1)} mph；参考 ${fmt(row.comparison_speed_mph,1)} mph`
        : `${fmt(row.current_speed_mph,1)} mph; ${fmt(row.comparison_speed_mph,1)} mph comparison`)
      : (language === "zh" ? "无法比较当前速度" : "Current speed cannot be compared");
    const roads = (row.road_context || []).map(event => {
      const relation = event.relation === "NEARBY"
        ? (language === "zh" ? "附近" : "nearby")
        : (language === "zh" ? "与本段走廊重合或明确匹配" : "overlaps or directly matches this leg");
      return `<p class="fine-print">${escapeHtml(event.title)} · ${escapeHtml(relation)}</p>`;
    }).join("") || `<p class="fine-print">${sourceStatusUnavailable(snapshot?.meta?.source_status?.roads)
      ? (language === "zh" ? "道路数据暂时不可用，不能判断本段是否有道路事件。" : "Street data is temporarily unavailable, so this leg cannot be checked for street events.")
      : (language === "zh" ? "没有匹配到本段的道路事件。" : "No road event matched this leg.")}</p>`;
    return `
      <div class="evidence-row"><span>${escapeHtml(`${language === "zh" ? "线路" : "Route"} ${row.route_id}`)}</span><strong>${escapeHtml(movementStatusCopy(row.movement_status))}</strong></div>
      <p class="fine-print">${escapeHtml(speed)} · ${language === "zh" ? "参考值按交通方式设定，不是历史平均。" : "The comparison is mode-based, not a historical average."}</p>
      ${roads}`;
  }).join("");
  const causality = (journey.disruption_analysis || []).some(row => (row.road_context || []).length)
    ? `<p class="evidence-note">${language === "zh" ? "道路事件可能与减速有关，但位置接近和同时发生不能证明它就是延误原因。" : "A road event may be relevant, but proximity and timing do not prove it caused a delay."}</p>`
    : "";
  document.getElementById("journey-reliability-detail").innerHTML = reliabilityRows + disruptionRows + causality;

  const safety = journey.safety || {};
  const safetyReady = safety.status === "JOURNEY_RELATIVE_CONTEXT" && hasNumber(safety.overall_percentile);
  document.getElementById("journey-safety-status").textContent = safetyReady
    ? (language === "zh" ? `与全部 Muni 站点相比：第 ${fmt(safety.overall_percentile)} 百分位` : `Compared with all Muni stops: ${ordinal(safety.overall_percentile)} percentile`)
    : (language === "zh" ? "暂时没有行程级数据" : "No trip-level data yet");
  const segments = journeySafetySegments(journey);
  document.getElementById("journey-safety-detail").innerHTML = segments.map(segment => `
    <div class="evidence-row"><span>${escapeHtml(historicalSegmentLabel(segment.key))}</span><strong>${escapeHtml(historicalContextLevel(segment.percentile))}</strong></div>
    <p class="fine-print">${hasNumber(segment.percentile) ? (language === "zh" ? `与全部 Muni 站点相比：第 ${fmt(segment.percentile)} 百分位` : `Compared with all Muni stops: ${ordinal(segment.percentile)} percentile`) : ""}${hasNumber(segment.weight) ? (language === "zh" ? ` · 本次比较权重 ${fmt(segment.weight)}%` : ` · ${fmt(segment.weight)}% comparison weight`) : ""}${segment.trend === "RISING" ? (language === "zh" ? " · 最近 30 天报告有所增加" : " · Reports increased in the latest 30 days") : ""}</p>`).join("") +
    `<p class="evidence-note">${hasNumber(safety.ranking_effect?.excess_percentile_points) && safety.ranking_effect.excess_percentile_points > 0
      ? (language === "zh" ? `只有高于第 50 百分位的 ${fmt(safety.ranking_effect.excess_percentile_points)} 个百分点参与排序。综合推荐的权衡成本为 ${fmt(safety.ranking_effect.balanced_penalty_min,2)} 分钟，历史背景优先为 ${fmt(safety.ranking_effect.safety_first_penalty_min,2)} 分钟；这不会改变预计行程时间。` : `Only the ${fmt(safety.ranking_effect.excess_percentile_points)} points above the 50th percentile affect ranking. The tradeoff cost is ${fmt(safety.ranking_effect.balanced_penalty_min,2)} min for Balanced and ${fmt(safety.ranking_effect.safety_first_penalty_min,2)} min for Historical context; it does not change the ETA.`)
      : (language === "zh" ? "这项历史参考没有高于全部 Muni 站点的中间水平，因此不会增加排序成本。" : "This historical context is at or below the Muni-stop midpoint, so it adds no ranking cost.")}</p>` +
    `<p class="evidence-note">${language === "zh" ? "比较会参考去重后的 30、90 和 365 天报告及事件类别，并限制单个极端地点的影响。它不能预测犯罪、判断地点是否安全，也不能保证个人安全。" : "The comparison uses deduplicated 30-, 90-, and 365-day reports and incident categories, while limiting the influence of one extreme location. It cannot predict crime, label a place safe or unsafe, or guarantee personal safety."}</p>`;

  const parking = journey.destination_parking || {};
  const parkingReady = parking.status === "PAID_PARKING_PRESSURE_PROXY";
  const parkingStale = parking.status === "STALE";
  const parkingNoActivity = parking.status === "NO_RECENT_PAID_ACTIVITY";
  const parkingLimited = parking.status === "LIMITED_EVIDENCE";
  const parkingLabel = {
    LOW: language === "zh" ? "附近付费停车活动较少" : "Lower paid-parking activity nearby",
    MODERATE: language === "zh" ? "附近付费停车活动中等" : "Moderate paid-parking activity nearby",
    HIGH: language === "zh" ? "附近付费停车活动较多" : "Higher paid-parking activity nearby",
    VERY_HIGH: language === "zh" ? "附近付费停车活动很多" : "Very high paid-parking activity nearby"
  };
  const trendCopy = {
    RISING: language === "zh" ? "最近半小时有所增加" : "Increased in the latest 30 minutes",
    FALLING: language === "zh" ? "最近半小时有所减少" : "Decreased in the latest 30 minutes",
    STEADY: language === "zh" ? "最近两个半小时差不多" : "Similar across the last two half-hours"
  };
  document.getElementById("journey-parking-status").textContent = parkingReady
    ? (parkingLabel[parking.pressure_label] || (language === "zh" ? "已有附近付费停车数据" : "Nearby paid-parking data available"))
    : parkingStale
      ? (language === "zh" ? "DataSF 最新可用记录有延迟，未用于建议" : "DataSF’s latest available record is delayed and not used")
      : parkingLimited
        ? (language === "zh" ? "可匹配的数据不足，暂不判断高低" : "Not enough matched data to rate activity")
      : parkingNoActivity
        ? (language === "zh" ? "附近没有近期停车付费活动" : "No recent paid-parking activity nearby")
      : (language === "zh" ? "附近暂时没有足够数据" : "Not enough nearby data yet");
  document.getElementById("journey-parking-detail").innerHTML = parkingReady
    ? `
      <div class="evidence-row"><span>${language === "zh" ? "仍在付费时段内的记录" : "Paid sessions still within their paid period"}</span><strong>${fmt(parking.active_paid_sessions_proxy)}</strong></div>
      <div class="evidence-row"><span>${language === "zh" ? "最近 60 分钟开始付费" : "Paid sessions started in the last 60 min"}</span><strong>${fmt(parking.starts_60m)}</strong></div>
      <div class="evidence-row"><span>${language === "zh" ? "附近收录的收费车位" : "Metered spaces represented nearby"}</span><strong>${fmt(parking.metered_spaces_represented)}</strong></div>
      <div class="evidence-row"><span>${language === "zh" ? "近期变化" : "Recent change"}</span><strong>${escapeHtml(trendCopy[parking.trend] || (language === "zh" ? "无法判断" : "Unavailable"))}</strong></div>
      <p class="fine-print">${language === "zh" ? `相对值为第 ${fmt(parking.relative_pressure_percentile)} 百分位，只用于和有数据的区域比较付费活动。` : `The ${ordinal(parking.relative_pressure_percentile)} percentile only compares paid activity with other areas that have data.`}</p>
      <p class="fine-print">${language === "zh" ? `最后可用记录：${timeAgo(snapshot.parking?.source_snapshot_time)}` : `Latest available record: ${timeAgo(snapshot.parking?.source_snapshot_time)}`}</p>
      <p class="evidence-note">${language === "zh" ? "付费记录不代表车辆一定仍在现场，也不能告诉你还有多少空位。" : "A paid session does not prove a vehicle is still present and cannot tell you how many spaces are open."}</p>`
    : parkingStale
      ? `<p class="evidence-note">${language === "zh" ? `DataSF 最新可用停车付费记录来自 ${timeAgo(parking.source_snapshot_time)}。网页会继续检查更新，但不会把这份延迟数据当作当前停车压力。` : `DataSF’s latest available paid-parking record is from ${timeAgo(parking.source_snapshot_time)}. The site will keep checking, but it does not treat delayed data as current parking pressure.`}</p>`
      : parkingLimited
        ? `<p class="evidence-note">${language === "zh" ? `只有 ${fmt(Number(parking.match_coverage_ratio || 0) * 100)}% 的近期付费记录能对应到地图上的停车表。覆盖率达到 ${fmt(Number(parking.minimum_match_coverage_ratio || .7) * 100)}% 前，我们不会显示“高”或“低”。` : `Only ${fmt(Number(parking.match_coverage_ratio || 0) * 100)}% of recent paid sessions matched a mapped meter. We do not show a high or low rating below ${fmt(Number(parking.minimum_match_coverage_ratio || .7) * 100)}% coverage.`}</p>`
      : parkingNoActivity
        ? `<p class="evidence-note">${language === "zh" ? "这可能是因为当时不收费，或者近期确实没有付费记录；不能因此说停车压力低。" : "Meters may have been outside charging hours, or there may truly be no recent payments. This is not evidence that parking pressure is low."}</p>`
      : `<p class="evidence-note">${language === "zh" ? "这不是实时车位查询。没有匹配数据时，我们不会猜测停车难度。" : "This is not a live space finder. When nearby evidence is missing, we do not guess how difficult parking will be."}</p>`;
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
      <div class="alternative-card-header"><span class="alternative-card-route">${escapeHtml(row.route_sequence)}</span><span class="alternative-card-eta">${minutesCopy(row.eta_min)}</span></div>
      <p class="alternative-card-meta">${language === "zh" ? `步行 ${minutesCopy(row.walking_min)}` : `${minutesCopy(row.walking_min)} walk`} · ${fmt(row.transfer_count)} ${language === "zh" ? "次换乘" : Number(row.transfer_count) === 1 ? "transfer" : "transfers"} · ${escapeHtml(healthCopy(row.reliability))}</p>
      ${timingBadgeMarkup(row.eta_status)}
      ${index === 0 ? `<span class="alternative-card-badge">${language === "zh" ? `${selectedModeLabel}的首选` : `Top choice for ${selectedModeLabel}`}</span>` : row.pareto_efficient ? `<span class="alternative-card-badge">${language === "zh" ? "值得一起比较" : "Worth comparing"}</span>` : ""}
    </button>`).join("");
  list.querySelectorAll(".alternative-card").forEach(card => card.addEventListener("click", () => {
    appState.selectedJourneyId = card.dataset.journeyId;
    renderJourney();
  }));
}

function comparisonCard(journey, label) {
  const roadMatches = (journey.disruption_analysis || []).reduce(
    (sum, row) => sum + (row.road_context || []).length, 0
  );
  const roadsUnavailable = sourceStatusUnavailable(snapshot?.meta?.source_status?.roads);
  const roadCopy = roadsUnavailable
    ? (language === "zh" ? "道路数据暂时不可用" : "Street data temporarily unavailable")
    : roadMatches
    ? (language === "zh" ? `${roadMatches} 项附近道路背景` : `${roadMatches} nearby street update${roadMatches === 1 ? "" : "s"}`)
    : (language === "zh" ? "没有匹配到本路线的道路更新" : "No street update matched this route");
  return `<article class="comparison-card">
    <p class="eyebrow">${escapeHtml(label)}</p>
    <h4>${escapeHtml(journey.route_sequence)}</h4>
    <p class="comparison-eta">${minutesCopy(journey.eta_min)}</p>
    ${timingBadgeMarkup(journey.eta_status)}
    <dl>
      <div><dt>${language === "zh" ? "步行" : "Walking"}</dt><dd>${minutesCopy(journey.walking_min)}</dd></div>
      <div><dt>${language === "zh" ? "换乘" : "Transfers"}</dt><dd>${fmt(journey.transfer_count)}</dd></div>
      <div><dt>${language === "zh" ? "换乘余量" : "Connection"}</dt><dd>${escapeHtml(transferComfort(journey.transfer))}</dd></div>
      <div><dt>${language === "zh" ? "运行稳定性" : "Service reliability"}</dt><dd>${escapeHtml(healthCopy(journey.reliability))}</dd></div>
      <div><dt>${language === "zh" ? "首段公交当前移动" : "First transit leg now"}</dt><dd>${escapeHtml(journeyMovementSummary(journey))}</dd></div>
      <div><dt>${language === "zh" ? "历史报告背景" : "Historical context"}</dt><dd>${escapeHtml(historicalContextLevel(journey.safety?.overall_percentile))}</dd></div>
      <div><dt>${language === "zh" ? "道路背景" : "Street context"}</dt><dd>${escapeHtml(roadCopy)}</dd></div>
    </dl>
  </article>`;
}

function renderComparison(alternatives) {
  const panel = document.getElementById("comparison-panel");
  if (!panel || alternatives.length < 2 || !appState.comparisonOpen) {
    if (panel) panel.hidden = true;
    return;
  }
  panel.hidden = false;
  document.getElementById("comparison-title").textContent = language === "zh" ? "并排比较两条路线" : "Compare two routes side by side";
  document.getElementById("comparison-help").textContent = language === "zh"
    ? "选择任意两个方案，不用来回切换就能看清取舍。"
    : "Choose any two options to see the tradeoffs without switching back and forth.";
  document.getElementById("comparison-a-label").textContent = language === "zh" ? "方案 A" : "Option A";
  document.getElementById("comparison-b-label").textContent = language === "zh" ? "方案 B" : "Option B";
  const ids = new Set(alternatives.map(row => row.journey_id));
  let [firstId, secondId] = appState.compareJourneyIds;
  if (!ids.has(firstId)) firstId = ids.has(appState.selectedJourneyId) ? appState.selectedJourneyId : alternatives[0].journey_id;
  if (!ids.has(secondId) || secondId === firstId) secondId = alternatives.find(row => row.journey_id !== firstId)?.journey_id;
  appState.compareJourneyIds = [firstId, secondId];
  const optionMarkup = selectedId => alternatives.map(row =>
    `<option value="${escapeHtml(row.journey_id)}" ${row.journey_id === selectedId ? "selected" : ""}>${escapeHtml(row.route_sequence)} · ${minutesCopy(row.eta_min)}</option>`
  ).join("");
  const firstSelect = document.getElementById("comparison-a");
  const secondSelect = document.getElementById("comparison-b");
  firstSelect.innerHTML = optionMarkup(firstId);
  secondSelect.innerHTML = optionMarkup(secondId);
  const first = alternatives.find(row => row.journey_id === firstId);
  const second = alternatives.find(row => row.journey_id === secondId);
  document.getElementById("comparison-grid").innerHTML = comparisonCard(first, language === "zh" ? "方案 A" : "Option A")
    + comparisonCard(second, language === "zh" ? "方案 B" : "Option B");
  firstSelect.onchange = () => {
    appState.compareJourneyIds[0] = firstSelect.value;
    renderComparison(alternatives);
  };
  secondSelect.onchange = () => {
    appState.compareJourneyIds[1] = secondSelect.value;
    renderComparison(alternatives);
  };
}

function renderMobileRecommendation(journey) {
  const bar = document.getElementById("mobile-recommendation");
  bar.hidden = false;
  const isRecommended = journey.journey_id === recommendedJourneyForMode()?.journey_id;
  document.getElementById("mobile-recommendation-label").textContent = isRecommended
    ? (language === "zh" ? "当前推荐" : "Recommended now")
    : (language === "zh" ? "当前选择" : "Selected option");
  document.getElementById("mobile-recommendation-value").textContent = `${journey.route_sequence} · ${minutesCopy(journey.eta_min)}`;
  const button = document.getElementById("mobile-view-trip");
  button.textContent = language === "zh" ? "查看行程" : "View trip";
  button.onclick = () => document.getElementById("journey-workspace").scrollIntoView({behavior:"smooth", block:"start"});
}

function syncUiOverlays() {
  const evidence = document.getElementById("journey-evidence");
  const comparison = document.getElementById("comparison-panel");
  const routeDetails = document.getElementById("route-focus");
  const evidenceAvailable = Boolean(appState.plannerResult && selectedJourney());
  if (evidence) evidence.hidden = !(appState.evidenceOpen && evidenceAvailable);
  if (comparison && !appState.comparisonOpen) comparison.hidden = true;
  if (routeDetails) routeDetails.hidden = !appState.routeDetailsOpen;
  const anyOpen = Boolean(appState.evidenceOpen || appState.comparisonOpen || appState.routeDetailsOpen);
  const scrim = document.getElementById("ui-scrim");
  if (scrim) scrim.hidden = !anyOpen;
  document.body.classList.toggle("overlay-open", anyOpen);
  document.getElementById("why-route-button")?.setAttribute("aria-expanded", String(appState.evidenceOpen));
  document.querySelectorAll("[data-open-comparison]").forEach(button => button.setAttribute("aria-expanded", String(appState.comparisonOpen)));
  document.getElementById("route-detail-toggle")?.setAttribute("aria-expanded", String(appState.routeDetailsOpen));
}

function closeUiOverlays() {
  const returnFocus = overlayReturnFocus;
  appState.evidenceOpen = false;
  appState.comparisonOpen = false;
  appState.routeDetailsOpen = false;
  overlayReturnFocus = null;
  syncUiOverlays();
  returnFocus?.focus({preventScroll: true});
}

function focusOverlay(closeButtonId, trigger) {
  overlayReturnFocus = trigger;
  requestAnimationFrame(() => document.getElementById(closeButtonId)?.focus({preventScroll: true}));
}

function renderJourneyRecommendation(journey) {
  const recommendation = document.getElementById("journey-recommendation");
  recommendation.hidden = false;
  const isRecommended = journey.journey_id === recommendedJourneyForMode()?.journey_id;
  document.getElementById("recommendation-mode").textContent = language === "zh"
    ? `${isRecommended ? "推荐" : "当前选择"} · ${modeName(appState.selectedMode)}`
    : `${isRecommended ? "Recommended" : "Selected option"} · ${modeName(appState.selectedMode)}`;
  document.getElementById("recommendation-route").textContent = journey.route_sequence;
  document.getElementById("recommendation-eta").textContent = language === "zh"
    ? `${fmt(journey.eta_min, 1)} 分钟`
    : `${fmt(journey.eta_min, 1)} min`;
  const arrival = sfTime(new Date(Date.now() + Number(journey.eta_min || 0) * 60_000).toISOString());
  document.getElementById("recommendation-arrival").textContent = language === "zh"
    ? `预计约 ${arrival} 到达 · ${timingSource(journey.eta_status)}`
    : `Arrive around ${arrival} · ${timingSource(journey.eta_status)}`;
  const reasons = [
    `<span>${escapeHtml(healthCopy(journey.reliability))}</span>`,
    `<span>${escapeHtml(journey.transfer_count
      ? (language === "zh" ? `${fmt(journey.transfer_count)} 次换乘 · ${transferComfort(journey.transfer)}` : `${fmt(journey.transfer_count)} transfer${Number(journey.transfer_count) === 1 ? "" : "s"} · ${transferComfort(journey.transfer)}`)
      : (language === "zh" ? "直达 · 无需换乘" : "Direct · no transfer"))}</span>`,
    timingBadgeMarkup(journey.eta_status)
  ];
  document.getElementById("recommendation-reasons").innerHTML = reasons.join("");
  renderRecommendationContext(journey);
  document.getElementById("why-route-button").onclick = () => {
    appState.evidenceOpen = true;
    appState.comparisonOpen = false;
    syncUiOverlays();
    focusOverlay("why-route-close", document.getElementById("why-route-button"));
  };
  document.getElementById("explore-trip-button").onclick = () =>
    document.getElementById("journey-workspace").scrollIntoView({behavior:"smooth", block:"start"});
}

function renderPlannerEmpty() {
  document.getElementById("journey-od").textContent = language === "zh" ? "选择起点和终点后开始规划。" : "Choose an origin and destination to begin.";
  document.getElementById("journey-od").hidden = true;
  document.getElementById("journey-recommendation").hidden = true;
  document.getElementById("compact-comparison").hidden = true;
  document.getElementById("journey-context-summary").hidden = true;
  document.getElementById("mode-grid").hidden = true;
  document.getElementById("mode-grid").innerHTML = "";
  document.getElementById("journey-workspace").hidden = true;
  document.getElementById("alternatives-panel").hidden = true;
  document.getElementById("journey-loading").hidden = true;
  appState.evidenceOpen = false;
  appState.comparisonOpen = false;
  document.getElementById("comparison-panel").hidden = true;
  document.getElementById("mobile-recommendation").hidden = true;
  document.getElementById("planner-update-notice").hidden = true;
  syncUiOverlays();
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
  document.getElementById("journey-od").hidden = false;
  document.getElementById("mode-grid").hidden = false;
  document.getElementById("journey-workspace").hidden = false;
  document.getElementById("alternatives-panel").hidden = false;
  renderJourneyRecommendation(journey);
  renderCompactComparison(journey, result.alternatives || []);
  renderJourneyContextSummary(journey);
  renderModeCards(result.modes || []);
  renderAlternatives(result.alternatives || []);
  renderComparison(result.alternatives || []);
  renderJourneyMap(journey);
  renderJourneyTimeline(journey);
  renderJourneyEvidence(journey);
  renderMobileRecommendation(journey);
  syncUiOverlays();
}

async function planTrip({automaticRefresh = false} = {}) {
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
  if (!plannerEngineReady) {
    appState.plannerResult = null;
    renderPlannerEmpty();
    setPlannerError(language === "zh" ? "路线数据仍在加载，请稍后重试。" : "Route data is still loading. Try again in a moment.");
    return;
  }
  const requestKey = `${originId}|${destinationId}|${appState.selectedMode}`;
  const previousSelectedJourneyId = appState.selectedJourneyId;
  const previousModeWinnerId = (appState.plannerResult?.modes || [])
    .find(row => row.mode === appState.selectedMode)?.winner_journey_id || null;
  const button = document.getElementById("plan-trip-button");
  const loading = document.getElementById("journey-loading");
  button.disabled = true;
  if (!automaticRefresh) {
    loading.hidden = false;
    document.getElementById("journey-recommendation").hidden = true;
    document.getElementById("mode-grid").hidden = true;
    document.getElementById("journey-workspace").hidden = true;
    document.getElementById("alternatives-panel").hidden = true;
    closeUiOverlays();
  }
  setPlannerStatus(automaticRefresh
    ? (language === "zh" ? "收到新的公交数据，正在重新计算这趟行程…" : "New transit data received. Recalculating this trip…")
    : (language === "zh" ? "正在比较直达和一次换乘路线…" : "Comparing direct trips and trips with one transfer…"));
  const longerCalculationMessage = setTimeout(() => setPlannerStatus(
    language === "zh" ? "正在你的设备上继续比较路线，页面仍可正常操作…" : "Still comparing routes on your device. You can keep using the page…"
  ), 2500);
  try {
    if (!safetyContextLoaded && !automaticRefresh) {
      setPlannerStatus(language === "zh" ? "正在载入路线比较所需的历史背景…" : "Loading historical context for route comparison…");
    }
    await ensureSafetyContext();
    await plannerEngineReady;
    if (!automaticRefresh) setPlannerStatus(language === "zh" ? "正在建立候选路线并比较三种偏好…" : "Building candidates and comparing all three preferences…");
    const payload = await plannerWorkerCall("plan", {
      origin_stop_id: originId,
      destination_stop_id: destinationId,
      mode: appState.selectedMode
    });
    appState.plannerResult = payload;
    appState.plannerRequestKey = requestKey;
    appState.selectedMode = payload.selected_mode || appState.selectedMode;
    const previousStillAvailable = automaticRefresh && (payload.alternatives || [])
      .some(row => row.journey_id === previousSelectedJourneyId);
    appState.selectedJourneyId = previousStillAvailable ? previousSelectedJourneyId : payload.selected_journey_id;
    const nextModeWinnerId = (payload.modes || []).find(row => row.mode === appState.selectedMode)?.winner_journey_id || null;
    const updateNotice = document.getElementById("planner-update-notice");
    if (automaticRefresh && previousModeWinnerId && nextModeWinnerId !== previousModeWinnerId) {
      updateNotice.textContent = language === "zh"
        ? "新的公交数据改变了最佳方案。我们保留了你正在查看的路线；你可以查看上方更新后的推荐。"
        : "New transit data changed the top option. We kept the route you were viewing; review the updated recommendation above.";
      updateNotice.hidden = false;
    } else {
      updateNotice.hidden = true;
    }
    const hasLivePrediction = (payload.alternatives || []).some(row => row.eta_status === "REALTIME_TRIP_PREDICTION");
    const hasCachedPrediction = (payload.alternatives || []).some(row => row.eta_status === "RECENT_CACHED_PREDICTION");
    const hasLimitedLive = (payload.alternatives || []).some(row => row.eta_status === "MIXED_REALTIME");
    const hasMixedCached = (payload.alternatives || []).some(row => row.eta_status === "MIXED_CACHED");
    setPlannerStatus(hasLivePrediction
      ? (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。绿色标签使用实时预测；其他方案会明确标出估算。` : `Compared ${payload.alternatives?.length || 0} routes. Green labels use live predictions; estimates are marked separately.`)
      : hasCachedPrediction
        ? (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。到站时间来自 10 分钟内的近期缓存，不会标成完全实时。` : `Compared ${payload.alternatives?.length || 0} routes. Arrival times use a recent cache from under 10 minutes ago and are not labeled live.`)
      : hasLimitedLive
        ? (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。部分路段有实时数据，其余时间为估算。` : `Compared ${payload.alternatives?.length || 0} routes. Some legs have live data; remaining times are estimated.`)
        : hasMixedCached
          ? (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。部分路段使用近期缓存，其余时间为估算。` : `Compared ${payload.alternatives?.length || 0} routes. Some legs use a recent cache; remaining times are estimated.`)
        : (language === "zh" ? `已比较 ${payload.alternatives?.length || 0} 条路线。当前没有完整实时预测，所有时间均为估算。` : `Compared ${payload.alternatives?.length || 0} routes. Complete live predictions are unavailable, so all times are estimated.`));
    renderJourney();
  } catch (error) {
    appState.plannerResult = null;
    appState.selectedJourneyId = null;
    renderPlannerEmpty();
    const noJourney = String(error?.message || "").includes("No direct or one-transfer journey");
    setPlannerError(noJourney
      ? (language === "zh" ? "目前没有找到直达或只换乘一次的路线，请换一个邻近站点再试。" : "No direct or one-transfer route was found. Try a nearby stop instead.")
      : (language === "zh" ? "暂时无法在你的浏览器中比较路线。请刷新页面后重试。" : "We couldn't compare routes in this browser. Refresh the page and try again."));
  } finally {
    clearTimeout(longerCalculationMessage);
    loading.hidden = true;
    button.disabled = false;
  }
}

function renderContext() {
  const parking = snapshot.parking || {};
  const parkingStale = isOlderThan(parking.source_snapshot_time, 180);
  const parkingCoverageLimited = hasNumber(parking.match_coverage_ratio)
    && Number(parking.match_coverage_ratio) < Number(parking.minimum_match_coverage_ratio || .7);
  const parkingStarts = hasNumber(parking.recent_3h_transaction_count)
    ? fmt(parking.recent_3h_transaction_count)
    : String(parking.detail || "").match(/[\d,]+/)?.[0];
  document.getElementById("parking-status").textContent = parkingCoverageLimited
    ? (language === "zh" ? "可匹配的停车数据不足" : "Limited matched parking data")
    : parkingStale
    ? (language === "zh" ? "DataSF 最新可用停车记录有延迟" : "DataSF’s latest parking record is delayed")
    : (language === "zh" ? "最近 3 小时的停车付费活动" : "Paid parking activity in the last 3 hours");
  document.getElementById("parking-detail").textContent = parkingCoverageLimited
    ? (language === "zh" ? `目前有 ${fmt(Number(parking.match_coverage_ratio) * 100)}% 的近期付费记录能对应到地图上的停车表，所以暂不判断活动高低。` : `${fmt(Number(parking.match_coverage_ratio) * 100)}% of recent paid sessions currently match a mapped meter, so no high or low rating is shown.`)
    : parkingStale
    ? (language === "zh" ? `DataSF 最新可用记录来自 ${timeAgo(parking.source_snapshot_time)}，所以不会用它判断当前停车压力。网页本身仍会继续检查更新。` : `DataSF’s latest available record is from ${timeAgo(parking.source_snapshot_time)}, so it is not used to describe current parking pressure. The site will keep checking for newer data.`)
    : parkingStarts
    ? (language === "zh" ? `最近的数据中有 ${parkingStarts} 次停车付费开始记录。最后可用记录来自 ${timeAgo(parking.source_snapshot_time)}。它反映付费活动，不代表实际还有多少空位。` : `${parkingStarts} paid parking sessions began in the latest data. The latest available record is from ${timeAgo(parking.source_snapshot_time)}. This shows payment activity, not the number of open spaces.`)
    : (language === "zh" ? "停车付费记录可以反映附近活动多少，但不代表实际还有多少空位。" : "Parking payments can show nearby activity, but not the number of open spaces.");
  const safety = snapshot.safety || {};
  document.getElementById("safety-status").textContent = !safetyContextLoaded
    ? (language === "zh" ? "需要时再载入" : "Loads when needed")
    : (language === "zh" ? "过去 365 天的历史记录" : "Historical records from the past 365 days");
  document.getElementById("safety-detail").textContent = !safetyContextLoaded
    ? (language === "zh" ? "开始比较路线或打开这一部分时，页面才会下载历史背景数据，避免拖慢首次打开。" : "Historical context downloads only when you compare routes or open this section, so it does not slow the first screen.")
    : (language === "zh" ? "每个行程区域会与全部 Muni 站点的历史报告情况比较。这不能预测犯罪，也不能判断某个地方是否安全。" : "Trip areas are compared with historical report context across all Muni stops. This cannot predict crime or label a place safe or unsafe.");
}

function renderRouteView() {
  renderMap();
  renderRouteFocus();
  renderRouteGrid();
  renderEvents();
  renderNetworkUpdateSummary();
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
  if (userLocation) renderNearbyStops();
  renderJourney();
  renderContext();
}

function sourceRevision(value, names) {
  const status = value?.meta?.source_status || {};
  return names.map(name => {
    const row = status[name] || {};
    return `${name}:${row.checked_at || row.observed_at || row.status || "missing"}`;
  }).join("|");
}

async function loadPublicSnapshot(cacheBuster, {includeSafety = safetyContextLoaded} = {}) {
  const coreResponse = await fetch(`data/live-transit.json?t=${cacheBuster}`, {cache:"no-store"});
  if (!coreResponse.ok) {
    // Compatibility path for the first deployment before split files exist.
    const fallback = await fetch(`data/latest.json?t=${cacheBuster}`, {cache:"no-store"});
    if (!fallback.ok) throw new Error(`Snapshot request returned HTTP ${fallback.status}`);
    const fallbackPayload = await fallback.json();
    safetyContextLoaded = Boolean(fallbackPayload.safety && Object.keys(fallbackPayload.safety).length);
    return fallbackPayload;
  }

  const core = await coreResponse.json();
  const merged = {
    ...core,
    meta: {
      ...(core.meta || {}),
      errors: [...(core.meta?.errors || [])],
      source_status: {...(core.meta?.source_status || {})}
    },
    alerts: snapshot?.alerts || [],
    road_events: snapshot?.road_events || [],
    parking: snapshot?.parking || {},
    safety: snapshot?.safety || {}
  };
  const pieces = [
    {path:"alerts-roads.json", names:["alerts", "roads"], fields:["alerts", "road_events"]},
    {path:"parking-context.json", names:["parking"], fields:["parking"]},
    {path:"safety-context.json", names:["safety"], fields:["safety"]}
  ];
  const due = pieces.filter(piece => (includeSafety || piece.path !== "safety-context.json") && (!snapshot
    || sourceRevision(core, piece.names) !== sourceRevision(snapshot, piece.names)));

  // Feature 31 · Partial snapshot recovery / 局部快照容错
  // 中文：公交核心数据先被接受。道路、停车或历史背景文件单独失败时，
  // 保留浏览器上一次成功载入的副本并明确标记，不让一个附加数据源拖垮实时到站。
  // English: Core transit wins first. Optional context files settle independently;
  // a failed context load keeps the previous browser copy with an explicit status.
  const loaded = await Promise.allSettled(due.map(async piece => {
    const response = await fetch(`data/${piece.path}?t=${cacheBuster}`, {cache:"no-store"});
    if (!response.ok) throw new Error(`${piece.path} returned HTTP ${response.status}`);
    return {piece, payload: await response.json()};
  }));
  loaded.forEach((result, index) => {
    const piece = due[index];
    if (result.status === "fulfilled") {
      const {payload} = result.value;
      for (const field of piece.fields) merged[field] = payload[field] ?? merged[field];
      if (piece.path === "safety-context.json") safetyContextLoaded = true;
      return;
    }
    merged.meta.errors.push(`Browser could not load ${piece.path}: ${result.reason?.message || "unknown error"}`);
    for (const name of piece.names) {
      const previousSource = snapshot?.meta?.source_status?.[name] || {};
      const currentSource = merged.meta.source_status[name] || {};
      merged.meta.source_status[name] = {
        ...currentSource,
        status: snapshot ? "retained_client_cache" : "unavailable",
        observed_at: snapshot ? previousSource.observed_at || null : null
      };
    }
  });
  return merged;
}

async function ensureSafetyContext() {
  if (safetyContextLoaded || !snapshot) return safetyContextLoaded;
  if (safetyContextRequest) return safetyContextRequest;
  safetyContextRequest = (async () => {
    try {
      const response = await fetch(`data/safety-context.json?t=${Date.now()}`, {cache:"no-store"});
      if (!response.ok) throw new Error(`safety-context.json returned HTTP ${response.status}`);
      const payload = await response.json();
      snapshot.safety = payload.safety || {};
      snapshot.meta = snapshot.meta || {};
      snapshot.meta.source_status = snapshot.meta.source_status || {};
      if (payload.source_status?.safety) {
        snapshot.meta.source_status.safety = payload.source_status.safety;
      }
      safetyContextLoaded = true;
      await syncPlannerEngine();
      renderContext();
      return true;
    } catch (error) {
      snapshot.meta = snapshot.meta || {};
      snapshot.meta.errors = [...(snapshot.meta.errors || []), `Browser could not load safety-context.json: ${error?.message || "unknown error"}`];
      snapshot.meta.source_status = snapshot.meta.source_status || {};
      snapshot.meta.source_status.safety = {
        ...(snapshot.meta.source_status.safety || {}),
        status: "unavailable"
      };
      await syncPlannerEngine();
      renderContext();
      return false;
    } finally {
      safetyContextRequest = null;
    }
  })();
  return safetyContextRequest;
}

async function loadData({includeNetwork = false} = {}) {
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  try {
    const previousGeneratedAt = snapshot?.meta?.generated_at || null;
    const hadActiveJourney = Boolean(appState.plannerResult && appState.plannerRequestKey);
    const cacheBuster = Date.now();
    const snapshotRequest = loadPublicSnapshot(cacheBuster, {includeSafety:safetyContextLoaded});
    const networkRequest = includeNetwork || !network
      ? fetch("data/network.json", {cache:"default"})
      : Promise.resolve(null);
    const [nextSnapshot, networkResponse] = await Promise.all([snapshotRequest, networkRequest]);
    if (networkResponse && !networkResponse.ok) throw new Error(`Network catalog request returned HTTP ${networkResponse.status}`);
    snapshot = nextSnapshot;
    if (networkResponse) network = await networkResponse.json();
    await syncPlannerEngine({networkChanged: Boolean(networkResponse)});
    renderAll({networkChanged: Boolean(networkResponse)});
    if (hadActiveJourney && snapshot.meta?.generated_at !== previousGeneratedAt) {
      await planTrip({automaticRefresh: true});
    }
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
    closeAllStopLists();
    setLanguage(language === "en" ? "zh" : "en", {syncUrl: true});
    if (snapshot && network) renderAll();
    else if (userLocation) renderNearbyStops();
  });
  document.getElementById("nearby-location-button").addEventListener("click", requestUserLocation);
  document.getElementById("nearby-radius").addEventListener("change", () => {
    if (userLocation) renderNearbyStops();
  });
  document.getElementById("refresh-button").addEventListener("click", () => loadData());
  document.querySelectorAll(".scope-button").forEach(button => button.addEventListener("click", () => setRouteScope(button.dataset.scope)));
  document.querySelectorAll("#map-layer-control input[data-layer]").forEach(input => input.addEventListener("change", () => {
    appState.layers[input.dataset.layer] = input.checked;
    syncMapLayers();
  }));
  document.getElementById("route-select").addEventListener("change", event => selectRoute(event.target.value, "all"));
  document.getElementById("direction-select").addEventListener("change", event => selectRoute(appState.selectedRoute, event.target.value));
  document.getElementById("route-detail-toggle").addEventListener("click", event => {
    appState.routeDetailsOpen = true;
    appState.evidenceOpen = false;
    appState.comparisonOpen = false;
    syncUiOverlays();
    focusOverlay("route-detail-close", event.currentTarget);
  });
  document.getElementById("route-detail-close").addEventListener("click", closeUiOverlays);
  document.getElementById("route-grid-toggle").addEventListener("click", () => {
    appState.showAllRoutes = !appState.showAllRoutes;
    renderRouteGrid();
  });
  document.getElementById("why-route-close").addEventListener("click", closeUiOverlays);
  document.querySelectorAll("[data-open-comparison]").forEach(button => button.addEventListener("click", event => {
    appState.comparisonOpen = true;
    appState.evidenceOpen = false;
    renderComparison(appState.plannerResult?.alternatives || []);
    syncUiOverlays();
    focusOverlay("comparison-close", event.currentTarget);
  }));
  document.getElementById("comparison-close").addEventListener("click", closeUiOverlays);
  document.getElementById("ui-scrim").addEventListener("click", closeUiOverlays);
  document.querySelector(".disruption-details")?.addEventListener("toggle", syncDisruptionDisclosure);
  document.getElementById("view-all-updates")?.addEventListener("click", () => {
    const details = document.querySelector(".disruption-details");
    if (details) details.open = true;
    document.getElementById("disruptions")?.scrollIntoView({behavior:"smooth", block:"start"});
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeUiOverlays();
  });
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
    [document.getElementById("origin-input"), document.getElementById("origin-suggestions"), document.getElementById("origin-browse-button")],
    [document.getElementById("destination-input"), document.getElementById("destination-suggestions"), document.getElementById("destination-browse-button")]
  ].forEach(([input, list, browseButton]) => {
    input.addEventListener("input", () => scheduleStopSearch(input, list));
    input.addEventListener("focus", () => scheduleStopSearch(input, list));
    browseButton.addEventListener("click", () => openAllStops(input, list));
    list.addEventListener("scroll", () => {
      if (list.scrollTop + list.clientHeight >= list.scrollHeight - 80) appendStopBrowseBatch(input, list);
    });
  });
  document.addEventListener("pointerdown", event => {
    document.querySelectorAll(".planner-field").forEach(field => {
      if (field.contains(event.target)) return;
      const input = field.querySelector("input[role='combobox']");
      const list = field.querySelector(".stop-suggestions");
      if (input && list) closeStopList(input, list);
    });
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
  const contextSection = document.getElementById("context");
  if (contextSection && "IntersectionObserver" in window) {
    const contextObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      contextObserver.disconnect();
      ensureSafetyContext();
    }, {rootMargin:"200px"});
    contextObserver.observe(contextSection);
  }
  // Feature 32 · Fast client pickup / 更快发现后台新快照
  // 中文：浏览器每 90 秒只读取不含密钥的 GitHub Pages JSON，不会调用 511，
  // 因此不会消耗 60 次/小时的 API 配额；后台仍按独立的 3 分钟节奏抓取。
  // English: Poll the credential-free Pages snapshot every 90 seconds. This
  // never calls 511, so it improves pickup latency without spending API quota.
  setInterval(() => loadData(), 90 * 1000);
});
