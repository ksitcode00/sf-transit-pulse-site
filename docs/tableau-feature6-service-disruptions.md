# Feature 6 — Service Disruptions / 服务中断

## What is automated / 自动化内容

The existing 511 Service Alerts request runs about every 15 minutes. Feature 6
reuses that response, so the archive adds **zero additional 511 API requests**.

现有流程大约每 15 分钟请求一次 511 Service Alerts。Feature 6 直接复用同一份
返回结果，因此历史归档**不会增加任何 511 API 请求**。

Each continuing alert updates one existing episode. When an alert disappears,
the episode becomes inactive. If the same alert later returns, a new occurrence
is created. This avoids storing an identical row every 15 minutes while still
preserving recurrence and duration.

同一条持续中的公告只更新原有 episode；公告消失时转为 inactive；以后重新出现时
建立新的 occurrence。这样既不会每 15 分钟重复堆积相同记录，也能保留重复事件和
持续时间。

## Tableau file / Tableau 数据文件

Use:

`site/data/tableau/feature6_service_disruptions.csv`

Public download URL after deployment:

`https://ksitcode00.github.io/sf-transit-pulse-site/data/tableau/feature6_service_disruptions.csv`

| Field / 字段 | Meaning / 含义 |
|---|---|
| `snapshot_time` | Latest collector snapshot that updated this row / 最后更新该行状态的采集时间 |
| `history_id` | Unique episode identifier / 唯一事件段编号 |
| `alert_id` | Original 511 alert ID / 511 原始公告编号 |
| `route_id` | Affected Muni route; blank means network-wide or unspecified / 受影响路线；空值表示全网或未指定 |
| `direction_id` | Direction when 511 supplies one / 511 提供时的方向编号 |
| `title`, `description` | Original public alert text / 原始公告标题与说明 |
| `alert_type` | Transparent keyword category / 可复核的关键词分类 |
| `first_seen` | First time this collector saw the episode / 系统首次发现时间 |
| `last_seen` | Last snapshot where the episode was still present / 最后一次仍看到该事件的时间 |
| `duration_hours` | `last_seen - first_seen` / 已确认持续小时数 |
| `active_flag` | Whether the latest successful alert feed still contains it / 最新成功 feed 是否仍包含该事件 |
| `inactive_detected_at` | First snapshot where the event was absent / 首次确认事件已消失的时间 |
| `occurrence_index` | Reappearance count for the same alert-route-direction / 同一公告、路线、方向的出现次数 |
| `observation_count` | Number of successful snapshots containing it / 成功观察到它的快照数 |
| `route_match_status` | Route-specific or network-wide / 路线级或全网级 |

## Recommended Tableau worksheets / 建议练习的图表

1. **Disruptions by route / 各路线事件数** — count distinct `history_id` by `route_id`.
2. **Alert type mix / 事件类型构成** — stacked bars using `alert_type`.
3. **Duration distribution / 持续时间分布** — median and P90 of `duration_hours`.
4. **Weekly trend / 每周趋势** — week of `first_seen` against distinct episodes.
5. **Recurring disruptions / 重复事件** — filter `occurrence_index > 1`.
6. **Current alerts / 当前事件** — filter `active_flag = True`.

## Honest limitations / 使用限制

- `first_seen` means first seen **after this archive was deployed**, not the
  official start time of an alert.
- `last_seen` is the last positive observation. The actual end occurred between
  `last_seen` and `inactive_detected_at`, normally within one 15-minute interval.
- A blank `direction_id` means 511 did not provide one unique direction. It must
  not be interpreted as both directions with certainty.
- Keyword categories describe the notice text; they are not a severity score.

- `first_seen` 是归档上线后第一次看到该公告的时间，不一定等于官方事件开始时间。
- 实际结束时间位于 `last_seen` 与 `inactive_detected_at` 之间，通常误差不超过一个
  15 分钟刷新周期。
- `direction_id` 为空表示 511 没有提供唯一方向，不能武断解释为两个方向都受影响。
- 关键词分类只描述公告内容，不代表严重程度评分。
