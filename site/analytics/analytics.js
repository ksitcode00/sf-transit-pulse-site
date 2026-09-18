// 中文：只展示已配对的误差，不把预测数量冒充准确度。
// English: Show matched errors only; prediction counts are not accuracy evidence.
const COPY = {
  en: {
    skip: "Skip to analytics",
    live: "Muni now",
    journey: "Plan a trip",
    analytics: "Commute analytics",
    beta: "Commute analytics",
    eyebrow: "Beyond your next ride",
    title: "Understand your commute.",
    lead: "Plan with current conditions. Look back to understand reliability, arrival estimates, and the places along your route.",
    openEta: "Explore ETA trustworthiness",
    openHistory: "Explore historical service",
    scope:
      "Features 1–3 use the latest complete historical Muni month. Feature 4 is collecting predictions. Feature 5 maps current street work. Feature 7 shows reported injury-crash history. Feature 6 is archiving notices; Feature 8 analytics are planned.",
    historyEyebrow: "Features 1–3 · Historical service",
    historyTitle: "Look at one route from three useful angles.",
    historyLead: "Select a route and direction. These results use the latest published complete month, not the live snapshot.",
    directionLabel: "Choose a direction",
    bothDirections: "Both directions",
    historyLoading: "Loading historical service data…",
    historyUnavailable: "Historical service data could not be loaded. Please reload to try again.",
    historySource: "{month} · {trips} completed Muni trips · 511 historic stop observations",
    historyLimit: "Delays compare each completed trip's observed final-stop time with its schedule. Historical patterns help with context; they do not describe current service or guarantee a future trip.",
    routeMapTitle: "1. Route map",
    routeMapLead: "The route geometry used by the historical feed. Blue and orange show the two recorded directions.",
    reliabilityTitle: "2. Route reliability",
    reliabilityLead: "Travel-time spread and final-stop delay across completed trips.",
    medianDelay: "Median final-stop delay",
    p90Delay: "P90 absolute delay",
    lateTrips: "Trips more than 5 min late",
    tripInstances: "Completed trips",
    travelSpread: "Travel-time distribution",
    travelSpreadLead: "The box covers the middle half of trips. The line marks the median.",
    bestTimeTitle: "3. Best time to travel",
    bestTimeLead: "Darker cells mean a larger median absolute final-stop delay. Each cell uses completed trips that started in that hour.",
    noHistory: "No historical records are available for this selection.",
    direction0: "Direction 0",
    direction1: "Direction 1",
    catalogEyebrow: "One platform, two views",
    catalogTitle: "Now tells you how to go. History helps you understand why.",
    feature4: "Feature 4 · ETA Accuracy & Trustworthiness",
    feature5: "Feature 5 · Construction & Closure Exposure",
    etaTitle: "It says “5 minutes.” How much can you trust it?",
    etaLead:
      "Compare the arrival estimate a rider saw with when the vehicle actually arrived. Start with Muni routes 1, 8, 30, and 45.",
    routeLabel: "Choose a route",
    all: "All four routes",
    captureTitle: "What is available in the latest prediction snapshot?",
    captureLead:
      "These counts describe one snapshot, not the archive and not prediction accuracy. Only estimates within 30 minutes of that snapshot are counted.",
    methodEyebrow: "Methodology & data",
    methodTitle: "Every result needs a prediction and an observed arrival.",
    formulas: "Definitions, calculations, and limits",
    limitations:
      "Four routes cannot represent all Muni service. Repeated predictions for the same arrival are related observations. Historical errors do not guarantee a future arrival time. Calibration models and validated uncertainty intervals are future work.",
    source: "View the analysis source on GitHub →",
    footer: "Independent research prototype · Not an official SFMTA service",
    back: "Back to trip planning →",
    collecting:
      "Collecting predictions · Accuracy results are not available yet",
    pending:
      "Predictions are being archived. Official observed arrivals are published in monthly historical packages. We do not infer actual arrivals from disappearing predictions. Errors appear only after successful matching and publication.",
    unavailable:
      "Analysis status could not be loaded. Please reload to try again.",
    published: "Matched official arrivals · Descriptive results available",
    period: "Matched service dates",
    sample: "Matched predictions",
    clusters: "Distinct trip-stop arrivals",
    error: "Median absolute error",
    p90: "P90 absolute error",
    bias: "Median signed error",
    minutes: "min",
    empty:
      "No matched evidence for this selection. This does not mean zero error.",
    pendingMetric: "Waiting for observed arrivals",
    count: "future stop predictions",
    trips: "trips",
    stops: "distinct stops",
    snapshot: "Snapshot time",
    stale:
      "This snapshot is over 10 minutes old. These are cached counts, not current conditions.",
    sampleOnly:
      "The feed is not marked live; it is not counted as research evidence.",
    loadFailed:
      "The latest prediction snapshot could not be loaded. The archive is separate.",
    route: "Route",
    horizon: "Minutes before actual arrival",
    n: "Predictions",
    feature: "Feature",
    tableau: "Available",
    planned: "Planned",
    preview: "Research preview",
    explore: "Open research preview →",
    exploreTraffic: "Explore traffic crash history →",
    example: "Example question",
    loading: "Loading snapshot…",
    groupNote:
      "Counted within each horizon group; an arrival may appear in multiple groups.",
    constructionTitle: "See the street work along a route.",
    constructionLead:
      "Choose a direction to see its route line and the current road-work or closure records spatially matched to it.",
    constructionFilter: "Show",
    directOnly: "Direct overlap only",
    allMapped: "All mapped context",
    constructionLoading: "Loading the latest construction snapshot…",
    constructionUnavailable: "Construction context is not available yet. Please try again later.",
    constructionSource: "{date} snapshot · {events} mapped records · refreshed daily",
    constructionDirect: "direct overlaps",
    constructionNearby: "nearby-context records",
    constructionLimit:
      "A mapped event is spatial context, not proof that it caused a Muni delay or reroute. Work zones and permitted closures are stronger road-condition signals; excavation permits are background context only.",
    constructionEmpty: "No mapped events match this route direction and filter in this snapshot.",
    constructionShown: "Showing {shown} of {total} mapped records",
    closestEvents: "Closest mapped records",
    eventDetails: "Event details",
    distance: "Distance from route",
    sourceLabel: "Source",
    exposureRankingTitle: "5A · Which routes have the most mapped road-event context?",
    exposureRankingLead: "Each bar counts distinct events once per route. Orange is a direct overlap; gray is nearby context only.",
    selectedRouteKpiTitle: "5B · A quick summary for this route direction",
    distinctEvents: "Distinct mapped events",
    nearbyEvents: "Nearby-context events",
    medianDistance: "Median distance to route",
    cityMapTitle: "5C · Where are the records across San Francisco?",
    cityMapLead: "This citywide view shows event locations from the same daily snapshot. It is not filtered to the selected route.",
    combinedMapTitle: "5D · Where do those records sit along this route?",
  },
  zh: {
    skip: "跳到通勤分析",
    live: "Muni 当前状况",
    journey: "规划行程",
    analytics: "通勤分析",
    beta: "通勤分析",
    eyebrow: "不只看下一班车",
    title: "更了解你的通勤。",
    lead: "实时信息帮你决定现在怎么走；历史分析帮你理解线路稳不稳定、预计到站时间准不准，以及沿途的背景情况。",
    openEta: "查看预计到站时间可信度",
    openHistory: "查看历史运行情况",
    scope:
      "功能 1–3 使用最新完整的 Muni 历史月份；功能 4 正在积累预测；功能 5 显示当前道路施工；功能 7 显示伤亡事故历史。功能 6 正在归档公告，功能 8 的分析页为后续计划。",
    historyEyebrow: "功能 1–3 · 历史运行情况",
    historyTitle: "从三个实用角度看一条线路。",
    historyLead: "选择线路和方向。以下结果来自最新一个完整发布的历史月份，不是实时快照。",
    directionLabel: "选择方向",
    bothDirections: "两个方向合并",
    historyLoading: "正在读取历史运行数据…",
    historyUnavailable: "暂时无法读取历史运行数据，请重新加载再试。",
    historySource: "{month} · {trips} 个完成的 Muni 班次 · 511 历史站点观测数据",
    historyLimit: "延误比较的是每趟已完成班次的终点站观测时间与原定时刻。历史规律只用于提供背景，不能代表当前运行，也不能保证下一趟车。",
    routeMapTitle: "1. 线路地图",
    routeMapLead: "历史数据所用的线路形状。蓝色和橙色表示记录到的两个方向。",
    reliabilityTitle: "2. 线路可靠度",
    reliabilityLead: "查看完成班次的行程时间分布和终点站延误。",
    medianDelay: "终点延误中位数",
    p90Delay: "绝对延误第 90 百分位",
    lateTrips: "晚超过 5 分钟的班次",
    tripInstances: "完成的班次",
    travelSpread: "行程时间分布",
    travelSpreadLead: "箱体表示中间一半班次，竖线表示中位数。",
    bestTimeTitle: "3. 更合适的出行时间",
    bestTimeLead: "颜色越深，终点站绝对延误中位数越大。每格只使用该小时开始的已完成班次。",
    noHistory: "这个选择暂时没有可用的历史记录。",
    direction0: "方向 0",
    direction1: "方向 1",
    catalogEyebrow: "同一个产品，两种视角",
    catalogTitle: "实时信息回答怎么走，历史分析帮你理解为什么。",
    feature4: "功能 4 · 预计到站时间准确度与可信度",
    feature5: "功能 5 · 道路施工与封路影响范围",
    etaTitle: "显示“还有 5 分钟”，到底能信多少？",
    etaLead:
      "把乘客当时看到的预计到站时间，与车辆实际到站时间配对比较。先研究 Muni 1、8、30、45 号线。",
    routeLabel: "选择线路",
    all: "全部四条线路",
    captureTitle: "最近一份预测快照里有什么？",
    captureLead:
      "数量只描述这一份快照，不代表全部历史，也不代表预测准确度。只统计从快照时间起、未来 30 分钟以内的预计到站记录。",
    methodEyebrow: "方法与数据",
    methodTitle: "同时有预测和实际到站，才能说准不准。",
    formulas: "字段定义、计算方法和局限",
    limitations:
      "四条线路不能代表全部 Muni。同一次到站反复记录的预测不是独立样本。历史误差不保证下一班车的到站时间。预测校正模型和经过验证的不确定性区间尚未上线。",
    source: "在 GitHub 查看分析代码 →",
    footer: "独立研究原型 · 非 SFMTA 官方服务",
    back: "返回行程规划 →",
    collecting: "正在积累预测 · 暂无准确度结果",
    pending:
      "系统正在保存预测历史。官方实际到站记录按月发布；我们不会把“预测从页面消失”当作实际到站。成功配对并发布分析后，才会展示误差指标。",
    unavailable: "暂时无法读取分析状态，请重新加载再试。",
    published: "已配对官方实际到站 · 可查看描述性结果",
    period: "已匹配的服务日期",
    sample: "已匹配预测记录数",
    clusters: "不同的班次到站事件数",
    error: "绝对误差中位数",
    p90: "绝对误差第 90 百分位",
    bias: "有符号误差中位数",
    minutes: "分钟",
    empty: "所选线路还没有匹配结果。这表示缺少证据，不是误差为零。",
    pendingMetric: "等待实际到站记录",
    count: "未来站点预测",
    trips: "班次",
    stops: "不同站点",
    snapshot: "快照时间",
    stale: "这份快照已超过 10 分钟，以下是缓存数量，不代表当前情况。",
    sampleOnly: "这份数据未标记为实时来源，不作为研究证据统计。",
    loadFailed: "暂时无法读取最近预测快照。分析历史保存在独立归档中。",
    route: "线路",
    horizon: "距离实际到站的分钟数",
    n: "预测记录数",
    feature: "功能",
    tableau: "已上线",
    planned: "计划中",
    preview: "研究预览",
    explore: "打开研究预览 →",
    exploreTraffic: "查看交通事故历史 →",
    example: "可以回答的问题",
    loading: "正在读取快照…",
    groupNote: "按提前量组内计数，同一次到站可能跨组重复。",
    constructionTitle: "看一条线路沿途的施工与封路记录。",
    constructionLead:
      "选择方向后，地图会显示该方向的路线，以及空间上匹配到这条路线的当前施工或封路记录。",
    constructionFilter: "显示范围",
    directOnly: "只看直接重叠",
    allMapped: "全部空间匹配记录",
    constructionLoading: "正在读取最新施工快照…",
    constructionUnavailable: "暂时无法读取道路施工背景数据，请稍后再试。",
    constructionSource: "{date} 快照 · {events} 条空间匹配记录 · 每天刷新",
    constructionDirect: "直接重叠",
    constructionNearby: "附近背景记录",
    constructionLimit:
      "地图上的匹配只表示空间背景，不能证明施工导致了 Muni 延误或改道。施工区和许可封路是较强的道路状况信号；挖掘许可只作为背景信息。",
    constructionEmpty: "这一线路方向在本次快照中没有符合筛选条件的空间匹配记录。",
    constructionShown: "显示 {shown} / {total} 条空间匹配记录",
    closestEvents: "距离路线最近的记录",
    eventDetails: "事件详情",
    distance: "距路线",
    sourceLabel: "数据来源",
    exposureRankingTitle: "5A · 哪些路线附近的道路事件最多？",
    exposureRankingLead: "每条路线对同一事件只计一次。橙色表示直接重叠；灰色表示只属于附近背景。",
    selectedRouteKpiTitle: "5B · 这条线路方向的快速摘要",
    distinctEvents: "不同的空间匹配事件",
    nearbyEvents: "附近背景事件",
    medianDistance: "距路线中位距离",
    cityMapTitle: "5C · 这些记录在旧金山哪里？",
    cityMapLead: "全市地图展示同一份每日快照中的事件位置，不会按当前选择的路线筛选。",
    combinedMapTitle: "5D · 这些记录落在这条路线的哪里？",
  },
};
const FEATURES = [
  ["Route Map", "线路地图", "Where does my bus go?", "这条公交线经过哪里？"],
  [
    "Route Reliability",
    "线路可靠度",
    "Which routes have more predictable service?",
    "哪些线路的运行更稳定？",
  ],
  [
    "Best Time to Travel",
    "更合适的出行时间",
    "Is my route more reliable outside rush hour?",
    "避开高峰，线路会不会更稳定？",
  ],
  [
    "ETA Accuracy & Trustworthiness",
    "预计到站准确度与可信度",
    "How much can I trust “5 minutes away”?",
    "显示“还有 5 分钟”，到底有多准？",
  ],
  [
    "Construction & Closure Exposure",
    "道路施工与封路影响范围",
    "Which street works are near my route?",
    "哪些施工或封路靠近我的线路？",
  ],
  [
    "Service Disruptions",
    "服务中断与变更",
    "What service changes keep coming up?",
    "哪些服务变更经常出现？",
  ],
  [
    "Traffic Safety History",
    "交通事故历史",
    "What traffic incidents were reported nearby?",
    "沿线附近曾报告过哪些交通事故？",
  ],
  [
    "Historical Incident Environment",
    "历史事件背景",
    "What incident records exist around stops?",
    "站点附近有哪些过去报告的事件？",
  ],
];
const QUESTIONS = {
  en: [
    [
      "Accuracy & bias",
      "Measure how large errors are and whether estimates tend to be early or late.",
    ],
    [
      "Route, stop & time",
      "Compare the four routes, individual stops, weekdays, weekends, and rush hours.",
    ],
    [
      "Prediction horizon",
      "Compare estimates seen 5, 10, or 20 minutes before arrival. Later, validate calibration and uncertainty on held-out dates.",
    ],
  ],
  zh: [
    ["准确度与偏差", "看误差有多大，也看预测是否经常偏早或偏晚。"],
    [
      "线路、站点与时间",
      "比较四条线路、不同站点，以及工作日、周末和高峰时段。",
    ],
    [
      "提前多久看更可靠",
      "比较实际到站前 5、10、20 分钟看到的预测。以后再用未参与训练的日期，验证校正和不确定性区间。",
    ],
  ],
};
const STEPS = {
  en: [
    [
      "Capture without extra 511 requests",
      "Reuse production snapshots refreshed roughly every 3 minutes. Archive daily compressed Parquet for four routes and a 30-minute window. Missing refreshes remain gaps; uncaptured forecasts cannot be recreated.",
    ],
    [
      "Wait for official actual arrivals",
      "Use 511 historical stop observations once the monthly package is available. Keep raw prediction artifacts for up to 60 days while waiting; retain matched analysis separately.",
    ],
    [
      "Match the same trip-stop instance",
      "Exactly match service date + trip ID + stop ID + stop sequence. Never mix dates or silently approximate a match.",
    ],
    [
      "Compute, aggregate, and publish",
      "Calculate signed and absolute errors, then summarize by horizon, route, stop, and local time. Publish compact results here; keep detailed Tableau-ready tables separately.",
    ],
  ],
  zh: [
    [
      "复用快照，不增加 511 请求",
      "复用主站约每 3 分钟生成的预测快照，只收四条线路、未来 30 分钟的预测，按天保存压缩 Parquet。漏抓时段保留为缺口，不能事后编造预测。",
    ],
    [
      "等待官方实际到站",
      "官方月度历史包发布后，使用 511 的站点观测记录。等待期间，原始预测归档最多保留 60 天；匹配后的分析另行保存。",
    ],
    [
      "匹配同一天、同一班车、同一次停站",
      "按服务日期 + 班次 ID + 站点 ID + 停站序号精确匹配。不混合不同日期的同名班次，也不悄悄近似匹配。",
    ],
    [
      "计算误差，汇总后发布",
      "计算有符号和绝对误差，再按提前量、线路、站点和当地时间汇总。网页发布精简结果，给 Tableau 的详细分析表单独保留。",
    ],
  ],
};
const DEFINITIONS = {
  en: [
    ["Cleaning limits", "Only matched arrivals after the snapshot are included. Actual waits over 120 minutes or absolute errors over 120 minutes are excluded. Results are conditional on these filters, not an unfiltered measure of all service."],
    [
      "Displayed ETA",
      "Predicted arrival − snapshot time: the wait the rider saw.",
    ],
    [
      "Prediction horizon",
      "Actual arrival − snapshot time. Buckets: 0–5, 5–10, 10–15, 15–20, 20–30, and 30+ minutes. A displayed wait of 30 minutes may turn into an actual wait longer than 30 minutes.",
    ],
    [
      "Signed error",
      "Predicted arrival − actual arrival. Negative means too early (optimistic); positive means too late.",
    ],
    [
      "Absolute error & P90",
      "Absolute error removes the sign. P90 is the error magnitude below which 90% of matched predictions fall. It is not a validated 90% arrival-time interval.",
    ],
    [
      "Sample size & model validation",
      "Report predictions and distinct trip-stop arrivals. Many snapshots may describe one arrival. Future models must split by date, not randomly put snapshots from the same trip into training and test sets.",
    ],
  ],
  zh: [
    ["数据清洗范围", "只分析快照之后发生的已匹配到站。实际等待超过 120 分钟或绝对误差超过 120 分钟的记录被排除，因此结果受这些筛选条件约束，不代表全部运行情况的未筛选误差。"],
    ["显示的等待时间", "预测到站 − 快照时间：乘客当时看到“还有几分钟”。"],
    [
      "预测提前量",
      "实际到站 − 快照时间。分为 0–5、5–10、10–15、15–20、20–30、30+ 分钟。显示等待不超过 30 分钟的预测，实际等待仍可能超过 30 分钟。",
    ],
    [
      "有符号误差",
      "预测到站 − 实际到站。负值表示预测偏早（过于乐观），正值表示预测偏晚。",
    ],
    [
      "绝对误差与 P90",
      "绝对误差不区分早晚。P90 表示 90% 已匹配预测的误差大小不超过该值；这不等于经过验证的“90% 到站时间区间”。",
    ],
    [
      "样本数量与模型验证",
      "同时报告预测条数和不同班次到站次数。同一次到站可能有多条快照。未来模型必须按日期划分训练和测试，不能把同一班车的快照随机拆到两边。",
    ],
  ],
};
let language = new URL(location.href).searchParams.get("lang");
if (!["en", "zh"].includes(language)) {
  try {
    language = localStorage.getItem("sf-transit-language");
  } catch {}
}
if (!["en", "zh"].includes(language)) language = "en";
let analysis = null,
  live = null,
  historical = null,
  construction = null,
  analysisError = false,
  liveError = false,
  historicalError = false,
  constructionError = false;
