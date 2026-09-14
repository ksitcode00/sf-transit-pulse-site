(function nearbyStopsModule(root) {
  "use strict";

  const ALLOWED_RADII_METERS = Object.freeze([100, 200, 300, 400]);
  const EARTH_RADIUS_METERS = 6371008.8;

  function validCoordinate(value, minimum, maximum) {
    if (value === null || value === undefined || value === "") return false;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= minimum && numeric <= maximum;
  }

  function haversineMeters(origin, destination) {
    if (!origin || !destination
      || !validCoordinate(origin.lat, -90, 90)
      || !validCoordinate(origin.lon, -180, 180)
      || !validCoordinate(destination.lat, -90, 90)
      || !validCoordinate(destination.lon, -180, 180)) {
      return Number.POSITIVE_INFINITY;
    }

    const toRadians = degrees => Number(degrees) * Math.PI / 180;
    const lat1 = toRadians(origin.lat);
    const lat2 = toRadians(destination.lat);
    const deltaLat = lat2 - lat1;
    const deltaLon = toRadians(destination.lon) - toRadians(origin.lon);
    const haversine = Math.sin(deltaLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
  }

  function findNearbyStops(stops, location, radiusMeters) {
    const radius = Number(radiusMeters);
    if (!ALLOWED_RADII_METERS.includes(radius)) return [];

    return (Array.isArray(stops) ? stops : [])
      .map(stop => ({...stop, distance_m: haversineMeters(location, stop)}))
      .filter(stop => Number.isFinite(stop.distance_m) && stop.distance_m <= radius)
      .sort((a, b) => a.distance_m - b.distance_m
        || String(a.name || "").localeCompare(String(b.name || ""))
        || String(a.stop_id || "").localeCompare(String(b.stop_id || "")));
  }

  const api = {ALLOWED_RADII_METERS, haversineMeters, findNearbyStops};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SFNearbyStops = api;
}(typeof window !== "undefined" ? window : globalThis));
