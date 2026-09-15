(function placeSearchModule(root) {
  "use strict";

  const SEARCH_ENDPOINT = "https://sf-transit-refresh-watchdog.kawaisit14.workers.dev/places";
  const MAX_STOP_DISTANCE_METERS = 1200;

  function nearestStops(stops, location, limit = 3, maximumDistance = MAX_STOP_DISTANCE_METERS) {
    if (!root.SFNearbyStops || !location) return [];
    return (Array.isArray(stops) ? stops : [])
      .map(stop => ({...stop, distance_m: root.SFNearbyStops.haversineMeters(location, stop)}))
      .filter(stop => Number.isFinite(stop.distance_m) && stop.distance_m <= maximumDistance)
      .sort((a, b) => a.distance_m - b.distance_m
        || String(a.name || "").localeCompare(String(b.name || "")))
      .slice(0, Math.max(0, Number(limit) || 0));
  }

  async function searchPlaces(query, {language = "en", fetchImpl = root.fetch, signal} = {}) {
    const normalized = String(query || "").trim();
    if (normalized.length < 3) return [];
    const url = new URL(SEARCH_ENDPOINT);
    url.searchParams.set("q", normalized.slice(0, 80));
    url.searchParams.set("lang", language === "zh" ? "zh" : "en");
    const response = await fetchImpl(url.toString(), {signal, cache: "force-cache"});
    if (!response.ok) throw new Error(`Place search returned HTTP ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload.places) ? payload.places : [];
  }

  const api = {MAX_STOP_DISTANCE_METERS, SEARCH_ENDPOINT, nearestStops, searchPlaces};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SFPlaceSearch = api;
}(typeof window !== "undefined" ? window : globalThis));
