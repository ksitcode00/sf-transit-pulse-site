# Commute Analytics / 通勤分析

## Product boundary / 产品边界

EN: One SF Transit Pulse site, two complementary views: live planning answers “How should I go now?”; Analytics answers “How has service performed, and what can I trust?” The homepage stays a transit product, not a wall of Tableau embeds.

中文：同一个 SF Transit Pulse，两个互补视角：实时规划回答“现在怎么走”，通勤分析回答“过去运行如何、这些信息能信多少”。首页保留出行产品定位，不同时加载八个 Tableau 页面。

| Feature / 功能 | Release state / 当前状态 | Purpose / 用途 |
| --- | --- | --- |
| 1 Route Map / 线路地图 | Available on web / 网站已上线 | Route geography / 理解线路走向 |
| 2 Route Reliability / 线路可靠度 | Available on web / 网站已上线 | Compare historical consistency / 比较历史稳定性 |
| 3 Best Time / 出行时间 | Available on web / 网站已上线 | Compare times of day / 比较出行时段 |
| 4 ETA Trustworthiness / 到站可信度 | Research preview / 研究预览 | Evaluate predictions against observed arrivals / 配对预测与实际到站 |
| 5 Construction / 道路施工 | Available / 已上线 | Spatial exposure, not causal attribution / 空间关联，不证明延误原因 |
| 6 Disruptions / 服务变更 | Archive collecting / 正在积累归档 | Historical service notices / 历史服务通知 |
| 7 Traffic Safety / 交通事故历史 | Available / 已上线 | Reported injury and fatal crashes / 已报告伤亡事故 |
| 8 Incident Environment / 历史事件背景 | Planned / 计划中 | Context, not personal safety predictions / 背景信息，不预测个人安全 |

## Feature 4 publication / 功能 4 发布流程

EN: Daily prediction Parquet archives reuse existing production Git snapshots (routes 1, 8, 30, 45; displayed wait ≤30 minutes). No extra realtime 511 calls. Official monthly stop observations are matched by service date + trip ID + stop ID + stop sequence. A successful monthly build publishes `site/data/eta-analytics.json`, and Pages listens to that workflow's completion. Failed matching never replaces the last valid result. A month without prediction artifacts is skipped, not presented as zero accuracy. If the official monthly source is late, the build may need retrying after publication; it cannot guarantee the source's release date.

中文：每日 Parquet 归档复用生产 Git 快照（1、8、30、45 号线，显示等待 ≤30 分钟），不增加实时 511 请求。官方月度实际到站按服务日期、班次、站点、停站序号精确配对。月度构建成功后发布精简 JSON，Pages 监听该流程完成并部署。匹配失败不会覆盖上一份有效结果；没有预测归档的月份跳过，不显示“误差为零”。若官方月度源尚未发布，需要之后重试，不能保证上游发布时间。

EN: Current public status is awaiting actual arrivals. The three error cards intentionally show a dash. The live capture panel is only one snapshot's inventory. Future matched public JSON contains horizon summaries plus calibration, stop, and time-of-day tables. P90 absolute error is not a 90% prediction interval. Calibration tables describe observed relationships; a trained calibration model has not been deployed. Existing analysis excludes actual waits over 120 minutes or absolute errors over 120 minutes, so published errors are conditional on this cleaning rule.

中文：当前公开状态为等待实际到站，三张误差卡片有意显示横线。最近快照数量只是一份数据的清单。未来匹配后的公开 JSON 包含提前量汇总、校正关系表、站点和时段分析。P90 绝对误差不是 90% 预测区间；校正关系表只描述历史关系，并不代表已部署校正模型。现有分析排除实际等待超过 120 分钟或绝对误差超过 120 分钟的记录，因此公开结果受此清洗规则约束。

## Features 1–3 publication / 功能 1–3 发布流程

EN: The public Analytics page receives a compact monthly JSON summary built directly from completed trip instances: route geometry, travel-time distribution, final-stop delay metrics, and weekday/hour delay cells. It deliberately recomputes medians, P90 values, and late-trip share from trip-level records rather than summing daily summary statistics. Raw trip rows remain in the monthly Tableau artifact.

中文：公开通勤分析页接收一个精简的月度 JSON：线路形状、行程时间分布、终点站延误指标，以及按星期/小时汇总的延误格。它直接从已完成班次重新计算中位数、P90 和晚点比例，绝不把每日汇总值相加。原始班次明细保留在月度 Tableau artifact 中。

EN: The public file is replaced with the latest complete month, never accumulated into an ambiguous multi-month average. Cloudflare dispatches the monthly build independently on the 15th and retries on the 22nd; the workflow requests the preceding calendar month. An older manual run is refused if a newer public month is already present.

中文：公开文件会替换为最新的完整月份，不会悄悄累积成含义不清的跨月平均值。Cloudflare 在每月 15 日独立触发构建，并在 22 日重试；流程请求上一个完整自然月。若网站已有更新月份，手动运行旧月份会被拒绝，不能把数据倒退。

## Adding Tableau later / 后续接入 Tableau

EN: Publish a completed workbook and supply its Tableau Public view URL. Add one on-demand embed or link beside the corresponding available web analysis; preserve `?lang=en/zh` in navigation. No Tableau iframe is currently loaded, so the product page remains fast on mobile.

中文：完成工作簿后提供 Tableau Public 视图网址。可在对应的已上线网页分析旁新增按需加载的嵌入或链接。导航保留 `?lang=en/zh`；目前没有加载 Tableau iframe，因此手机页面保持轻量。

## Verification / 验收

EN: Check EN/ZH links, four-route filtering, unavailable and pending states, stale snapshot labels, no horizontal page overflow on mobile, and successful matched-data JSON generation. Production keys never reach the browser. Existing planner tests remain unchanged except additional publication assertions.

中文：检查中英文跳转、四条线路筛选、读取失败与等待状态、旧快照标记、手机页面不横向溢出，以及配对结果 JSON 生成。密钥不进入浏览器。既有规划测试保留，新增结果发布验证。
