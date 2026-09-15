# External refresh watchdog / 外部更新保险

This Cloudflare Worker is the three-minute primary clock for the public transit
snapshot. It does not call 511 and exposes no public trigger endpoint. It skips
dispatch when the snapshot is still fresh or a GitHub refresh is already active;
the five-minute GitHub schedule remains a fallback.

这个 Cloudflare Worker 是公交快照的三分钟主时钟。它不会调用 511，也没有公开触发网址；
快照仍新鲜或 GitHub 已有更新运行时会跳过，GitHub 自己的五分钟计划则保留为备用。

## One-time setup / 一次性设置

1. Create a fine-grained GitHub personal access token limited to this repository.
   Grant **Actions: Read and write** and no broader repository permissions.
2. From this directory, sign in with `npx wrangler login`.
3. Save the token as an encrypted Worker secret with
   `npx wrangler secret put GITHUB_WORKFLOW_TOKEN`.
4. Deploy with `npx wrangler deploy`.

Do not place the token in `wrangler.jsonc`, source code, GitHub Pages, or a commit.
The Free Workers plan allows far more than the 480 timestamp checks used per day.

请不要把 token 写进配置文件、代码、GitHub Pages 或 commit。这个设计每天只使用
480 次 Cloudflare 检查；真正的 511 调用仍受 Python 更新流程的频率控制。
