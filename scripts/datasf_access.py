"""Choose the documented DataSF read API before making any network request."""
from __future__ import annotations

import re


def query_request(dataset: str, query: str, page: int, size: int, token: str) -> tuple[str, dict]:
    # 中文：v3 现在要求身份或 App Token；未配置可选 Token 时使用官方公开 v2 接口。
    # 不在收到 401/403 后换地址重试；已配置但无效的凭证仍由调用方明确报错。
    # English: Use public v2 for anonymous reads, v3 for identified reads. No auth-error fallback.
    if token:
        return (f"https://data.sf.gov/api/v3/views/{dataset}/query.json",
                {"query":query,"pageNumber":page,"pageSize":size})
    # 中文：v2 的 $query 不能再混用独立 $limit/$offset，分页必须写入 SoQL。
    # 显式总 LIMIT 仍须遵守，不能每页都重复拿第一批，或超出原查询的总行数。
    # English: Embed pagination in SoQL; preserve total LIMIT instead of repeating the first page.
    sql = query.strip().rstrip(';').rstrip()
    offset = (page - 1) * size
    limit = re.search(r"\s+LIMIT\s+(\d+)\s*$", sql, re.IGNORECASE)
    count = size
    if limit:
        count = min(size, max(0, int(limit.group(1)) - offset))
        sql = sql[:limit.start()].rstrip()
    return (f"https://data.sf.gov/resource/{dataset}.json",
            {"$query":f"{sql} LIMIT {count} OFFSET {offset}"})
