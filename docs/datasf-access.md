# DataSF access compatibility / DataSF 接口兼容

## October 22, 2026 failure / 本次原因

Feature 5 failed with `DataSF 8x25-yybr: HTTP 403`, before calling 511.
The official v3 service now responds to anonymous requests with
`authentication_required`: a user identity or application token is required.
The optional `SF_TRANSIT_DATASF_APP_TOKEN` secret was not configured. This is
different from the October 20 WZDx 502. Retrying an authentication failure does
not supply the missing credential.

功能 5 在调用 511 之前就收到 DataSF 403。v3 接口明确要求用户身份或 App Token，
而项目没有配置可选的 DataSF Token。这不同于 10 月 20 日的 WZDx 502；重复请求
不会补出缺失的身份。

## Shared request selection / 统一选择规则

`scripts/datasf_access.py` chooses the endpoint **before** any request:

- Without an App Token, use the documented public `/resource/{dataset}.json`
  endpoint for the same published dataset.
- With a token, retain the identified v3 endpoint and send the token only in
  `X-App-Token`, never in a URL or public output.
- Do not switch endpoints after an authentication error. An invalid configured
  token, a private dataset or quota failure still raises an error.

共享函数在请求前选择接口：无 Token 读取同一公开数据集的官方公开接口；有 Token
使用 v3，并且仅通过请求头发送。不会在认证失败后更换接口试探权限；无效凭证、
私有数据集或配额错误仍须报错。

Construction, historical traffic crashes, historical incidents, parking and the
live pipeline's historical context use the same selector. Existing source
validation, retry limits and last-valid-release behavior remain in place.

施工、交通事故、历史事件、停车与实时管道的历史背景共用该规则；原有验证、有限
重试与保留旧数据机制不变。仅修复数据读取，不改变分析方法。

## Pagination / 分页

The public endpoint rejects mixing `$query` with separate `$limit`/`$offset`
parameters. Pagination is embedded in SoQL instead. Preserve the query's total
LIMIT: for `LIMIT 3` and page size 2, read `LIMIT 2 OFFSET 0`, then
`LIMIT 1 OFFSET 2`. Keep existing ordering and do not repeat page one. The
identified v3 path retains its native page parameters.

公开接口不能混用 `$query` 与独立 `$limit`／`$offset`。分页写入 SoQL，并遵守原
查询总行数；例如总计 3 行、每页 2 行，第二页只取 1 行。保留排序，不重复第一页。
有身份的 v3 路径继续使用原生页码参数。

This change adds no 511 calls. Public reads still share DataSF's anonymous
rate limits. If the public API becomes unavailable, preserve existing data and
surface the failure; do not label a failed read as a fresh empty dataset.

本次兼容修改不增加 511 请求。公开读取仍受 DataSF 匿名限流约束；若该接口不可用，
保留旧数据并明确报错，不能把失败标成最新的空数据。

Official references / 官方说明:
[v3 queries](https://dev.socrata.com/docs/queries/),
[application tokens](https://dev.socrata.com/docs/app-tokens.html),
[SoQL query clauses](https://dev.socrata.com/docs/queries/query.html).
