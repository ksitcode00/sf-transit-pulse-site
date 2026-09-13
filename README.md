# SF Transit Pulse — Public Application

[Open the live web interface](https://ksitcode00.github.io/sf-transit-pulse-site/)

This public repository contains only the browser application, credential-free data snapshots, the scheduled refresh worker, and the Scheme A FastAPI planning service. The private analytical Notebook is intentionally excluded.

这个公开仓库只包含网页、无密钥数据快照、自动刷新程序和方案 A 的 FastAPI 行程规划服务。私有分析 Notebook 不在这里。

## Deploy the Scheme A planning API / 部署方案 A 后端

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ksitcode00/sf-transit-pulse-site)

After deployment, verify the service URL in `site/config.js`. The frontend expects `https://sf-transit-planner-api-ksitcode00.onrender.com` unless you change that file.

部署后请确认 `site/config.js` 中的服务网址。默认预期地址是 `https://sf-transit-planner-api-ksitcode00.onrender.com`。

The planner supports stop search, direct and one-transfer candidates, clickable FASTEST/BALANCED/SAFETY_FIRST modes, clickable alternatives, a journey map, a timeline, transfer catchability, reliability details, and explicit evidence limitations.

规划器支持站点搜索、直达与一次换乘、三种可点击模式、可点击备选方案、Journey 地图、时间线、换乘余量、可靠性明细和明确的证据限制。

## Network evidence contract / 路网证据契约

The Network page separates three different concepts: all routes in static GTFS, routes/directions represented in the current snapshot, and vehicle positions actually available on the map. The overview shows coverage and a direction-level health distribution instead of labeling the whole network from its worst route. Alerts and road events without a route match stay visible as clearly labeled network context.

Network 页面把三个概念分开：静态 GTFS 中的全部线路、当前快照中有证据的线路／方向，以及地图中实际存在的车辆位置。全网概览显示覆盖率和方向级状态分布，不再用最差一条线路代表整个路网。没有 route match 的提示与道路事件仍会保留，但会明确标成全网背景。

Until `SF_TRANSIT_511_API_KEY` is configured, the six checked-in `demo-*` records are labeled as a retained sample and are not presented as the current Muni fleet.

在配置 `SF_TRANSIT_511_API_KEY` 之前，仓库中的 6 条 `demo-*` 记录会明确标为保留样本，不会冒充当前 Muni 车队。

The default 511 limit is 60 requests per hour. The workflow refreshes vehicle positions and trip updates every 5 minutes, while alerts and road events refresh every 15 minutes. This plans 44 requests per hour and keeps a 16-request margin for safe operation.

511 默认限制为每小时 60 次。工作流每 5 分钟刷新车辆位置与班次预测，每 15 分钟刷新服务提示和道路事件；预计每小时 44 次，保留 16 次安全余量。

The token belongs only in the repository's encrypted Actions secret named `SF_TRANSIT_511_API_KEY`. It must never be placed in this public repository, the website, browser storage, or a Notebook output.

Token 只能保存在仓库名为 `SF_TRANSIT_511_API_KEY` 的 Actions 加密 Secret 中，禁止写入公开仓库、网页、浏览器存储或 Notebook 输出。
