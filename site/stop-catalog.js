(function stopCatalogModule(root) {
  "use strict";

  const BROWSE_BATCH_SIZE = 100;

  function searchStops(stops, query, limit = 12) {
    const folded = String(query || "").trim().toLocaleLowerCase();
    if (folded.length < 2) return [];
    return (Array.isArray(stops) ? stops : [])
      .filter(stop => String(stop.name || "").toLocaleLowerCase().includes(folded)
        || String(stop.stop_id || "").includes(folded))
      .slice(0, Math.max(0, Number(limit) || 0));
  }

  function nextBrowseBatch(stops, offset = 0, batchSize = BROWSE_BATCH_SIZE) {
    const rows = Array.isArray(stops) ? stops : [];
    const start = Math.max(0, Math.min(rows.length, Number(offset) || 0));
    const size = Math.max(1, Number(batchSize) || BROWSE_BATCH_SIZE);
    const nextOffset = Math.min(rows.length, start + size);
    return {
      rows: rows.slice(start, nextOffset),
      nextOffset,
      total: rows.length,
      done: nextOffset >= rows.length
    };
  }

  const api = {BROWSE_BATCH_SIZE, searchStops, nextBrowseBatch};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SFStopCatalog = api;
}(typeof window !== "undefined" ? window : globalThis));
