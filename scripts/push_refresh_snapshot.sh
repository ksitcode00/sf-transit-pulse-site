#!/usr/bin/env bash
set -euo pipefail
push_log="$(mktemp)"
trap 'rm -f "${push_log}"' EXIT
server_error=false

# 中文：GitHub 临时 500 和 main 分支竞态都可能让推送失败。等待后重新同步，绝不强推。
# English: Back off after transient GitHub failures or main-branch races; never force-push.
for attempt in 1 2 3 4 5; do
  if git fetch origin main; then
    if ! git rebase origin/main; then
      git rebase --abort || true
      echo "Snapshot conflicts with a newer main commit; review required." >&2
      exit 1
    fi
    if git push origin HEAD:main 2>"${push_log}"; then
      cat "${push_log}" >&2
      exit 0
    fi
    push_error="$(<"${push_log}")"
    printf '%s\n' "${push_error}" >&2
    if [[ "${push_error}" == *"Internal Server Error"* ]]; then
      server_error=true
    fi
    echo "GitHub rejected snapshot push on attempt ${attempt}; retrying safely." >&2
  else
    echo "Could not fetch main on attempt ${attempt}; retrying safely." >&2
  fi

  if [ "${attempt}" -lt 5 ]; then
    case "${attempt}" in
      1) delay=5 ;;
      2) delay=10 ;;
      3) delay=20 ;;
      4) delay=30 ;;
    esac
    sleep "${delay}"
  fi
done

# 中文：Git 推送服务持续报 500 时，用官方 REST API 发布同一批数据；不增加 511 请求。
# English: Use REST after persistent Git server errors, reusing the same snapshot and quota spend.
if [ "${server_error}" = true ] && [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
  echo "Git transport remained unavailable; trying safe REST publication." >&2
  python "$(dirname "${BASH_SOURCE[0]}")/publish_refresh_via_api.py"
  exit 0
fi

echo "Could not publish the snapshot after five safe attempts; next scheduled run can recover." >&2
exit 1
