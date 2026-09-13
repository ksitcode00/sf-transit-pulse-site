# SF Transit Pulse — Public Application

[Open the live web interface](https://ksitcode00.github.io/sf-transit-pulse-site/)

This public repository contains the browser application, credential-free data snapshots, and the scheduled refresh worker. Feature 25B runs trip planning in a Web Worker inside each visitor's browser, so no Render account or separately hosted API is required. The private analytical Notebook is intentionally excluded.

这个公开仓库包含网页、无密钥数据快照和自动刷新程序。Feature 25B 会在每位访客浏览器的 Web Worker 中计算路线，因此不需要 Render 账户、信用卡或单独部署 API。私有分析 Notebook 不在这里。

## Scheme B architecture / 方案 B 架构

```text
511 + public city data
        ↓  GitHub Actions (the API key stays in an encrypted Secret)
credential-free JSON snapshots
        ↓  GitHub Pages CDN
visitor's browser → Web Worker route calculation → interactive result
```

The page loads the static network once, refreshes the public realtime snapshot, and sends both objects to `planner-worker.js`. The worker returns the same result contract used by the UI without blocking map interaction. No credential or third-party compute service is required at request time.

网页只加载一次静态线路网络，并定期获取公开实时快照，然后把两份数据交给 `planner-worker.js`。Worker 使用与 UI 相同的数据格式返回结果，不会阻塞地图操作。用户查询时不需要密钥，也不依赖任何第三方计算服务。

The Public Beta planner supports stop search, direct and one-transfer candidates, three working comparison modes, clickable alternatives, a journey map, and trip-level evidence. Feature 20 retains concrete trips from the existing GTFS-RT Trip Updates request. When both required stop predictions exist, the planner shows the specific trip, predicted boarding and arrival times, and a transfer catch-slack calculation. Missing or incomplete predictions fall back to a clearly labeled estimate. Feature 23 makes SAFETY-FIRST a real ranking mode by comparing location-level historical incident-report counts along each candidate journey. Feature 24 adds paid-parking activity near the destination.

Public Beta 规划器支持站点搜索、直达与一次换乘、三种可用的比较模式、可点击备选方案、Journey 地图与行程级证据。Feature 20 会从现有 GTFS-RT Trip Updates 请求中保留具体班次；上下车站都有完整预测时，页面会显示具体班次、预计上下车时间和换乘余量。预测缺失或不完整时，系统会明确退回估算。Feature 23 会比较每条候选行程沿途的地点级历史报案数量，使 SAFETY-FIRST 真正改变路线排序。Feature 24 会显示目的地附近的停车付费活动。

## Public Beta truth contract / Public Beta 真实性约定

- A journey uses trip-level arrival predictions only when one concrete trip has valid predictions at both the boarding and alighting stops. Otherwise that leg is labeled estimated.
- A realtime transfer requires complete predictions for both trips. Catch slack equals the second departure minus the first arrival, transfer walk, and a one-minute boarding buffer. Incomplete evidence falls back to an estimated headway buffer.
- If the browser cannot initialize its local planning worker, the page shows an error and Retry action. It never substitutes the fixed QA journey for a visitor's request.
- The browser reloads `latest.json` every five minutes but loads the static GTFS network only once per visit.
- Network and Journey both use the latest credential-free snapshot. Journey calculations happen locally and have no hosted-server cold start.
- SAFETY-FIRST compares nearby incident reports from the past 365 days. It is a relative historical-data preference, not a crime forecast, a safe/unsafe label, or a personal-safety guarantee. Missing evidence never becomes a zero-risk score.
- Destination parking compares recent paid sessions with the nearby on-street meter inventory. A paid session does not prove a vehicle is present, and this feature never claims to show occupancy or available spaces.

- 只有同一个具体班次在上下车站都有有效预测时，该路段才标为班次级实时预测；否则会明确标成估算。
- 实时换乘必须同时有两趟具体班次的完整预测。换乘余量等于第二趟预计离开时间，减去第一趟预计到达、换乘步行和一分钟上车余量；证据不完整时才使用班距估算。
- 如果浏览器无法启动本地规划线程，网页只显示错误与“重试”，绝不会拿固定 QA 行程冒充用户查询结果。
- 浏览器每五分钟重新读取 `latest.json`，静态 GTFS 路网每次访问只载入一次。
- Network 与 Journey 都读取最新的无密钥快照；Journey 在浏览器本地计算，不存在托管服务器休眠后的冷启动。
- SAFETY-FIRST 比较过去 365 天附近的历史报案数量。它只是一种相对历史数据偏好，不是犯罪预测、地点安全标签或个人安全保证；缺少数据时也不会被当成“零风险”。
- 目的地停车功能会把近期停车付费记录与附近路边收费车位清单放在一起比较。付费记录不代表车辆仍在现场，页面也绝不会把它写成占用率或实时空位。

## Network evidence contract / 路网证据契约

The Network page separates three different concepts: all routes in static GTFS, routes/directions represented in the current snapshot, and vehicle positions actually available on the map. The overview shows coverage and a direction-level health distribution instead of labeling the whole network from its worst route. Alerts and road events without a route match stay visible as clearly labeled network context.

Network 页面把三个概念分开：静态 GTFS 中的全部线路、当前快照中有证据的线路／方向，以及地图中实际存在的车辆位置。全网概览显示覆盖率和方向级状态分布，不再用最差一条线路代表整个路网。没有 route match 的提示与道路事件仍会保留，但会明确标成全网背景。

Until `SF_TRANSIT_511_API_KEY` is configured, the six checked-in `demo-*` records are labeled as a retained sample and are not presented as the current Muni fleet.

在配置 `SF_TRANSIT_511_API_KEY` 之前，仓库中的 6 条 `demo-*` 记录会明确标为保留样本，不会冒充当前 Muni 车队。

The default 511 limit is 60 requests per hour. The workflow refreshes vehicle positions and trip updates every 5 minutes, while alerts and road events refresh every 15 minutes. This plans 44 requests per hour and keeps a 16-request margin for safe operation.

511 默认限制为每小时 60 次。工作流每 5 分钟刷新车辆位置与班次预测，每 15 分钟刷新服务提示和道路事件；预计每小时 44 次，保留 16 次安全余量。

The token belongs only in the repository's encrypted Actions secret named `SF_TRANSIT_511_API_KEY`. It must never be placed in this public repository, the website, browser storage, or a Notebook output.

Token 只能保存在仓库名为 `SF_TRANSIT_511_API_KEY` 的 Actions 加密 Secret 中，禁止写入公开仓库、网页、浏览器存储或 Notebook 输出。
