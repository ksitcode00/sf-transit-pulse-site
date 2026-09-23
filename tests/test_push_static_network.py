"""Exercise static-network publication against a real local Git remote."""

import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLISH_SCRIPT = ROOT / "scripts" / "push_static_network.sh"


def git(*args: str, cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args], cwd=cwd, text=True, capture_output=True, check=True
    )


class PushStaticNetworkTest(unittest.TestCase):
    def test_concurrent_live_data_commit_is_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            remote = root / "remote.git"
            seed = root / "seed"
            bot = root / "bot"
            live_bot = root / "live-bot"
            verification = root / "verification"

            git("init", "--bare", str(remote), cwd=root)
            git("clone", str(remote), str(seed), cwd=root)
            git("config", "user.name", "Test Bot", cwd=seed)
            git("config", "user.email", "test@example.com", cwd=seed)
            (seed / "site" / "data").mkdir(parents=True)
            (seed / "site" / "data" / "network.json").write_text("old network\n")
            (seed / "site" / "data" / "live-transit.json").write_text("old live\n")
            git("add", ".", cwd=seed)
            git("commit", "-m", "initial snapshots", cwd=seed)
            git("branch", "-M", "main", cwd=seed)
            git("push", "-u", "origin", "main", cwd=seed)

            git("clone", "--branch", "main", str(remote), str(bot), cwd=root)
            git("clone", "--branch", "main", str(remote), str(live_bot), cwd=root)
            for checkout in (bot, live_bot):
                git("config", "user.name", "Test Bot", cwd=checkout)
                git("config", "user.email", "test@example.com", cwd=checkout)

            (bot / "site" / "data" / "network.json").write_text("new network\n")
            git("add", "site/data/network.json", cwd=bot)
            git("commit", "-m", "static refresh", cwd=bot)

            (live_bot / "site" / "data" / "live-transit.json").write_text("new live\n")
            git("add", "site/data/live-transit.json", cwd=live_bot)
            git("commit", "-m", "live refresh", cwd=live_bot)
            git("push", "origin", "HEAD:main", cwd=live_bot)

            result = subprocess.run(
                ["bash", str(PUBLISH_SCRIPT)], cwd=bot, text=True, capture_output=True
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

            git("clone", "--branch", "main", str(remote), str(verification), cwd=root)
            self.assertEqual(
                (verification / "site" / "data" / "network.json").read_text(),
                "new network\n",
            )
            self.assertEqual(
                (verification / "site" / "data" / "live-transit.json").read_text(),
                "new live\n",
            )


if __name__ == "__main__":
    unittest.main()
