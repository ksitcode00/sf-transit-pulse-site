/*
 * Feature 25B · Non-blocking planner worker / 不阻塞页面的规划线程
 *
 * 中文：路线组合和安全区域比较可能需要较多计算，因此放在独立线程。主页面仍可
 * 滚动、切换语言和操作地图。所有输入都是已经公开且不含密钥的缓存数据。
 * English: Candidate generation runs off the main thread so maps and controls stay
 * responsive. Inputs are public, credential-free cache objects only.
 */

import {BrowserPlannerEngine} from "./planner-engine.mjs?v=25b1";

let engine = null;

self.addEventListener("message", event => {
  const {id, type, payload = {}} = event.data || {};
  try {
    if (type === "initialize") {
      engine = new BrowserPlannerEngine(payload.network, payload.realtime);
      self.postMessage({id, ok: true, result: {ready: true, ...engine.stats}});
      return;
    }
    if (type === "plan") {
      if (!engine) throw new Error("The browser planner is still loading.");
      const result = engine.plan(payload.origin_stop_id, payload.destination_stop_id, payload.mode);
      self.postMessage({id, ok: true, result});
      return;
    }
    throw new Error(`Unsupported worker request: ${type}`);
  } catch (error) {
    self.postMessage({id, ok: false, error: error?.message || "Browser planning failed."});
  }
});
