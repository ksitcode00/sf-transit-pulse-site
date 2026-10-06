#!/usr/bin/env bash
set -euo pipefail

# 中文：GitHub 临时 500 和 main 分支竞态都可能让推送失败。等待后重新同步，绝不强推。
# English: Back off after transient GitHub failures or main-branch races; never force-push.
for attempt in 1 2 3 4 5; do
  if git fetch origin main; then
    if ! git rebase origin/main; then
      git rebase --abort || true
      echo "Snapshot conflicts with a newer main commit; review required." >&2
      exit 1
    fi
    if git push origin HEAD:main; then
      exit 0
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

echo "Could not publish the snapshot after five safe attempts; next scheduled run can recover." >&2
exit 1
