#!/usr/bin/env bash
set -euo pipefail

# The three-minute live snapshot can reach main after this job checked it out.
# Preserve both commits by replaying the static commit on the latest main.
# Never force-push, because that could discard a live snapshot or a UI edit.
for attempt in 1 2 3 4 5; do
  if ! git fetch origin main; then
    echo "Could not fetch main on attempt ${attempt}." >&2
  else
    if ! git rebase origin/main; then
      git rebase --abort || true
      echo "Static network conflicts with a newer main commit; review required." >&2
      exit 1
    fi
    if git push origin HEAD:main; then
      exit 0
    fi
    echo "Main advanced during static publication (attempt ${attempt})." >&2
  fi

  if [ "${attempt}" -lt 5 ]; then
    sleep "$((attempt * 2))"
  fi
done

echo "Could not publish static network after five safe attempts." >&2
exit 1
