# Feature 8 release check / 功能 8 上线检查

Checked 2026-09-18. This is a scoped release check, not a security certification or a guarantee of future uptime.
检查日期：2026-09-18。这是限定范围的上线检查，不是安全认证，也不保证未来永不故障。

## Data / 数据

- Official source: DataSF `wg3w-h783`. Initial event-date coverage: 2025-09-17–2026-09-16 (365 calendar days).
- 官方来源：DataSF `wg3w-h783`。首次事件日期范围：2025-09-17–2026-09-16，共 365 个日历日。
- 92,548 source offense rows → 68,415 distinct geolocated reports; 3,332 unusable rows excluded and 20,801 repeated/offense rows merged. Not every city report has usable coordinates or falls near a Muni stop.
- 92,548 条来源类别行整理成 68,415 份有可用位置的去重报告；排除 3,332 条不可用行，合并 20,801 条重复／同报告类别行。不是所有全市报告都有可用坐标或靠近 Muni 站点。
- Daily source check, rolling window, anonymous intersection positions, approximate 100/200/300/400 m stop buffers. No extra 511 requests.
- 每天检查来源，滚动更新日期；使用匿名路口位置和站点附近约 100／200／300／400 米范围，不增加 511 请求。
- Unique IDs, source coverage, location/category/match indices, distance bounds and ZIP relationships verified. Public JSON parses and local HTML resource links resolve.
- 已核对唯一编号、日期覆盖、位置／类别／匹配索引、距离边界及 ZIP 关联关系；公开 JSON 可解析，本地 HTML 资源链接有效。

## Application / 应用

- 73 Python tests and 61 Node tests pass locally. One third-party Starlette/AnyIO deprecation warning remains; it is not a test failure.
- 本地 73 项 Python 和 61 项 Node 测试通过。仍有一条 Starlette／AnyIO 第三方弃用提醒，不是测试失败。
- Planner benchmark: 100/100 sample queries returned results. This sample is not proof of every possible origin/destination.
- 规划器基准测试：100／100 个样例查询有结果；这不代表全部起终点组合都已穷尽检查。
- Browser checked: route/stop/month/category/day-night/radius combinations, language switching, loading state, original sample Journey comparison, and 390 px mobile width without horizontal overflow. Browser console showed no warnings/errors during these checks.
- 浏览器已检查：线路／站点／月份／类别／日夜／距离组合、语言切换、加载状态、原有示例行程比较；390 像素手机宽度无横向溢出。这些检查中浏览器控制台无警告或错误。
- Fixed expired filter selections after rolling data updates and grouped map positions at low zoom to keep the mobile map readable without changing counts.
- 修复滚动更新后失效的筛选值；地图缩小时合并点位，让手机地图更清楚，不改变统计数量。
- Fixed old UI tests that pinned obsolete cache versions; CI now includes every `.test.cjs` and `.test.mjs` file, including those previously omitted UI evidence checks.
- 修复旧 UI 测试写死过期缓存版本号的问题；CI 现在包含全部 `.test.cjs` 和 `.test.mjs`，包括之前漏掉的界面证据检查。
- Common credential patterns were scanned in public site files with no matches. This does not replace a complete secrets/security audit. Real geolocation permission was not requested during QA.
- 已在公开网页文件中检查常见凭据格式，没有匹配；这不能代替完整的密钥／安全审计。检查时未请求真实定位权限。

## Boundaries / 边界

- Report totals are not personal risk rates, findings of guilt, or a safe/unsafe ranking. Category/stop counts overlap; incomplete months are marked. Counts are not normalized by population or foot traffic.
- 报告数量不是个人风险率、定罪结果或安全排名。类别与站点数量存在重叠，不完整月份有标记；未按人口或人流归一化。
- Feature 4 remains a research preview until official actual-arrival records match predictions. Feature 6 archives alerts but does not yet have a full historical exploration UI. This release does not claim all eight analytics features are complete.
- 功能 4 在官方实际到站记录与预测配对前仍是研究预览；功能 6 已归档公告，但尚无完整历史探索界面。本次上线不声称八个分析功能全部完成。
- Delayed upstream parking records remain explicitly labeled delayed/outdated; no freshness limit is relaxed to make old data look live.
- 上游停车记录延迟时继续明确显示延迟／过期；不会放宽有效期把旧数据伪装成实时。
- Independent Cloudflare daily timer plus GitHub fallback are configured; source/network/runner delays can still happen. Failed download validation stops publication rather than replacing history with empty data.
- 配置 Cloudflare 独立每日触发与 GitHub 备用触发；来源、网络或执行环境仍可能延迟。下载验证失败会停止发布，不会用空数据覆盖历史。
