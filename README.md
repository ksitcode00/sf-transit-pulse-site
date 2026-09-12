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
