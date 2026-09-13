# SF Transit Pulse

<div align="center">
  <p><strong>旧金山公交现在怎么样，我该坐哪一条，为什么？</strong><br>
  <sub>What should I take in San Francisco right now, and why?</sub></p>

  [打开实时网站](https://ksitcode00.github.io/sf-transit-pulse-site/) · [Open the live app](https://ksitcode00.github.io/sf-transit-pulse-site/)

  [![Deploy GitHub Pages](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/pages.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/pages.yml)
  [![Verify application contracts](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/ci.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/ci.yml)
  [![Refresh transit snapshot](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-data.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-data.yml)
</div>

SF Transit Pulse 是一个面向普通乘客的 Muni 决策工具。它不仅显示预计到站时间，还会解释车辆是否挤在一起、是否可能出现长时间空档、具体换乘是否赶得上，以及不同路线为什么会被推荐。

SF Transit Pulse is a rider focused Muni decision tool. It goes beyond departure times by explaining vehicle spacing, possible long gaps, transfer timing, and why one route ranks above another.

> 当前版本是独立研究原型，不是 SFMTA 官方服务。实时预测仍会变化，请为重要行程预留时间。
>
> This is an independent research prototype, not an official SFMTA service. Live predictions can change, so leave extra time for important trips.

## 30 秒体验 / Try it in 30 seconds

1. 打开[实时网站](https://ksitcode00.github.io/sf-transit-pulse-site/)，先在 "现在的 Muni" 选择一条线路和方向。
2. 查看地图上的车辆位置、车辆间隔和服务提示。
3. 到 "规划行程" 选择两个 Muni 站点，或点击示例行程。
4. 比较 "最快到达"、"综合推荐" 和 "安全优先"，再查看每条路线的计算依据。

1. Open the [live app](https://ksitcode00.github.io/sf-transit-pulse-site/) and choose a route and direction under "Muni now."
2. Check vehicle locations, spacing, and service notices.
3. Choose two Muni stops under "Plan a trip," or load the sample trip.
4. Compare Fastest, Balanced, and Safety-first, then inspect the evidence behind each result.

## 产品目标 / Product goal

大多数公交应用擅长回答 "下一班车几点来"。SF Transit Pulse 继续追问三个问题：

- 同一条线路的两个方向，现在是否表现不同？
- 最快的路线是否也值得现在选择，还是另一条路线更稳？
- 推荐基于实时班次、估算还是历史背景？用户能否看出区别？

Most transit apps answer "When is the next vehicle?" SF Transit Pulse also asks:

- Are the two directions of the same route behaving differently right now?
- Is the fastest option still the best choice, or is another route steadier?
- Does the recommendation use a concrete live trip, an estimate, or historical context?

The product rule is simple: show only what the available evidence supports, and label the limits next to the result.

## 功能清单 / Feature catalog

下表按用户任务整理当前功能。每一项都说明它解决什么问题，以及乘客会怎样使用。

| 功能 / Feature | 有什么用 / Why it matters | 使用示例 / Example | 当前状态 / Status |
|---|---|---|---|
| 完整 Muni 线路目录<br><sub>Full Muni route catalog</sub> | 不会把网站限制在几条演示线路。用户可以从当前 GTFS 目录选择 68 条线路。<br><sub>The app is not limited to a few demo routes. Riders can choose from 68 routes in the current GTFS catalog.</sub> | 想查看 14R、38、N 或任何其他 Muni 线路时，直接在线路菜单中选择。<br><sub>Select 14R, 38, N, or another Muni route from the route menu.</sub> | 已上线<br><sub>Live</sub> |
| 按方向查看线路<br><sub>Route and direction filter</sub> | 同一路线的两个方向可能完全不同。系统按 `route_id + direction_id` 分开车辆、班距和状态。<br><sub>Two directions can behave differently. Vehicles, spacing, and health are separated by route and direction.</sub> | 38R 西行出现长空档时，不会把东行自动标成同样不稳定。<br><sub>A long gap on one 38R direction does not automatically label the other direction unstable.</sub> | 已上线<br><sub>Live</sub> |
| 实时车辆地图<br><sub>Live vehicle map</sub> | 让用户看见车辆实际回报的位置，而不是只看一串时间。无法匹配到乘客线路的车辆会单独计数，不会猜测归属。<br><sub>Shows reported vehicle positions. Unmatched vehicles are counted separately instead of being assigned to a route by guesswork.</sub> | 出门前查看下一辆 5 路车大概在走廊的哪个位置。<br><sub>Check where the next Route 5 vehicle appears along the corridor before leaving.</sub> | 已上线<br><sub>Live</sub> |
| 线路方向健康状态<br><sub>Direction level service health</sub> | 把大量原始到站预测整理成易懂的状态，例如车辆间隔较稳定、部分等待可能较久或等待时间变化较大。<br><sub>Turns raw predictions into plain language states such as steady spacing, possible longer waits, or highly variable waits.</sub> | 用户发现 14R 某个方向处于 "等待时间可能变化较大"，可以先比较 14 或地铁方案。<br><sub>If one 14R direction shows highly variable waits, compare Route 14 or a rail option.</sub> | 已上线<br><sub>Live</sub> |
| 车辆间隔、扎堆和长空档<br><sub>Headways, bunching, and service gaps</sub> | 仅看平均到站时间会隐藏车辆扎堆。这里直接统计车辆通常相隔多久、哪里挤在一起、哪里间隔过长。<br><sub>An average arrival time can hide bunching. The app reports typical spacing, close vehicle groups, and long gaps.</sub> | 两辆车一起到、下一辆却很久才来时，页面会把扎堆和后续空档分别显示。<br><sub>When two vehicles arrive together followed by a long wait, both the bunching and gap appear in the evidence.</sub> | 已上线<br><sub>Live</sub> |
| 当前回报速度<br><sub>Current reported speed</sub> | 帮助判断一条线路现在是否明显低于同类交通方式的透明参考值。参考值不是虚构的历史平均速度。<br><sub>Shows whether reported movement is below a documented vehicle type reference. The reference is not presented as a historical average.</sub> | 一段公交走廊的当前中位速度明显偏低时，用户会看到减速提示。<br><sub>A rider sees a slowdown note when the corridor's median reported speed is well below its comparison level.</sub> | 已上线<br><sub>Live when speed reports exist</sub> |
| Muni 服务通知<br><sub>Muni service notices</sub> | 把站点临时移动、电梯故障和服务调整放在线路信息旁边，减少出发后才发现变化的情况。<br><sub>Places stop moves, elevator outages, and service changes beside route information.</sub> | 某个站点临时搬到下一条街时，用户可以在前往原站点前看到通知。<br><sub>See that a stop has moved before walking to its usual location.</sub> | 已上线<br><sub>Live</sub> |
| 道路施工与线路背景<br><sub>Street work and route context</sub> | 把道路事件和公交运行放在一起看，但不会把位置接近写成已证明的延误原因。<br><sub>Shows road events beside transit movement without claiming that proximity proves causation.</sub> | Market Street 附近有施工且某段车辆变慢时，页面写成 "可能有关"，不会直接说施工造成延误。<br><sub>If work near Market Street overlaps a slower leg, the app labels it as possible context, not a proven cause.</sub> | 研究功能<br><sub>Research beta</sub> |
| 站点搜索<br><sub>Stop search</sub> | 用户输入站名即可选择起点和终点，并能看到该站经过的线路。搜索直接读取公开 GTFS，不依赖后端服务。<br><sub>Lets riders find origin and destination stops and see routes serving each stop. Search uses the public GTFS catalog in the browser.</sub> | 输入 "4th St & Market"，再从列表选择正确的站点编号。<br><sub>Enter "4th St & Market" and choose the matching stop from the list.</sub> | 已上线<br><sub>Live</sub> |
| 直达和一次换乘路线<br><sub>Direct and one transfer planning</sub> | 在步行范围内寻找可上车与下车的站点，并排除反方向、先下后上和距离过远的假换乘。<br><sub>Searches nearby boarding and alighting stops while rejecting wrong direction trips and distant transfer pairs.</sub> | 从 SoMa 去 Fillmore 时，同时比较直达路线和只换乘一次的可行路线。<br><sub>Compare direct trips and one transfer options from SoMa to Fillmore.</sub> | 已上线<br><sub>Public beta</sub> |
| 具体班次的实时上下车时间<br><sub>Trip level live boarding and arrival</sub> | 只有同一具体班次在上下车站都有有效预测时，才显示为实时行程。否则明确写成估算。<br><sub>A leg is labeled live only when one concrete trip has valid predictions at both boarding and alighting stops. Otherwise it is labeled estimated.</sub> | 页面可以显示预计 8:12 上车、8:27 下车和对应班次编号，而不是只给一个模糊的 15 分钟。<br><sub>Show a predicted 8:12 boarding, 8:27 arrival, and trip ID instead of only a vague 15 minute duration.</sub> | 已上线<br><sub>Live when complete predictions exist</sub> |
| 换乘余量<br><sub>Transfer catch slack</sub> | 用第一趟到达、换乘步行、1 分钟上车余量和第二趟离开时间，计算实际还剩几分钟。<br><sub>Uses the first arrival, transfer walk, a one minute boarding allowance, and the second departure to calculate remaining time.</sub> | 第一趟预计 8:20 到，走到第二个站要 2 分钟，第二趟 8:25 开，页面会显示约 2 分钟换乘余量并标成较紧。<br><sub>If Trip 1 arrives at 8:20, the walk takes 2 minutes, and Trip 2 leaves at 8:25, the app shows about 2 minutes of slack and labels it tight.</sub> | 已上线<br><sub>Live or clearly estimated</sub> |
| 最快到达<br><sub>Fastest</sub> | 按当前候选路线中最低的门到门预计时间排序，不把偏好分数伪装成 ETA。<br><sub>Ranks the candidate with the lowest door to door estimate. Preference scores never replace the ETA.</sub> | 快要迟到时，选择最快到达，优先查看预计时间最短的路线。<br><sub>Choose Fastest when arrival time matters more than extra walking or variable service.</sub> | 已上线<br><sub>Live</sub> |
| 综合推荐<br><sub>Balanced</sub> | 同时考虑 ETA、步行、换乘次数和当前车辆间隔稳定性。<br><sub>Considers ETA, walking, transfer count, and current spacing reliability.</sub> | 一条路线快 2 分钟但要多走路、还要换乘时，综合推荐可能选择稍慢但更直接的方案。<br><sub>A slightly slower direct trip may rank above an option with more walking and a transfer.</sub> | 已上线，默认模式<br><sub>Live, default mode</sub> |
| 安全优先<br><sub>Safety-first</sub> | 比较候选行程附近过去 365 天的历史事件报告相对值。它是历史背景偏好，不预测个人安全。<br><sub>Compares relative counts of reports near candidate journeys over the past 365 days. It is historical context, not a personal safety forecast.</sub> | 夜间出行时，用户可以比较起点、沿线、换乘和目的地附近的历史报告相对值。<br><sub>For a night trip, compare the relative historical report context near boarding, the route, transfers, and destination.</sub> | 研究功能<br><sub>Research beta</sub> |
| 目的地停车压力<br><sub>Destination parking pressure</sub> | 把附近收费车位清单和近期付费活动合并成相对压力参考。它不等于占用率，也不显示空位数量。<br><sub>Combines nearby meter inventory with recent paid sessions as a relative pressure signal. It is not occupancy or an open space count.</sub> | 到达 Mission 后准备开车接人时，可查看附近付费活动是在增加还是减少。<br><sub>Before driving to Mission for pickup, check whether nearby paid parking activity is rising or falling.</sub> | 研究功能<br><sub>Research beta</sub> |
| 数据新鲜度和失败状态<br><sub>Freshness and failure labels</sub> | 每个主要数据源都显示更新时间。实时数据缺失时，页面不会把旧数据或演示数据冒充当前情况。<br><sub>Shows when each major source was updated. Stale or demo data is not presented as current service.</sub> | 511 暂时没有更新时，用户会看到 "上一次成功获取的数据" 或 "实时信息不足"。<br><sub>If 511 stops updating, the page says that it is showing the last successful update or that live evidence is limited.</sub> | 已上线<br><sub>Live</sub> |
| 中英文界面<br><sub>English and Chinese interface</sub> | 普通用户可以切换语言，关键风险说明不会只保留英文技术词。语言选择会保存在本机。<br><sub>Riders can switch languages without losing important limitations in technical English. The choice is saved locally.</sub> | 点击右上角 "中文" 后，按钮、状态、错误和方法说明一起切换。<br><sub>Select "中文" to switch controls, service states, errors, and method explanations together.</sub> | 已上线<br><sub>Live</sub> |
| 浏览器本地计算<br><sub>On device browser planning</sub> | 用户查询时不需要 Render 或其他付费服务器。计算在 Web Worker 中运行，不会阻塞地图，API Key 也不会进入浏览器。<br><sub>Trip searches need no Render server. A Web Worker keeps the map responsive, and the API key never enters the browser.</sub> | 任何人打开 GitHub Pages 都能规划路线，不需要项目作者保持 Notebook 或电脑在线。<br><sub>Anyone can plan a trip from GitHub Pages while the author's Notebook and computer remain offline.</sub> | 已上线<br><sub>Live</sub> |

## 和同类产品相比 / Market comparison

这张表比较的是各产品官方资料中明确描述的功能，不比较路线准确率。功能会因城市、设备、系统版本和数据合作方而变化。`相关` 表示竞品有接近的功能，但没有找到与本项目完全相同的输出；`未见同等功能` 表示下方引用的官方资料没有描述同等功能，不代表该产品在所有地区都绝对没有。

This matrix compares features described in official product material, not routing accuracy. Availability varies by city, device, operating system, and data partner. "Related" means the product has a nearby capability but not the same output. "No equivalent found" means the cited official material does not document an equivalent, not that every regional version lacks it.

资料核对日期 / Sources checked: 2026-09-14.

| 用户能力 / Rider capability | SF Transit Pulse | Google Maps | Apple Maps | Transit | Citymapper |
|---|---|---|---|---|---|
| 公交路线规划<br><sub>Transit trip planning</sub> | 有，Muni 直达与一次换乘<br><sub>Yes, Muni direct and one transfer</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> |
| 实时到站信息<br><sub>Live departures</sub> | 有，并区分实时与估算<br><sub>Yes, with live versus estimated labels</sub> | 有，部分站点<br><sub>Yes, at some stations</sub> | 有，视地区支持<br><sub>Yes, where supported</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> |
| 地图上的实时车辆<br><sub>Live vehicles on map</sub> | 有，未归属车辆会排除<br><sub>Yes, unmatched vehicles are excluded</sub> | 相关，官方页面重点说明实时出发<br><sub>Related, official page focuses on live departures</sub> | 有，视地区支持<br><sub>Yes, where supported</sub> | 有，包含乘客众包补充<br><sub>Yes, including rider crowdsourcing</sub> | 有公交位置功能<br><sub>Yes, bus location features</sub> |
| 按线路方向诊断状态<br><sub>Direction specific health</sub> | 有，分别判断两个方向<br><sub>Yes, directions are evaluated separately</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> |
| 车辆扎堆和长空档<br><sub>Bunching and long gap evidence</sub> | 有，显示数量和班距<br><sub>Yes, counts and spacing are shown</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 相关，提供实时和乘客回报<br><sub>Related live and rider reports</sub> | 相关，提供公交位置与交通预测<br><sub>Related bus location and traffic prediction</sub> |
| 具体换乘余量<br><sub>Exact transfer catch slack</sub> | 有，显示分钟数和计算依据<br><sub>Yes, minutes and calculation basis</sub> | 相关，提供连接信息<br><sub>Related connection information</sub> | 相关，提供连接信息<br><sub>Related connection information</sub> | 相关，会提示很紧的换乘<br><sub>Related tight transfer warnings</sub> | 未见同等分钟数<br><sub>No equivalent minute value found</sub> |
| 最快路线<br><sub>Fastest route</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> |
| 时间、步行、换乘与稳定性综合排序<br><sub>Time, walking, transfer, and reliability ranking</sub> | 有，公开说明评分组成<br><sub>Yes, with a documented scoring basis</sub> | 相关，支持交通方式和无障碍偏好<br><sub>Related mode and accessibility preferences</sub> | 相关，支持交通方式偏好<br><sub>Related transit preferences</sub> | 相关，会标出长步行和紧换乘<br><sub>Related long walk and tight transfer cues</sub> | 相关，支持 Walk Less 与 Simple 路线<br><sub>Related Walk Less and Simple routes</sub> |
| 历史事件背景参与路线排序<br><sub>Historical incident context in ranking</sub> | 有，研究功能且明确限制<br><sub>Yes, research beta with explicit limits</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 相关，步行可选择 Main Roads，但依据不同<br><sub>Related Main Roads walking option, different evidence</sub> |
| 道路事件与公交减速交叉说明<br><sub>Road event and transit slowdown context</sub> | 有，但不声称因果关系<br><sub>Yes, without claiming causation</sub> | 未见同等解释<br><sub>No equivalent explanation found</sub> | 相关，显示交通中断和道路事件<br><sub>Related outages and road incidents</sub> | 相关，显示服务提示<br><sub>Related service alerts</sub> | 相关，处理交通与改道<br><sub>Related traffic and diversion features</sub> |
| 目的地付费停车压力<br><sub>Paid parking pressure near destination</sub> | 有，研究功能<br><sub>Yes, research beta</sub> | 未见同等压力指标<br><sub>No equivalent pressure metric found</sub> | 未见同等压力指标<br><sub>No equivalent pressure metric found</sub> | 未见同等功能<br><sub>No equivalent found</sub> | 未见同等功能<br><sub>No equivalent found</sub> |
| 数据依据、更新时间和限制说明<br><sub>Evidence, freshness, and limits</sub> | 每条结果旁显示<br><sub>Shown beside results</sub> | 相关，区分实时与时刻表<br><sub>Related live versus scheduled times</sub> | 相关，显示实时和中断<br><sub>Related live times and outages</sub> | 相关，区分实时来源并加入众包<br><sub>Related source distinctions and crowdsourcing</sub> | 相关，显示实时预测与路线类型<br><sub>Related live predictions and route types</sub> |
| 逐步导航与到站提醒<br><sub>Step by step navigation and alerts</sub> | 当前没有，列入路线图<br><sub>Not in the current beta</sub> | 有<br><sub>Yes</sub> | 有接近站点提醒<br><sub>Yes, approaching stop alerts</sub> | 有 GO 导航和提醒<br><sub>Yes, GO navigation and alerts</sub> | 有 GO、语音和锁屏导航<br><sub>Yes, GO, voice, and lock screen navigation</sub> |
| 未来出发或到达时间<br><sub>Future leave or arrive time</sub> | 当前没有，列入路线图<br><sub>Not in the current beta</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有<br><sub>Yes</sub> | 有相关功能<br><sub>Related feature</sub> |
| 无障碍路线<br><sub>Accessible routing</sub> | 当前没有，不能用普通路线冒充<br><sub>Not in the current beta</sub> | 有轮椅无障碍选项<br><sub>Wheelchair accessible option</sub> | 官方资料未确认同等筛选<br><sub>No equivalent filter confirmed in cited material</sub> | 支持，视城市数据<br><sub>Supported where data exists</sub> | 有 Step-free 路线<br><sub>Step-free routes</sub> |
| 多交通方式与共享单车<br><sub>Multimodal and shared mobility</sub> | 当前只做 Muni<br><sub>Muni only</sub> | 有多交通方式<br><sub>Multimodal</sub> | 有多交通方式<br><sub>Multimodal</sub> | 有公交、单车、滑板车和网约车组合<br><sub>Transit, bike, scooter, and ridehail</sub> | 有多交通方式组合<br><sub>Multimodal combinations</sub> |

### 竞品资料 / Competitor sources

- [Google Maps: train and bus departures](https://support.google.com/maps/answer/6142130)
- [Google Maps: accessible transit](https://support.google.com/accessibility/answer/6396990)
- [Apple Maps: transit features](https://www.apple.com/maps/)
- [Apple Support: transit directions](https://support.apple.com/guide/iphone/get-transit-directions-ipha44f57caa/26)
- [Transit: product features](https://transitapp.com/)
- [Transit Support: how GO works](https://help.transitapp.com/article/549-how-to-use-go)
- [Transit: GO crowdsourcing](https://transitapp.com/en/features/go-crowdsourcing)
- [Citymapper: current feature overview](https://citymapper.com/news)
- [Citymapper: Step-free routes](https://citymapper.com/news/2262/step-free-routing)
- [Citymapper: walking route choices](https://citymapper.com/news/2266/turn-by-turn-directions-for-walking)

## 推荐是怎样算出来的 / How recommendations are calculated

每次查询先生成同一组直达和一次换乘候选路线。三种模式只改变排序，不改变任何路线的实际 ETA。

Every query builds one shared set of direct and one transfer candidates. The three modes change ranking only. They never rewrite a route's ETA.

| 模式 / Mode | 主要依据 / Ranking basis | 适合什么时候 / Best used when |
|---|---|---|
| 最快到达 / Fastest | 门到门 ETA<br><sub>Door to door ETA</sub> | 只想尽快到达<br><sub>Arrival time matters most</sub> |
| 综合推荐 / Balanced | ETA + 当前稳定性惩罚 + 步行成本 + 换乘成本<br><sub>ETA + current reliability penalty + walking cost + transfer cost</sub> | 希望时间、步行和换乘更均衡<br><sub>You want a practical balance</sub> |
| 安全优先 / Safety-first | 综合推荐成本 + 沿途历史事件报告相对值<br><sub>Balanced cost + relative historical report context along the trip</sub> | 想把历史背景作为额外参考，同时理解它不是安全预测<br><sub>You want historical context as one input, not a safety prediction</sub> |

## 数据真实性约定 / Evidence contract

- 只有具体班次在上下车站都有有效预测时，该段才标为实时。否则页面写明 "估算"。
- 实时换乘需要两趟具体班次的完整预测。数据不全时，换乘余量会退回班距估算。
- 没有实时信息不代表线路停运。
- 道路事件和减速同时出现，只能作为相互印证的背景，不能证明因果关系。
- 历史事件记录不能预测犯罪、给地点贴上安全或不安全标签，也不能保证个人安全。
- 停车付费记录不证明车辆仍在现场，停车压力也不是占用率或空位数量。
- 偏好分数只用于排序，不会显示成 ETA。

- A leg is live only when one concrete trip has valid predictions at both stops. Otherwise it is labeled estimated.
- A live transfer needs complete predictions for both trips. Incomplete evidence falls back to a headway estimate.
- Missing live information does not mean a route has stopped running.
- A nearby road event and a slowdown are context, not proof that one caused the other.
- Historical reports do not predict crime, label a place safe or unsafe, or guarantee personal safety.
- Paid parking sessions do not prove a vehicle is present. Parking pressure is not occupancy or open space availability.
- Preference costs rank routes. They are never shown as ETA.

## 无服务器架构 / Serverless architecture

```text
511 SF Bay + DataSF + SFMTA public data
                    |
                    | GitHub Actions
                    | API key stays in an encrypted repository Secret
                    v
        Credential-free JSON snapshots
                    |
                    | GitHub Pages CDN
                    v
            Visitor's web browser
                    |
                    | Web Worker
                    v
      Direct and one transfer route calculation
```

核心车辆位置和班次预测计划每 5 分钟更新；服务通知与道路背景每 15 分钟更新。这个安排预计每小时使用 44 次 511 请求，在默认每小时 60 次限制内保留 16 次余量。GitHub Actions 的定时执行可能延迟，因此页面显示实际更新时间，而不是承诺严格的秒级刷新。

Core vehicle and trip predictions are scheduled every five minutes. Service and road context refresh every 15 minutes. The plan uses 44 of the default 60 hourly 511 requests, leaving a 16 request margin. GitHub Actions schedules can run late, so the product shows the actual update time instead of promising second level freshness.

用户查询不会调用 511，也不需要 Render。`SF_TRANSIT_511_API_KEY` 只保存在 GitHub Actions Secret 中，不能写入代码、浏览器存储、Notebook 输出或公开数据文件。

User searches do not call 511 and do not need Render. `SF_TRANSIT_511_API_KEY` belongs only in the encrypted GitHub Actions Secret. It must not appear in code, browser storage, Notebook output, or public data files.

## 项目结构 / Repository guide

```text
site/
  index.html             Product page and accessible page structure
  styles.css             Responsive visual system
  app.js                 UI state, maps, search, and bilingual copy
  planner-engine.mjs     Browser route engine and ranking rules
  planner-worker.js      Background thread boundary
  data/                  Public GTFS and realtime snapshots, no API key

scripts/
  refresh_data.py        Scheduled data collection and snapshot building

backend/
  planner.py             Python reference implementation for parity tests
  main.py                Legacy API boundary, not used by the live website

tests/
  browser-planner.test.mjs  Scheme B browser contracts
  test_planner.py           Python reference contracts

.github/workflows/
  pages.yml              GitHub Pages deployment
  refresh-data.yml       Scheduled data refresh
  ci.yml                 JavaScript, Python, and data checks
```

### 本地预览 / Local preview

```bash
python3 -m http.server 8765 --directory site
```

Open `http://127.0.0.1:8765`. Do not open `index.html` directly because browser workers need an HTTP origin.

### 测试 / Tests

```bash
node --test tests/browser-planner.test.mjs
python3 -m pytest -q tests
```

CI also checks JavaScript syntax and validates every public JSON snapshot before deployment.

## 当前范围和下一步 / Current scope and roadmap

| 已经可以使用 / Available now | 下一阶段 / Next |
|---|---|
| Muni 全线路与方向查看<br><sub>All Muni routes and directions</sub> | 地址、地标和当前位置搜索<br><sub>Address, place, and current location search</sub> |
| 直达和一次换乘<br><sub>Direct and one transfer planning</sub> | 多次换乘和更完整的步行路网<br><sub>Multiple transfers and a fuller walking graph</sub> |
| Fastest、Balanced、Safety-first | 无障碍路线，只有数据完整时才开放<br><sub>Accessible routes only when evidence is complete</sub> |
| 实时班次与换乘余量<br><sub>Live trips and transfer slack</sub> | 未来出发与到达时间<br><sub>Future leave and arrive time</sub> |
| 线路、道路、安全和停车背景<br><sub>Transit, road, safety, and parking context</sub> | 收藏线路、提醒和逐步导航<br><sub>Favorites, alerts, and step by step guidance</sub> |
| 中英文网页与浏览器本地计算<br><sub>Bilingual web app and browser planning</sub> | 用户测试、性能监测和手机端无障碍验收<br><sub>User testing, performance measurement, and mobile accessibility QA</sub> |

## 数据来源 / Data sources

- [511 SF Bay Open Data](https://511.org/open-data/transit): static GTFS, GTFS Realtime vehicle positions, trip updates, and alerts
- [DataSF](https://datasf.org/): San Francisco public safety and parking datasets used for research context
- [SFMTA](https://www.sfmta.com/): Muni and parking program context
- [Caltrans road information](https://quickmap.dot.ca.gov/): road event context where available in the public snapshot
- [OpenStreetMap](https://www.openstreetmap.org/): map tiles and attribution

## 版本 / Version

Current public release: `v1.0 · Browser Planner Beta`

The private analytical Notebook is intentionally not published in this repository. This repository contains only the deployable application, credential-free snapshots, refresh workflow, reference planner code, and tests.

私有分析 Notebook 不在这个仓库中。仓库只包含可部署网页、无密钥数据快照、自动刷新流程、规划器参考代码和测试。