const t = (k) => COPY[language][k];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const num = (n) =>
  new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 2,
  }).format(n);
function render() {
  document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
  document.title = `${t("analytics")} · SF Transit Pulse`;
  document
    .querySelectorAll("[data-copy]")
    .forEach((el) => (el.textContent = t(el.dataset.copy)));
  document.querySelectorAll("[data-home]").forEach((el) => {
    const url = new URL(el.href);
    url.searchParams.set("lang", language);
    el.href = url;
  });
  const toggle = document.getElementById("language-toggle");
  toggle.textContent = language === "en" ? "中文" : "EN";
  toggle.setAttribute(
    "aria-label",
    language === "en" ? "切换到中文" : "Switch to English",
  );
  document.querySelector("#eta-route option").textContent = t("all");
  document
    .querySelector(".global-nav nav")
    .setAttribute(
      "aria-label",
      language === "zh" ? "主要导航" : "Main navigation",
    );
  document.getElementById("feature-catalog").innerHTML = FEATURES.map(
    (f, i) =>
      `<article class="feature-card ${i < 5 || i === 6 ? "feature-open" : ""}"><p class="feature-number">${t("feature")} ${i + 1}</p><h3>${esc(f[language === "zh" ? 1 : 0])}</h3><span class="feature-state">${t(i < 3 ? "tableau" : i === 3 ? "preview" : i === 4 || i === 6 ? "tableau" : "planned")}</span><p>${t("example")}: ${esc(f[language === "zh" ? 3 : 2])}</p>${i < 3 ? `<a href="#historical-service">${t("openHistory")}</a>` : i === 3 ? `<a href="#eta-accuracy">${t("explore")}</a>` : i === 4 ? `<a href="#construction-exposure">${t("explore")}</a>` : i === 6 ? `<a href="#traffic-safety">${t("exploreTraffic")}</a>` : ""}</article>`,
  ).join("");
  document.getElementById("research-questions").innerHTML = QUESTIONS[language]
    .map(([a, b]) => `<article><h3>${esc(a)}</h3><p>${esc(b)}</p></article>`)
    .join("");
  document.getElementById("method-steps").innerHTML = STEPS[language]
    .map(([a, b]) => `<li><strong>${esc(a)}</strong>${esc(b)}</li>`)
    .join("");
  document.getElementById("method-details").innerHTML = DEFINITIONS[language]
    .map(([a, b]) => `<p><strong>${esc(a)}</strong><br>${esc(b)}</p>`)
    .join("");
  renderResults();
  renderCapture();
  renderHistorical();
  renderConstruction();
}
function historyDirectionLabel(value) {
  if (value === "all") return t("bothDirections");
  if (value === "0") return t("direction0");
  if (value === "1") return t("direction1");
  return `${t("directionLabel")} ${value}`;
}
function historySourceText() {
  const [year, month] = String(historical.source_month || "").split("-");
  const label = year && month
    ? language === "zh"
      ? `${year} 年 ${Number(month)} 月`
      : new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${year}-${month}-01T00:00:00Z`))
    : "—";
  return t("historySource")
    .replace("{month}", label)
    .replace("{trips}", num(historical.trip_instance_count));
}
function renderHistorical() {
  const source = document.getElementById("historical-source");
  const target = document.getElementById("historical-results");
  const routeSelect = document.getElementById("historical-route");
  const directionSelect = document.getElementById("historical-direction");
  if (!historical) {
    source.textContent = historicalError ? t("historyUnavailable") : t("historyLoading");
    target.innerHTML = "";
    return;
  }
  const previousRoute = routeSelect.value;
  routeSelect.innerHTML = (historical.routes || []).map((route) => `<option value="${esc(route.route_short_name)}">${esc(route.route_short_name)} — ${esc(route.route_long_name)}</option>`).join("");
  routeSelect.value = [...routeSelect.options].some((option) => option.value === previousRoute) ? previousRoute : "1";
  const route = routeSelect.value;
  const directions = [...new Set((historical.reliability || []).filter((row) => row.route_short_name === route).map((row) => String(row.direction_id)))].sort();
  const previousDirection = directionSelect.value;
  directionSelect.innerHTML = `<option value="all">${esc(t("bothDirections"))}</option>${directions.filter((direction) => direction !== "all").map((direction) => `<option value="${esc(direction)}">${esc(historyDirectionLabel(direction))}</option>`).join("")}`;
  directionSelect.value = [...directionSelect.options].some((option) => option.value === previousDirection) ? previousDirection : "all";
  const direction = directionSelect.value;
  source.innerHTML = `<strong>${esc(historySourceText())}</strong><p>${esc(t("historyLimit"))}</p>`;
  const reliability = (historical.reliability || []).find((row) => row.route_short_name === route && String(row.direction_id) === direction);
  const geometry = (historical.geometries || []).filter((row) => row.route_short_name === route && (direction === "all" || String(row.direction_id) === direction));
  const rawHeatmap = (historical.heatmap || []).map((row) => ({
    route_short_name: String(row[0]), direction_id: String(row[1]), weekday_order: Number(row[2]), hour: Number(row[3]), trip_count: Number(row[4]), median_absolute_delay_min: Number(row[5]), p90_absolute_delay_min: Number(row[6]),
  }));
  const heatmap = rawHeatmap.filter((row) => row.route_short_name === route && row.direction_id === direction);
  if (!reliability || !geometry.length || !heatmap.length) {
    target.innerHTML = `<p class="history-empty">${t("noHistory")}</p>`;
    return;
  }
  target.innerHTML = `<div class="history-grid"><article class="history-card"><h3>${t("routeMapTitle")}</h3><p>${t("routeMapLead")}</p>${renderRouteMap(geometry, direction)}</article><article class="history-card"><h3>${t("reliabilityTitle")}</h3><p>${t("reliabilityLead")}</p>${renderReliability(reliability)}</article></div><article class="history-card"><h3>${t("bestTimeTitle")}</h3><p>${t("bestTimeLead")}</p>${renderHeatmap(heatmap)}</article>`;
}
function renderRouteMap(geometries, direction) {
  const paths = geometries.flatMap((entry) => entry.paths.map((points) => ({ direction: String(entry.direction_id), points })));
  const points = paths.flatMap((path) => path.points);
  const lats = points.map((point) => Number(point[0]));
  const lons = points.map((point) => Number(point[1]));
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const lonRange = Math.max(maxLon - minLon, .001), latRange = Math.max(maxLat - minLat, .001);
  const project = ([lat, lon]) => [60 + ((lon - minLon) / lonRange) * 880, 440 - ((lat - minLat) / latRange) * 380];
  const pathMarkup = paths.map((path) => {
    const pathData = path.points.map((point, index) => `${index ? "L" : "M"}${project(point).map((value) => value.toFixed(1)).join(" ")}`).join(" ");
    const color = direction === "all" && path.direction === "1" ? "#ff9500" : "#0071e3";
    return `<path class="route-path" style="stroke:${color}" d="${pathData}"/>`;
  }).join("");
  return `<svg class="route-map-svg" viewBox="0 0 1000 500" role="img" aria-label="${esc(t("routeMapTitle"))}">${pathMarkup}</svg>`;
}
function renderReliability(row) {
  const min = Number(row.travel_time_p05_min), q1 = Number(row.travel_time_p25_min), median = Number(row.travel_time_median_min), q3 = Number(row.travel_time_p75_min), max = Number(row.travel_time_p95_min);
  const scale = (value) => 5 + ((value - min) / Math.max(max - min, .1)) * 90;
  return `<div class="kpi-grid"><div class="kpi"><strong>${num(row.median_end_delay_min)} ${t("minutes")}</strong><span>${t("medianDelay")}</span></div><div class="kpi"><strong>${num(row.p90_absolute_delay_min)} ${t("minutes")}</strong><span>${t("p90Delay")}</span></div><div class="kpi"><strong>${num(row.late_trip_pct)}%</strong><span>${t("lateTrips")}</span></div><div class="kpi"><strong>${num(row.trip_count)}</strong><span>${t("tripInstances")}</span></div></div><h3 class="boxplot-title">${t("travelSpread")}</h3><p>${t("travelSpreadLead")}</p><div class="boxplot" aria-label="${esc(t("travelSpread"))}"><span class="boxplot-line"></span><span class="boxplot-tick" style="left:${scale(min)}%"></span><span class="boxplot-range" style="left:${scale(q1)}%;width:${Math.max(scale(q3) - scale(q1), .5)}%"></span><span class="boxplot-median" style="left:${scale(median)}%"></span><span class="boxplot-tick" style="left:${scale(max)}%"></span><div class="boxplot-axis"><span>${num(min)}</span><span>${num(median)} ${t("minutes")}</span><span>${num(max)}</span></div></div>`;
}
function renderHeatmap(rows) {
  const byCell = new Map(rows.map((row) => [`${row.weekday_order}-${row.hour}`, row]));
  const maxDelay = Math.max(...rows.map((row) => row.median_absolute_delay_min), 1);
  const weekdays = language === "zh" ? ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let content = `<div class="heatmap-scroll"><div class="heatmap"><span></span>`;
  for (let hour = 0; hour < 24; hour += 1) content += `<span class="heatmap-hour">${hour % 3 === 0 ? hour : ""}</span>`;
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    content += `<span class="heatmap-label">${weekdays[weekday - 1]}</span>`;
    for (let hour = 0; hour < 24; hour += 1) {
      const cell = byCell.get(`${weekday}-${hour}`);
      if (!cell) { content += '<span class="heatmap-cell no-data"></span>'; continue; }
      const intensity = .13 + .82 * Math.min(cell.median_absolute_delay_min / maxDelay, 1);
      const title = `${weekdays[weekday - 1]} ${hour}:00 · ${num(cell.median_absolute_delay_min)} ${t("minutes")} · ${num(cell.trip_count)} ${t("trips")}`;
      content += `<span class="heatmap-cell" title="${esc(title)}" style="background:rgba(0,102,204,${intensity.toFixed(2)})"></span>`;
    }
  }
  return content + "</div></div>";
}
function constructionDirections() {
  return Object.values(construction?.route_directions || {}).sort((a, b) =>
    String(a.route_short_name).localeCompare(String(b.route_short_name), undefined, { numeric: true }) ||
    String(a.direction_id).localeCompare(String(b.direction_id)),
  );
}
function constructionDate(value) {
  const date = new Date(`${value}T12:00:00-07:00`);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "long", day: "numeric" })
    : value || "—";
}
function constructionEventText(event, match) {
  const level = match[3] === "DIRECT_OVERLAP" ? t("constructionDirect") : t("constructionNearby");
  const distance = `${num(Number(match[4]))} m`;
  return [event.title, event.street, `${level} · ${distance}`, event.status].filter(Boolean).join(" · ");
}
function renderConstructionMap(direction, records) {
  const points = [
    ...(direction.shape || []).map(([lat, lon]) => [Number(lat), Number(lon)]),
    ...records.map(({ event }) => [Number(event.latitude), Number(event.longitude)]),
  ].filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
  if (!points.length) return "";
  const lats = points.map((point) => point[0]), lons = points.map((point) => point[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const lonRange = Math.max(maxLon - minLon, .003), latRange = Math.max(maxLat - minLat, .003);
  const project = ([lat, lon]) => [56 + ((lon - minLon) / lonRange) * 888, 448 - ((lat - minLat) / latRange) * 396];
  const routePath = (direction.shape || []).map((point, index) => `${index ? "L" : "M"}${project(point).map((value) => value.toFixed(1)).join(" ")}`).join(" ");
  const circles = records.map(({ event, match }) => {
    const [x, y] = project([Number(event.latitude), Number(event.longitude)]);
    const level = match[3] === "DIRECT_OVERLAP" ? "direct" : "nearby";
    return `<circle class="construction-event construction-event-${level}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5"><title>${esc(constructionEventText(event, match))}</title></circle>`;
  }).join("");
  return `<div class="construction-map-wrap"><svg class="construction-map" viewBox="0 0 1000 500" role="img" aria-label="${esc(t("feature5"))}"><path class="construction-route" d="${routePath}"/>${circles}</svg><div class="construction-legend"><span><i class="legend-dot legend-direct"></i>${esc(t("constructionDirect"))}</span><span><i class="legend-dot legend-nearby"></i>${esc(t("constructionNearby"))}</span></div></div>`;
}
function median(values) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function renderExposureRanking() {
  const labels = new Map(constructionDirections().map((row) => [String(row.route_id), `${row.route_short_name} — ${row.route_long_name}`]));
  const grouped = new Map();
  for (const match of construction.matches) {
    const routeId = String(match[0]), eventIndex = Number(match[2]);
    const current = grouped.get(routeId) || { direct: new Set(), nearby: new Set() };
    if (match[3] === "DIRECT_OVERLAP") current.direct.add(eventIndex);
    else current.nearby.add(eventIndex);
    grouped.set(routeId, current);
  }
  const rows = [...grouped.entries()].map(([routeId, groups]) => {
    const nearbyOnly = [...groups.nearby].filter((id) => !groups.direct.has(id)).length;
    return { routeId, label: labels.get(routeId) || routeId, direct: groups.direct.size, nearby: nearbyOnly, total: groups.direct.size + nearbyOnly };
  }).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, undefined, { numeric: true })).slice(0, 12);
  const maximum = Math.max(...rows.map((row) => row.total), 1);
  return `<article class="construction-card construction-ranking"><h3>${esc(t("exposureRankingTitle"))}</h3><p>${esc(t("exposureRankingLead"))}</p><div class="rank-list">${rows.map((row) => `<div class="rank-row"><span class="rank-label">${esc(row.label)}</span><span class="rank-bar"><i class="rank-direct" style="width:${(row.direct / maximum * 100).toFixed(2)}%"></i><i class="rank-nearby" style="width:${(row.nearby / maximum * 100).toFixed(2)}%"></i></span><strong>${num(row.total)}</strong></div>`).join("")}</div></article>`;
}
function renderCityEventMap() {
  const events = construction.events || [];
  const bounds = { minLat: 37.68, maxLat: 37.84, minLon: -122.55, maxLon: -122.33 };
  const project = ([lat, lon]) => [56 + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 888, 448 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 396];
  const dots = events.map((event) => {
    const lat = Number(event.latitude), lon = Number(event.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "";
    const [x, y] = project([lat, lon]);
    const type = event.evidence_type === "WORK_ZONE" ? "work" : event.evidence_type === "EXCAVATION_PERMIT" ? "permit" : "closure";
    return `<circle class="city-event city-event-${type}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2"><title>${esc([event.title, event.street, event.evidence_type, event.status].filter(Boolean).join(" · "))}</title></circle>`;
  }).join("");
  return `<article class="construction-card city-event-card"><h3>${esc(t("cityMapTitle"))}</h3><p>${esc(t("cityMapLead"))}</p><div class="construction-map-wrap"><svg class="construction-map city-event-map" viewBox="0 0 1000 500" role="img" aria-label="${esc(t("cityMapTitle"))}">${dots}</svg><div class="construction-legend"><span><i class="legend-dot legend-direct"></i>WORK_ZONE</span><span><i class="legend-dot legend-closure"></i>PERMITTED_CLOSURE</span><span><i class="legend-dot legend-nearby"></i>EXCAVATION_PERMIT</span></div></div></article>`;
}
function renderConstruction() {
  const source = document.getElementById("construction-source");
  const target = document.getElementById("construction-results");
  const routeSelect = document.getElementById("construction-route");
  const directionSelect = document.getElementById("construction-direction");
  const visibilitySelect = document.getElementById("construction-visibility");
  if (!construction?.route_directions || !Array.isArray(construction?.events) || !Array.isArray(construction?.matches)) {
    source.textContent = constructionError ? t("constructionUnavailable") : t("constructionLoading");
    target.innerHTML = "";
    return;
  }
  const directions = constructionDirections();
  const previousRoute = routeSelect.value;
  const routes = [...new Map(directions.map((row) => [String(row.route_id), row])).values()];
  routeSelect.innerHTML = routes.map((route) => `<option value="${esc(route.route_id)}">${esc(route.route_short_name)} — ${esc(route.route_long_name)}</option>`).join("");
  routeSelect.value = [...routeSelect.options].some((option) => option.value === previousRoute) ? previousRoute : "1";
  const routeDirections = directions.filter((row) => String(row.route_id) === routeSelect.value);
  const previousDirection = directionSelect.value;
  directionSelect.innerHTML = routeDirections.map((row) => `<option value="${esc(row.direction_id)}">${esc(row.direction_label || historyDirectionLabel(String(row.direction_id)))}</option>`).join("");
  directionSelect.value = [...directionSelect.options].some((option) => option.value === previousDirection) ? previousDirection : String(routeDirections[0]?.direction_id || "");
  const direction = routeDirections.find((row) => String(row.direction_id) === directionSelect.value);
  const includeNearby = visibilitySelect.value === "all";
  const records = construction.matches
    .filter((match) => String(match[0]) === routeSelect.value && String(match[1]) === directionSelect.value && (includeNearby || match[3] === "DIRECT_OVERLAP"))
    .map((match) => ({ match, event: construction.events[Number(match[2])] }))
    .filter((row) => row.event)
    .sort((a, b) => Number(a.match[4]) - Number(b.match[4]));
  const allDirectionRecords = construction.matches
    .filter((match) => String(match[0]) === routeSelect.value && String(match[1]) === directionSelect.value)
    .map((match) => ({ match, event: construction.events[Number(match[2])] }))
    .filter((row) => row.event);
  const distinctAll = new Set(allDirectionRecords.map(({ match }) => Number(match[2]))).size;
  const nearbyOnly = new Set(allDirectionRecords.filter(({ match }) => match[3] === "NEARBY_CONTEXT").map(({ match }) => Number(match[2]))).size;
  const medianDistance = median(allDirectionRecords.map(({ match }) => Number(match[4])));
  source.innerHTML = `<strong>${esc(t("constructionSource").replace("{date}", constructionDate(construction.snapshot_date)).replace("{events}", num(records.length)))}</strong><p>${esc(t("constructionLimit"))}</p>`;
  if (!direction || !records.length) {
    target.innerHTML = `<p class="history-empty">${esc(t("constructionEmpty"))}</p>`;
    return;
  }
  const shownRows = records.slice(0, 10);
  target.innerHTML = `<div class="construction-overview-grid">${renderExposureRanking()}<article class="construction-card construction-kpis"><h3>${esc(t("selectedRouteKpiTitle"))}</h3><div class="kpi-grid"><div class="kpi"><strong>${num(distinctAll)}</strong><span>${esc(t("distinctEvents"))}</span></div><div class="kpi"><strong>${num(nearbyOnly)}</strong><span>${esc(t("nearbyEvents"))}</span></div><div class="kpi"><strong>${medianDistance === null ? "—" : `${num(medianDistance)} m`}</strong><span>${esc(t("medianDistance"))}</span></div></div></article></div>${renderCityEventMap()}<article class="construction-card"><h3>${esc(t("combinedMapTitle"))}</h3><p class="scope-note">${esc(t("constructionShown").replace("{shown}", num(records.length)).replace("{total}", num(records.length)))}</p>${renderConstructionMap(direction, records)}<h3>${esc(t("closestEvents"))}</h3><div class="table-scroll" tabindex="0" role="region" aria-label="${esc(t("eventDetails"))}"><table><thead><tr><th scope="col">${esc(t("eventDetails"))}</th><th scope="col">${esc(t("distance"))}</th><th scope="col">${esc(t("sourceLabel"))}</th></tr></thead><tbody>${shownRows.map(({ event, match }) => `<tr><td>${esc([event.title, event.street].filter(Boolean).join(" · ") || event.event_type)}</td><td>${num(Number(match[4]))} m</td><td>${esc(event.evidence_type)}</td></tr>`).join("")}</tbody></table></div></article>`;
}
function renderResults() {
  const ready =
    analysis?.status === "available" &&
    Array.isArray(analysis.summary) &&
    analysis.summary.length > 0;
  document.getElementById("research-status").innerHTML =
    `<strong>${t(analysisError ? "unavailable" : ready ? "published" : "collecting")}</strong>${ready ? `<p>${t("period")}: ${esc(analysis.service_date_start)} — ${esc(analysis.service_date_end)}</p>` : analysisError ? "" : `<p>${t("pending")}</p>`}`;
  const target = document.getElementById("accuracy-results");
  if (!ready) {
    target.innerHTML = `<div class="metrics-grid">${["error", "p90", "bias"].map((k) => `<div class="metric-card"><span>${t(k)}</span><strong>—</strong><p>${t("pendingMetric")}</p></div>`).join("")}</div>`;
    return;
  }
  const route = document.getElementById("eta-route").value,
    rows = analysis.summary.filter(
      (r) => route === "all" || String(r.route_short_name) === route,
    );
  if (!rows.length) {
    target.innerHTML = `<p>${t("empty")}</p>`;
    return;
  }
  // 中文：直接使用源程序分组统计，绝不能对分组中位数再次平均。
  // English: Use source-computed statistics; never average group medians.
  target.innerHTML = `<p>${t("sample")}: ${num(rows.reduce((n, r) => n + r.prediction_count, 0))}</p><div class="table-scroll" tabindex="0" role="region" aria-label="${t("feature4")}"><table><caption>${t("groupNote")}</caption><thead><tr>${["route", "horizon", "n", "clusters", "error", "p90", "bias"].map((k) => `<th scope="col">${t(k)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.route_short_name)}</th><td>${esc(r.prediction_horizon_bucket)}</td><td>${num(r.prediction_count)}</td><td>${num(r.trip_stop_instance_count)}</td>${["median_absolute_error_min", "p90_absolute_error_min", "median_signed_error_min"].map((k) => `<td>${num(r[k])} ${t("minutes")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function renderBreakdowns() {
  if (analysis?.status !== "available") return;
  const route = document.getElementById("eta-route").value;
  const definitions = [
    [
      "calibration",
      language === "zh"
        ? "显示等待与实际等待（历史关系，非校正模型）"
        : "Displayed vs actual wait (historical relationship, not a trained model)",
      [
        ["route_short_name", t("route")],
        [
          "displayed_eta_minute",
          language === "zh" ? "显示等待（分钟）" : "Displayed wait (min)",
        ],
        [
          "median_actual_remaining_min",
          language === "zh"
            ? "实际等待中位数（分钟）"
            : "Median actual wait (min)",
        ],
        ["prediction_count", t("n")],
      ],
    ],
    [
      "stops",
      language === "zh" ? "站点比较" : "Stop comparison",
      [
        ["route_short_name", t("route")],
        ["direction_id", language === "zh" ? "方向" : "Direction"],
        ["stop_name", language === "zh" ? "站点" : "Stop"],
        ["prediction_count", t("n")],
        ["median_absolute_error_min", t("error")],
        ["p90_absolute_error_min", t("p90")],
      ],
    ],
    [
      "route_time",
      language === "zh"
        ? "时段比较（旧金山当地时间）"
        : "Time-of-day comparison (San Francisco time)",
      [
        ["route_short_name", t("route")],
        ["day_type", language === "zh" ? "日期类型" : "Day type"],
        ["local_hour", language === "zh" ? "小时" : "Hour"],
        ["prediction_count", t("n")],
        ["median_absolute_error_min", t("error")],
        ["p90_absolute_error_min", t("p90")],
      ],
    ],
  ];
  const display = (v) =>
    language === "zh" ? { Weekday: "工作日", Weekend: "周末" }[v] || v : v;
  document.getElementById("accuracy-results").insertAdjacentHTML(
    "beforeend",
    definitions
      .map(([key, title, columns]) => {
        const rows = (analysis[key] || []).filter(
          (r) => route === "all" || String(r.route_short_name) === route,
        );
        if (!rows.length) return "";
        return `<details class="analytics-panel"><summary>${esc(title)}</summary><div class="table-scroll" tabindex="0" role="region" aria-label="${esc(title)}"><table><thead><tr>${columns.map(([, label]) => `<th scope="col">${esc(label)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map(([key]) => `<td>${esc(display(row[key]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
      })
      .join(""),
  );
}
function renderCapture() {
  renderBreakdowns();
  const el = document.getElementById("capture-status");
  if (!live) {
    el.textContent = t(liveError ? "loadFailed" : "loading");
    return;
  }
  if (live.meta?.status !== "live") {
    el.textContent = t("sampleOnly");
    return;
  }
  const stamp = Date.parse(live.meta?.generated_at),
    route = document.getElementById("eta-route").value;
  if (!Number.isFinite(stamp)) {
    el.textContent = t("loadFailed");
    return;
  }
  const names = new Map(
    (live.routes || []).map((r) => [
      String(r.route_id),
      String(r.route_short_name || r.route_id),
    ]),
  );
  let count = 0;
  const trips = new Set(),
    stops = new Set();
  for (const trip of live.trip_predictions || []) {
    const name = names.get(String(trip.route_id)) || String(trip.route_id);
    if (
      !["1", "8", "30", "45"].includes(name) ||
      (route !== "all" && route !== name)
    )
      continue;
    for (const stop of trip.stops || []) {
      const arrival = Number(stop.arrival_time),
        ahead = arrival - stamp / 1000;
      if (!arrival || ahead <= 0 || ahead > 1800) continue;
      count++;
      trips.add(`${trip.service_date}|${trip.trip_id}`);
      stops.add(stop.stop_id);
    }
  }
  const date = new Date(stamp).toLocaleString(
    language === "zh" ? "zh-CN" : "en-US",
    { timeZone: "America/Los_Angeles" },
  );
  el.innerHTML = `<p><strong>${num(count)}</strong> ${t("count")} · ${num(trips.size)} ${t("trips")} · ${num(stops.size)} ${t("stops")}</p><p class="scope-note">${t("snapshot")}: ${esc(date)} (America/Los_Angeles)</p>${Date.now() - stamp > 600000 ? `<p>${t("stale")}</p>` : ""}`;
}
document.getElementById("language-toggle").addEventListener("click", () => {
  language = language === "en" ? "zh" : "en";
  try {
    localStorage.setItem("sf-transit-language", language);
  } catch {}
  const url = new URL(location.href);
  url.searchParams.set("lang", language);
  history.replaceState(null, "", url);
  render();
});
document.getElementById("eta-route").addEventListener("change", () => {
  renderResults();
  renderCapture();
});
document.getElementById("historical-route").addEventListener("change", renderHistorical);
document.getElementById("historical-direction").addEventListener("change", renderHistorical);
document.getElementById("construction-route").addEventListener("change", renderConstruction);
document.getElementById("construction-direction").addEventListener("change", renderConstruction);
document.getElementById("construction-visibility").addEventListener("change", renderConstruction);
let firstLoad = true;
async function load() {
  await Promise.all([
    fetch("../data/eta-analytics.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        analysis = d;
        analysisError = false;
      })
      .catch(() => {
        analysis = null;
        analysisError = true;
      }),
    fetch("../data/live-transit.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        live = d;
        liveError = false;
      })
      .catch(() => {
        live = null;
        liveError = true;
      }),
    fetch("../data/historical-analytics.json", { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        historical = d?.status === "available" ? d : null;
        historicalError = !historical;
      })
      .catch(() => {
        historical = null;
        historicalError = true;
      }),
    fetch("../data/construction-exposure.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        construction = d?.status === "available" ? d : null;
        constructionError = !construction;
      })
      .catch(() => {
        construction = null;
        constructionError = true;
      }),
  ]);
  renderResults();
  renderCapture();
  renderHistorical();
  renderConstruction();
  if (firstLoad) {
    firstLoad = false;
    const id = location.hash.slice(1);
    if (["overview", "historical-service", "eta-accuracy", "construction-exposure", "traffic-safety", "methodology"].includes(id))
      requestAnimationFrame(() =>
        document.getElementById(id).scrollIntoView({ behavior: "instant" }),
      );
  }
}
render();
load();
setInterval(load, 90000);
