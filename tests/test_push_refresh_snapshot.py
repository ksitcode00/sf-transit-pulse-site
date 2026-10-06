"""Exercise live-snapshot publication against a real local Git remote."""

import subprocess
import tempfile
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLISH_SCRIPT = ROOT / "scripts" / "push_refresh_snapshot.sh"


def git(*args: str, cwd: Path) -> None:
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True)


def test_temporary_remote_error_is_retried_with_wait_and_newer_commit_preserved() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        remote = root / "remote.git"
        seed = root / "seed"
        bot = root / "bot"
        ui = root / "ui"
        verification = root / "verification"

        git("init", "--bare", str(remote), cwd=root)
        git("clone", str(remote), str(seed), cwd=root)
        git("config", "user.name", "Test Bot", cwd=seed)
        git("config", "user.email", "test@example.com", cwd=seed)
        (seed / "site" / "data").mkdir(parents=True)
        (seed / "site" / "data" / "live-transit.json").write_text("old snapshot\n")
        (seed / "site" / "index.html").write_text("old UI\n")
        git("add", ".", cwd=seed)
        git("commit", "-m", "initial", cwd=seed)
        git("branch", "-M", "main", cwd=seed)
        git("push", "origin", "main", cwd=seed)

        for checkout in (bot, ui):
            git("clone", "--branch", "main", str(remote), str(checkout), cwd=root)
            git("config", "user.name", "Test Bot", cwd=checkout)
            git("config", "user.email", "test@example.com", cwd=checkout)

        (bot / "site" / "data" / "live-transit.json").write_text("new snapshot\n")
        git("add", "site/data/live-transit.json", cwd=bot)
        git("commit", "-m", "refresh", cwd=bot)
        (ui / "site" / "index.html").write_text("new UI\n")
        git("add", "site/index.html", cwd=ui)
        git("commit", "-m", "UI change", cwd=ui)
        git("push", "origin", "HEAD:main", cwd=ui)

        hook = remote / "hooks" / "pre-receive"
        hook.write_text(
            "#!/bin/sh\n"
            "if [ ! -f ./rejected-once ]; then\n"
            "  touch ./rejected-once\n"
            "  echo 'Internal Server Error' >&2\n"
            "  exit 1\n"
            "fi\n"
        )
        hook.chmod(0o755)

        start = time.monotonic()
        result = subprocess.run(["bash", str(PUBLISH_SCRIPT)], cwd=bot, capture_output=True, text=True)
        elapsed = time.monotonic() - start
        assert result.returncode == 0, result.stdout + result.stderr
        assert elapsed >= 4.5, "A temporary GitHub failure must not be retried immediately."

        git("clone", "--branch", "main", str(remote), str(verification), cwd=root)
        assert (verification / "site" / "data" / "live-transit.json").read_text() == "new snapshot\n"
        assert (verification / "site" / "index.html").read_text() == "new UI\n"
