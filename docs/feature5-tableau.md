# Feature 5 Tableau data — Construction & Closure Exposure

This package is for spatial exposure analysis. It does **not** establish that a closure caused a Muni delay or a reroute.

## What is generated each day

| File | One row represents | Tableau use |
| --- | --- | --- |
| `feature5_events_current.csv` | One source event on one daily snapshot | Map marks, source/type/status filters, event details |
| `feature5_route_shapes.csv` | One ordered point on one route direction | Route line map |
| `feature5_route_exposure_current.csv` | One spatially matched event × route direction | Exposure counts and route/event comparison |
| `feature5_data_dictionary.csv` | One output-file definition | Import reference |

The GitHub Actions artifact is retained for 90 days. The independent Cloudflare scheduler starts this workflow once daily at 13:19 UTC. You can also run it manually from **Actions → Build Feature 5 Tableau data → Run workflow**.

## Upstream failures / 上游故障处理

The October 20, 2026 failure was a 502 from the 511 WZDx endpoint, not a
Node.js warning or a Tableau calculation error. Source downloads now retry
temporary 408/500/502/503/504 and connection/timeout failures at most three
times total, waiting 5 then 15 seconds. A normal Feature 5 build makes one
511 WZDx call; transient failures can add at most two. DataSF uses the same
bounded retry policy. Authentication errors and 429 quota responses are not
retried. Logs omit request URLs and exception bodies to keep keys private.

2026 年 10 月 20 日的失败来自 511 WZDx 返回 502，不是 Node.js 警告或 Tableau
计算错误。临时 HTTP／连接／超时故障最多请求三次，两次间隔为 5、15 秒。正常只
调用一次 511 WZDx；临时失败最多增加两次，不会无限重试。DataSF 采用相同策略。
认证和 429 配额错误立即停止。日志不打印可能含密钥的请求 URL 或原始异常内容。

Persistent failure still fails visibly and leaves the last valid public JSON
and existing Tableau tables unchanged. An unavailable source is never treated
as an empty event collection, and old data is not stamped as newly observed.
This handles brief upstream interruptions; it cannot make an unavailable 511
service work or guarantee that external services never fail.
Publication reuses the shared safe Git push/backoff script, so a main-branch race
does not force another data download. It never force-pushes.

持续失败仍会明确报错，并保留上一份网页 JSON 与已有 Tableau 表，不把接口不可用
解释为“没有事件”，也不把旧数据的时间改成最新。该机制处理短暂上游中断，不能
保证外部服务永远正常。
发布阶段复用已有 Git 安全重试脚本；分支竞态不需要重抓数据，也不强制推送覆盖代码。

## Sources and evidence labels

| Source | Label | What it means |
| --- | --- | --- |
| 511 SF Bay WZDx | `WORK_ZONE` | Planned or active work zones, closures, and detours |
| SFMTA Temporary Street Closures | `PERMITTED_CLOSURE` | Upcoming/current SFMTA-permitted street closure |
| DataSF Utility Excavation Permits | `EXCAVATION_PERMIT` | Active/approved utility excavation permit; not proof of road closure |

`DIRECT_OVERLAP` means the sampled event geometry is within 80 m of sampled route geometry. `NEARBY_CONTEXT` means 80–250 m away. Treat both as spatial context only.

## Tableau practice sequence

1. Connect `feature5_route_exposure_current.csv`.
2. Join `feature5_events_current.csv` on `event_id`.
3. Filter `evidence_type` to `WORK_ZONE` and `PERMITTED_CLOSURE` for a strict closure view.
4. Count distinct `event_id` by `route_short_name`, `direction_id`, or `event_type`.
5. For a map, use `latitude`/`longitude` in the events table and draw `feature5_route_shapes.csv` as a line using `point_sequence` as Path.

For a later historical view, union daily artifacts and retain `snapshot_date`; deduplicate on `snapshot_date + event_id` before counting. A multi-day event should appear on each day it remains active.
