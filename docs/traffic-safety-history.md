# Feature 7 — Traffic safety history / 交通事故历史

## Source and boundary / 数据来源与边界

Source: DataSF **Traffic Crashes Resulting in Injury**, `ubvf-ztfx`, maintained
from official San Francisco crash records. Attribution: TransBASE / SFDPH,
SFPD and SFMTA. [Official dataset](https://data.sf.gov/d/ubvf-ztfx).

来源是官方伤亡交通事故数据，不是 `wg3w-h783` 警方事件报告。已有
`safety-context.json` 保持原样，Feature 7 不使用其事件类别权重。

Coverage rolls from January 1 of `(latest source year - 4)` to the latest
available crash date. The first release covers **2022-01-01–2026-07-31**.
The most recent year is partial, and the source may release or revise records
after a reporting delay. Checking it weekly does not make it realtime.

窗口从最新事故年份减 4 的元旦开始，到最新可用事故日期结束。第一次发布覆盖
**2022-01-01–2026-07-31**。最新年不完整，上游可能延迟发布或修订；每周检查
不等于实时事故 feed。

## Processing / 处理步骤

1. Query the official maximum accident date and source load date. Download the
   rolling window in stable, paginated batches; verify the received row count
   matches the source count. / 读取最新日期，分页下载，并核对完整行数。
2. Deduplicate `case_id_pkey`, retaining its latest update. Exclude missing IDs,
   dates, invalid coordinates and coordinates outside the project's SF bounds.
   / 按事故编号保留最新版本，排除缺失或无效位置等记录。
3. Map exact official injury descriptions to fatal, severe, visible injury,
   complaint of pain, or unknown. Fatal and severe KPIs count **crashes**, while
   killed/injured totals count **people**. / 区分事故数与伤亡人数。
4. Build a spatial grid for the full line segments of all current GTFS shape
   variants. Compute minimum point-to-segment distance for each route and
   direction, retaining matches within 200 m. The local metre approximation is
   centered at 37.76°N. / 全走向线段匹配，网格筛选候选，再算最近距离。
5. Store one match per crash × route × direction. The browser deduplicates
   accident indices before statistics, so matching both directions cannot
   double the crash total. / 页面统计前再去重，不能把方向匹配数当事故数。
6. Export a compact web JSON and a zipped CSV package with source URLs and
   definitions. / 发布网页数据与带来源的 CSV 下载包。

## Automation / 自动更新

`build-traffic-safety.yml` checks weekly on Friday at 13:37 UTC. Cloudflare
dispatches independently with the same weekly cadence; GitHub cron is fallback.
Recent successful or active jobs suppress duplicate Cloudflare dispatches.
The build re-downloads the rolling window to capture corrections. A failed
download, incomplete response or regressed coverage does not replace the
previous valid file. Successful builds trigger Pages deployment via
`workflow_run`. **511 requests: zero.**

每周五 13:37 UTC（北京时间 21:37）检查一次。Cloudflare 独立触发，GitHub cron
作备用。近期成功或正在运行的任务避免重复调度。重读滚动窗口以捕获修订。下载
失败、不完整或日期倒退时，保留旧文件；成功后自动部署 Pages。**不调用 511。**

## Interpretation / 解读限制

- Reported injury/fatal crashes only; not all crashes. / 仅已报告伤亡事故。
- Current route alignments, not historic route reconstruction. / 当前线路，不是历史走向复原。
- Proximity does not prove Muni involvement. / 附近事故不等于 Muni 车辆事故。
- Raw counts lack traffic-volume, passenger-distance and route-length
  denominators; they are not comparative risk rates. / 没有流量等分母，不能叫风险率。
- Grouped street pairs describe report locations, not precise segment risk
  scores. / 街道组统计不是路段风险评分。
- Pedestrian and cyclist categories overlap. / 行人与骑车者类别可能重叠。
- Coordinate exclusions mean mapped counts are not the official full city
  total. / 排除无效坐标后，地图数量不是官方全市总数。

## Files / 数据文件

- `site/data/traffic-safety.json`: web history, geometry and match indices.
- `site/data/tableau/feature7_traffic_safety.zip`: unique crash CSV, route match
  CSV, and bilingual data instructions. Use `COUNTD(crash_id)` in Tableau.
- `scripts/prepare_traffic_safety.py`: download, normalization and matching.

The browser lazy-loads this history when the section enters view (or is opened
directly by its anchor), keeping the realtime planner and homepage independent.
手机与电脑使用同一套筛选；进入功能 7 时才下载历史数据，不改变实时规划算法。
