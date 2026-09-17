// 中文：只展示已配对的误差，不把预测数量冒充准确度。
// English: Show matched errors only; prediction counts are not accuracy evidence.
const COPY = {
  en: {
    skip: "Skip to analytics",
    live: "Muni now",
    journey: "Plan a trip",
    analytics: "Commute analytics",
    beta: "Analytics · Research preview",
    eyebrow: "Beyond your next ride",
    title: "Understand your commute.",
    lead: "Plan with current conditions. Look back to understand reliability, arrival estimates, and the places along your route.",
    openEta: "Explore ETA trustworthiness",
    scope:
      "Feature 4 is open as a research preview. Features 1–3 are being built in Tableau; features 5–8 are planned. Not all eight dashboards are available yet.",
    catalogEyebrow: "One platform, two views",
    catalogTitle: "Now tells you how to go. History helps you understand why.",
    feature4: "Feature 4 · ETA Accuracy & Trustworthiness",
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
    tableau: "Tableau in progress",
    planned: "Planned",
    preview: "Research preview",
    explore: "Open research preview →",
    example: "Example question",
    loading: "Loading snapshot…",
    groupNote:
      "Counted within each horizon group; an arrival may appear in multiple groups.",
  },
  zh: {
    skip: "跳到通勤分析",
    live: "Muni 当前状况",
    journey: "规划行程",
    analytics: "通勤分析",
    beta: "通勤分析 · 研究预览",
    eyebrow: "不只看下一班车",
    title: "更了解你的通勤。",
    lead: "实时信息帮你决定现在怎么走；历史分析帮你理解线路稳不稳定、预计到站时间准不准，以及沿途的背景情况。",
    openEta: "查看预计到站时间可信度",
    scope:
      "第 4 个功能已开放研究预览。第 1–3 个功能正在 Tableau 中制作，第 5–8 个功能计划以后上线。这里并不是八个已完成的仪表板。",
    catalogEyebrow: "同一个产品，两种视角",
    catalogTitle: "实时信息回答怎么走，历史分析帮你理解为什么。",
    feature4: "功能 4 · 预计到站时间准确度与可信度",
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
    tableau: "Tableau 制作中",
    planned: "计划中",
    preview: "研究预览",
    explore: "打开研究预览 →",
    example: "可以回答的问题",
    loading: "正在读取快照…",
    groupNote: "按提前量组内计数，同一次到站可能跨组重复。",
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
  analysisError = false,
  liveError = false;
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
      `<article class="feature-card ${i === 3 ? "feature-open" : ""}"><p class="feature-number">${t("feature")} ${i + 1}</p><h3>${esc(f[language === "zh" ? 1 : 0])}</h3><span class="feature-state">${t(i < 3 ? "tableau" : i === 3 ? "preview" : "planned")}</span><p>${t("example")}: ${esc(f[language === "zh" ? 3 : 2])}</p>${i === 3 ? `<a href="#eta-accuracy">${t("explore")}</a>` : ""}</article>`,
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
  ]);
  renderResults();
  renderCapture();
  if (firstLoad) {
    firstLoad = false;
    const id = location.hash.slice(1);
    if (["overview", "eta-accuracy", "methodology"].includes(id))
      requestAnimationFrame(() =>
        document.getElementById(id).scrollIntoView({ behavior: "instant" }),
      );
  }
}
render();
load();
setInterval(load, 90000);
