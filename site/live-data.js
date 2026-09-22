(function liveDataModule(root) {
  "use strict";

  const ENDPOINT = "https://sf-transit-refresh-watchdog.kawaisit14.workers.dev/data/";
  const FILES = new Set(["live-transit.json", "alerts-roads.json", "parking-context.json", "safety-context.json"]);

  async function fetchPublicJson(filename, fallbackPath, {fetchImpl = root.fetch, cacheBuster = Date.now()} = {}) {
    if (!FILES.has(filename)) throw new Error("Unsupported public data file");
    try {
      const response = await fetchImpl(`${ENDPOINT}${filename}?t=${cacheBuster}`, {cache: "no-store"});
      if (!response.ok) throw new Error(`Cloudflare returned HTTP ${response.status}`);
      return await response.json();
    } catch (_) {
      // Keep the last Pages publication available if the independent data service fails.
      const response = await fetchImpl(`${fallbackPath}?t=${cacheBuster}`, {cache: "no-store"});
      if (!response.ok) throw new Error(`Snapshot request returned HTTP ${response.status}`);
      return response.json();
    }
  }

  const api = {fetchPublicJson};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SFTransitData = api;
}(typeof window !== "undefined" ? window : globalThis));
