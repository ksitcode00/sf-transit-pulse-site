# Feature 8 — Historical incident environment / 历史事件环境

## Source and scope / 来源与范围

[DataSF Police Department Incident Reports: 2018 to Present](https://data.sf.gov/d/wg3w-h783),
dataset `wg3w-h783`, attribution SFPD. The existing `safety-context.json` contains
weighted grid summaries for Journey context; it is not the Feature 8 dataset.
Feature 8 reads the official category and local incident-time fields separately.

来源是 SFPD 官方事件报告，不是功能 7 的伤亡交通事故表。已有历史背景文件只存
网格汇总，无法还原类别和发生时间，因此功能 8 独立读取官方明细，不改变路线排序。

Locations are anonymized to nearby intersections, not exact addresses. Reports
include non-criminal events, lost property and investigations. They do not
establish guilt or predict personal risk. Report volume depends on reporting
practices, foot traffic, population and coverage; no safety/risk rate is computed.

位置是匿名化附近路口，不是精确地址。报告包括非刑事事件、遗失物品和调查；不等于
定罪，也不能预测个人风险。报案方式、人流、人口和覆盖范围影响数量，不计算风险率。

## Calculations / 计算步骤

1. Query the latest incident date no later than today's San Francisco date.
   Read 365 calendar days including that date, verify paginated row counts.
   / 排除未来日期，以最新可用事件日为截止，读取含截止日的 365 个日历日并核对行数。
2. Deduplicate `incident_id`, preserving the union of its categories. Prefer
   coordinates/time from the most recently reported source row. Exclude missing
   IDs, invalid times and missing/out-of-scope coordinates. / 按编号去重、保留全部类别，
   使用最新报告行的时间和位置，排除缺失和无效位置等行。
3. Union the current GTFS stop catalog across all shape variants. Each stop ID
   appears once with its served routes. / 合并当前 GTFS 全部走向的站点，保留线路归属。
4. Index unique reported intersection coordinates in a 400 m grid. Compute
   approximate local straight-line distance to stops, retain matches ≤400 m.
   / 建立位置网格，计算到站点的近似直线距离，保留 400 米内的匹配。
5. Filter report locations by the union of the selected stop buffers. Count
   each report once, even across overlapping stops/routes. / 对所选站点范围取并集后计数，
   不把站点匹配数当事件数。
6. Day is 06:00–17:59, night is 18:00–05:59, using naive official incident
   timestamps as **San Francisco local clock values**, never converting them
   as UTC. This is not a daylight or risk definition. / 用旧金山当地时钟划分白天夜间，
   不把官方无时区的时间当 UTC，不代表日照或风险。
7. Category counts overlap when a report has multiple categories. Stop counts
   overlap when nearby stops share reports. Neither can be added into a total.
   Partial first/last months are marked `*`. / 类别与站点有重叠，不能相加；不完整月份加星号。

## Automatic publication / 自动发布

`build-incident-environment.yml` checks daily at 13:53 UTC (21:53 China time).
The existing Cloudflare Worker supplies an independent daily timer; GitHub cron
is fallback. Recent successful/active runs are deduplicated. Every build rereads
the one-year window to include late reports and corrections. Download failure,
empty/incomplete results or regressed coverage leave previous GitHub data intact.
Successful data commits trigger Pages deployment. **No additional 511 calls.**

每天 13:53 UTC（北京时间 21:53）检查；Cloudflare 独立调度，GitHub 作备用。
近期成功或正在运行的任务避免重复请求。重读一年窗口以捕获补录和修订。失败、空数据、
不完整下载或日期倒退，不会替换已发布数据。成功后自动部署；**不增加 511 请求**。

### Source-quality degradation / 上游数据质量降级

On October 10, 2026, the official API returned reports with no latitude or
longitude values. HTTP 200 and a complete download did not mean a usable spatial
dataset. A coordinate preflight now rejects this case before downloading detail
pages. A year-window losing more than half its mapped reports also requires
review: this conservative guard can intentionally defer a legitimate major source
revision. It never fills coordinates from old reports or invents new positions.

2026 年 10 月 10 日，官方接口返回的事件没有经纬度。HTTP 200 和下载行数一致并不
代表空间数据可用。现在先检查坐标数量，发现全空就不下载明细。一年窗口中可定位事件
数量突然损失过半也会停止替换：这是保守保护，若上游进行合法大规模修订，需要人工
检查后调整。不会从旧报告补坐标，也不会编造位置。

When a validated release already exists, a known source-quality problem retains
both its JSON and Tableau ZIP **byte-for-byte**, writes `DEGRADED` to a separate
health file, and emits an Actions warning/summary. The job completing means the
fallback was handled, **not** that fresh data was published. The website shows
the reason, latest check, last successful update and retained coverage separately.
Daily checks continue, and a valid source clears degradation automatically.
No initial release, code errors and publication failures still fail the job.

已有有效发布时，已识别的上游质量问题会保留 JSON 和 Tableau ZIP 原文件，只更新
独立健康文件为 `DEGRADED`，并写 Actions 警告及摘要。任务完成仅代表降级流程正常，
**不代表数据已更新**。网站分别显示原因、检查时间、成功更新时间和保留的数据范围。
继续每天检查，通过验证后自动恢复。首次无有效数据、代码错误和发布失败仍会报错。

## Files and Tableau / 文件与 Tableau

- `site/data/incident-environment.json`: packed unique reports, category catalog,
  anonymized positions, stop catalog and location matches. / 网页用去重事件与站点位置匹配。
- `site/data/incident-environment-health.json`: source status, check time, reason
  and last successful release time. Does not change cached data freshness.
  / 独立上游状态、检查时间、原因和成功更新时间，不改变旧数据的新鲜度。
- `site/data/tableau/feature8_incident_environment.zip`: incident, category,
  stop-location and stop CSVs with bilingual data instructions. / 四张 CSV 与双语说明。
- `scripts/prepare_incident_environment.py`: daily data preparation. / 自动数据处理。
- `site/analytics/incident-environment.mjs`: map/filter/trend/category UI. / 分析界面。

In Tableau relate events to stop-location matches by `location_index`, and
categories by `incident_id`; use `COUNTD(incident_id)` after relationships/joins.
The website implementation is native web analytics, not a Tableau workbook.

Tableau 中事件与站点位置表按 `location_index` 关联，类别按 `incident_id` 关联，
使用 `COUNTD(incident_id)`。当前上线的是原生网页分析，不冒充已发布 Tableau 工作簿。
