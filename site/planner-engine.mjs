/*
 * Feature 25B · Browser journey engine / 浏览器行程规划引擎
 *
 * 中文：方案 A 曾把行程计算放在 Render 的 Python 服务中，因此免费实例休眠、
 * 信用卡验证或服务故障都会让 Journey 页面失效。方案 B 把同一组公开 GTFS 与
 * 实时快照交给访客浏览器计算。API Key 仍只在 GitHub Actions Secret 中使用，
 * 浏览器永远不会收到密钥，也不会直接请求 511。
 *
 * English: Scheme A depended on a hosted Python process, so cold starts, account
 * verification, or an outage could disable Journey planning. Scheme B computes
 * from the same public GTFS and realtime snapshots inside the visitor's browser.
 * The 511 key remains in GitHub Actions and is never shipped to this module.
 */

const WALK_SPEED_M_PER_MIN = 75;
const ACCESS_RADIUS_M = 250;
const TRANSFER_RADIUS_M = 180;
const MAX_ACCESS_STOPS = 10;
const MAX_ALTERNATIVES = 12;
const BOARDING_BUFFER_MIN = 1;
const ENGINE_VERSION = "25B-browser-1.0";
const ROUTE_COLORS = ["#0066cc", "#34a853"];

const HEALTH_SEVERITY = {
  STABLE: 0,
  WATCH: 1,
  LIMITED_REALTIME_DATA: 2,
  NO_DATA: 2,
  UNSTABLE: 3
};

const RELIABILITY_PENALTY_MIN = {
  STABLE: 0,
  WATCH: 3,
  LIMITED_REALTIME_DATA: 4,
  NO_DATA: 5,
  UNSTABLE: 8
};

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const median = values => {
  const ordered = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!ordered.length) return null;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
};

const bisectRight = (ordered, value) => {
  let low = 0;
  let high = ordered.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (value < ordered[middle]) high = middle;
    else low = middle + 1;
  }
  return low;
};

function publicStop(stop) {
  return {stop_id: stop.stop_id, name: stop.name, lat: stop.lat, lon: stop.lon};
}

function haversineM(left, right) {
  const lat1 = Number(left.lat ?? left[0]);
  const lon1 = Number(left.lon ?? left[1]);
  const lat2 = Number(right.lat ?? right[0]);
  const lon2 = Number(right.lon ?? right[1]);
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLambda = (lon2 - lon1) * Math.PI / 180;
  const value = Math.sin(dPhi / 2) ** 2
    + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(value));
}

function pointToPolylineM(point, polyline) {
  if (!polyline.length) return Infinity;
  if (polyline.length === 1) return haversineM(point, polyline[0]);
  const referenceLat = Number(point[0]) * Math.PI / 180;
  const metersPerLonDegree = 111320 * Math.cos(referenceLat);
  const metersPerLatDegree = 110540;
  const local = candidate => [
    (Number(candidate[1]) - Number(point[1])) * metersPerLonDegree,
    (Number(candidate[0]) - Number(point[0])) * metersPerLatDegree
  ];
  let best = Infinity;
  for (let index = 0; index < polyline.length - 1; index += 1) {
    const [leftX, leftY] = local(polyline[index]);
    const [rightX, rightY] = local(polyline[index + 1]);
    const deltaX = rightX - leftX;
    const deltaY = rightY - leftY;
    const denominator = deltaX ** 2 + deltaY ** 2;
    let distance;
    if (denominator === 0) distance = Math.hypot(leftX, leftY);
    else {
      const fraction = Math.max(0, Math.min(1, -(leftX * deltaX + leftY * deltaY) / denominator));
      distance = Math.hypot(leftX + fraction * deltaX, leftY + fraction * deltaY);
    }
    best = Math.min(best, distance);
  }
  return best;
}

function normalizePattern(key, raw) {
  const seen = new Set();
  const stops = [];
  for (const row of raw.stops || []) {
    const stopId = String(row.stop_id || "");
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    if (!stopId || seen.has(stopId) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    seen.add(stopId);
    stops.push({stop_id: stopId, name: String(row.name || "Muni stop"), lat, lon});
  }
  if (stops.length < 2) return null;
  const prefixDistanceM = [0];
  for (let index = 1; index < stops.length; index += 1) {
    prefixDistanceM.push(prefixDistanceM[index - 1] + haversineM(stops[index - 1], stops[index]) * 1.16);
  }
  const shape = (raw.shape || [])
    .map(point => [Number(point?.[0]), Number(point?.[1])])
    .filter(point => point.every(Number.isFinite));
  return {
    key,
    route_id: String(raw.route_id || key.split("|", 1)[0]),
    direction_id: String(raw.direction_id ?? ""),
    direction_label: String(raw.direction_label || "Direction unavailable"),
    headsign: String(raw.headsign || ""),
    shape_id: String(raw.shape_id || key.split("|").at(-1) || ""),
    stops,
    shape,
    stopIndex: new Map(stops.map((stop, index) => [stop.stop_id, index])),
    prefixDistanceM
  };
}

function stableJourneyId(parts) {
  // 中文：轻量确定性散列只用于稳定 UI 选择，不用于安全或加密。
  // English: This small deterministic hash stabilizes UI selection; it is not cryptographic.
  let hash = 2166136261;
  for (const character of parts.join("|")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `journey-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export class BrowserPlannerEngine {
  constructor(network, realtime) {
    if (!network || !realtime) throw new Error("Planner data is incomplete.");
    this.network = network;
    this.realtime = realtime;
    this.routeCatalog = new Map((network.routes || []).map(row => [String(row.route_id), row]));
    const rawPatterns = network.patterns || network.route_directions || {};
    this.patterns = Object.entries(rawPatterns)
      .map(([key, row]) => normalizePattern(String(key), row))
      .filter(Boolean);
    this.patternByKey = new Map(this.patterns.map(pattern => [pattern.key, pattern]));
    this.stops = new Map();
    for (const pattern of this.patterns) {
      for (const stop of pattern.stops) if (!this.stops.has(stop.stop_id)) this.stops.set(stop.stop_id, stop);
    }
    this.health = new Map((realtime.routes || []).map(row => [
      `${String(row.route_id)}|${String(row.direction_id)}`,
      row
    ]));
    this.vehicleSpeeds = this.buildVehicleSpeeds();
    this.predictedTrips = this.buildPredictedTrips();
    this.safetyCells = new Map();
    for (const row of realtime.safety?.cells || []) {
      if (row.lat == null || row.lon == null) continue;
      this.safetyCells.set(this.cellKey(Number(row.lat), Number(row.lon)), Number(row.reported_incidents_365d_cell || 0));
    }
    this.safetyDistribution = (realtime.safety?.cells || [])
      .map(row => Number(row.reported_incidents_365d_nearby || 0))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    this.safetyStopCache = new Map();
    this.parkingCells = [...(realtime.parking?.cells || [])];
    this.parkingPressureDistribution = this.parkingCells
      .map(row => Number(row.paid_session_pressure_ratio || 0))
      .filter(value => value > 0 && Number.isFinite(value))
      .sort((a, b) => a - b);
    this.parkingStopCache = new Map();
  }

  get stats() {
    return {routes: this.routeCatalog.size, patterns: this.patterns.length, stops: this.stops.size};
  }

  buildVehicleSpeeds() {
    const grouped = new Map();
    for (const row of this.realtime.vehicles || []) {
      const speedMps = Number(row.speed_mps);
      if (!Number.isFinite(speedMps) || speedMps < 1) continue;
      const key = `${String(row.route_id)}|${String(row.direction_id)}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(speedMps * 2.23694);
    }
    return new Map([...grouped].map(([key, values]) => [key, Math.max(5, Math.min(18, median(values))) ]));
  }

  buildPredictedTrips() {
    const grouped = new Map();
    for (const raw of this.realtime.trip_predictions || []) {
      const tripId = String(raw.trip_id || "");
      const routeId = String(raw.route_id || "");
      const directionId = String(raw.direction_id ?? "");
      if (!tripId || !routeId) continue;
      const stops = (raw.stops || []).map(row => ({
        stop_id: String(row.stop_id || ""),
        stop_sequence: Number(row.stop_sequence || 0),
        arrival_epoch: row.arrival_time ? Number(row.arrival_time) : null,
        departure_epoch: row.departure_time ? Number(row.departure_time) : null
      })).filter(row => row.stop_id && (Number.isFinite(row.arrival_epoch) || Number.isFinite(row.departure_epoch)))
        .sort((left, right) => left.stop_sequence - right.stop_sequence);
      if (!stops.length) continue;
      const trip = {
        trip_id: tripId,
        route_id: routeId,
        direction_id: directionId,
        shape_id: String(raw.shape_id || ""),
        vehicle_id: String(raw.vehicle_id || ""),
        update_timestamp: raw.update_timestamp ? Number(raw.update_timestamp) : null,
        stops
      };
      const key = `${routeId}|${directionId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(trip);
    }
    for (const trips of grouped.values()) {
      trips.sort((left, right) => {
        const leftTime = left.stops[0].departure_epoch || left.stops[0].arrival_epoch || 0;
        const rightTime = right.stops[0].departure_epoch || right.stops[0].arrival_epoch || 0;
        return leftTime - rightTime;
      });
    }
    return grouped;
  }

  tripForLeg(pattern, boardStopId, alightStopId, readyEpoch) {
    const routeTrips = this.predictedTrips.get(`${pattern.route_id}|${pattern.direction_id}`) || [];
    const exactShape = routeTrips.filter(trip => trip.shape_id === pattern.shape_id);
    const candidates = exactShape.length ? exactShape : routeTrips.filter(trip => !trip.shape_id);
    let best = null;
    for (const trip of candidates) {
      for (let boardIndex = 0; boardIndex < trip.stops.length; boardIndex += 1) {
        const board = trip.stops[boardIndex];
        if (board.stop_id !== boardStopId) continue;
        const boardEpoch = board.departure_epoch || board.arrival_epoch;
        if (!Number.isFinite(boardEpoch) || boardEpoch < readyEpoch) continue;
        for (const alight of trip.stops.slice(boardIndex + 1)) {
          if (alight.stop_id !== alightStopId) continue;
          const alightEpoch = alight.arrival_epoch || alight.departure_epoch;
          if (!Number.isFinite(alightEpoch) || alightEpoch <= boardEpoch) continue;
          const result = {trip, board_epoch: boardEpoch, alight_epoch: alightEpoch};
          if (!best || boardEpoch < best.board_epoch) best = result;
          break;
        }
      }
    }
    return best;
  }

  nearbyStops(anchor) {
    return [...this.stops.values()]
      .map(stop => ({stop, distance_m: haversineM(anchor, stop)}))
      .filter(row => row.distance_m <= ACCESS_RADIUS_M)
      .sort((left, right) => left.distance_m - right.distance_m
        || left.stop.name.localeCompare(right.stop.name)
        || left.stop.stop_id.localeCompare(right.stop.stop_id))
      .slice(0, MAX_ACCESS_STOPS);
  }

  patternAccess(nearby, boarding) {
    const results = new Map();
    for (const pattern of this.patterns) {
      const matches = [];
      for (const {stop, distance_m} of nearby) {
        const index = pattern.stopIndex.get(stop.stop_id);
        if (index == null) continue;
        if (boarding && index >= pattern.stops.length - 1) continue;
        if (!boarding && index <= 0) continue;
        matches.push({stop, index, distance_m});
      }
      if (matches.length) results.set(pattern.key, matches.sort((a, b) => a.distance_m - b.distance_m).slice(0, 3));
    }
    return results;
  }

  comparisonSpeedMph(pattern) {
    const routeType = String(this.routeCatalog.get(pattern.route_id)?.route_type || "3");
    if (["0", "1"].includes(routeType)) return 11.5;
    if (routeType === "5") return 5.5;
    if (pattern.route_id.endsWith("R") || pattern.route_id.endsWith("X")) return 11;
    return 8.5;
  }

  routeSpeedMph(pattern) {
    return this.vehicleSpeeds.get(`${pattern.route_id}|${pattern.direction_id}`) ?? this.comparisonSpeedMph(pattern);
  }

  waitMinutes(pattern) {
    const headway = Number(this.health.get(`${pattern.route_id}|${pattern.direction_id}`)?.median_headway_min);
    return round(Math.max(2, Math.min(15, (Number.isFinite(headway) ? headway : 13) / 2)), 1);
  }

  healthFor(pattern) {
    return String(this.health.get(`${pattern.route_id}|${pattern.direction_id}`)?.health || "NO_DATA");
  }

  distanceBetween(pattern, startIndex, endIndex) {
    return Math.max(0, pattern.prefixDistanceM[endIndex] - pattern.prefixDistanceM[startIndex]);
  }

  rideMinutes(pattern, startIndex, endIndex) {
    const metersPerMin = this.routeSpeedMph(pattern) * 1609.344 / 60;
    const dwell = Math.max(0, endIndex - startIndex - 1) * 0.22;
    return Math.max(1, this.distanceBetween(pattern, startIndex, endIndex) / metersPerMin + dwell);
  }

  shapeSlice(pattern, start, end) {
    if (pattern.shape.length < 2) return [[start.lat, start.lon], [end.lat, end.lon]];
    const nearestIndex = stop => {
      let bestIndex = 0;
      let bestDistance = Infinity;
      pattern.shape.forEach((point, index) => {
        const distance = haversineM(point, stop);
        if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
      });
      return bestIndex;
    };
    const startIndex = nearestIndex(start);
    const endIndex = nearestIndex(end);
    let points = startIndex <= endIndex
      ? pattern.shape.slice(startIndex, endIndex + 1)
      : pattern.shape.slice(endIndex, startIndex + 1).reverse();
    if (points.length < 2) points = [[start.lat, start.lon], [end.lat, end.lon]];
    return points.map(([lat, lon]) => [round(lat, 6), round(lon, 6)]);
  }

  reliability(patterns) {
    const evidence = [];
    let worst = "STABLE";
    for (const pattern of patterns) {
      const health = this.healthFor(pattern);
      if ((HEALTH_SEVERITY[health] ?? 2) > (HEALTH_SEVERITY[worst] ?? 0)) worst = health;
      const row = this.health.get(`${pattern.route_id}|${pattern.direction_id}`) || {};
      evidence.push({
        route_id: pattern.route_id,
        direction_id: pattern.direction_id,
        health,
        median_headway_min: row.median_headway_min ?? null,
        bunching_events: Number(row.bunching_events || 0),
        large_gap_events: Number(row.large_gap_events || row.service_gap_events || 0),
        severe_gap_events: Number(row.severe_gap_events || 0),
        predictions_observed: Number(row.predictions_observed || 0)
      });
    }
    return {health: worst, penalty: RELIABILITY_PENALTY_MIN[worst] ?? 5, evidence};
  }

  legDisruption(pattern, start, end) {
    const currentSpeed = this.vehicleSpeeds.get(`${pattern.route_id}|${pattern.direction_id}`);
    const comparisonSpeed = this.comparisonSpeedMph(pattern);
    const speedRatio = currentSpeed == null ? null : currentSpeed / comparisonSpeed;
    const movementStatus = speedRatio == null ? "NO_LIVE_SPEED"
      : speedRatio < 0.7 ? "SLOWER_THAN_COMPARISON"
      : speedRatio < 0.9 ? "SLIGHTLY_BELOW_COMPARISON"
      : "NEAR_COMPARISON";
    const legLine = this.shapeSlice(pattern, start, end);
    const roadContext = [];
    for (const event of this.realtime.road_events || []) {
      const routeIds = new Set((event.route_ids || []).map(String));
      let relation = null;
      let distanceM = null;
      if (routeIds.has(pattern.route_id)) relation = "DIRECT_ROUTE_MATCH";
      else {
        let points = (event.geometry || []).map(point => [Number(point?.[0]), Number(point?.[1])])
          .filter(point => point.every(Number.isFinite));
        if (!points.length && Number.isFinite(Number(event.lat)) && Number.isFinite(Number(event.lon))) {
          points = [[Number(event.lat), Number(event.lon)]];
        }
        if (points.length) {
          distanceM = Math.min(...points.map(point => pointToPolylineM(point, legLine)));
          if (distanceM <= 60) relation = "DIRECT_OVERLAP";
          else if (distanceM <= 250) relation = "NEARBY";
        }
      }
      if (relation) roadContext.push({
        title: String(event.title || "Road event"),
        relation,
        distance_m: distanceM == null ? null : round(distanceM)
      });
    }
    const serviceNotices = (this.realtime.alerts || []).filter(alert => {
      const routeIds = new Set((alert.route_ids || []).map(String));
      const direction = alert.direction_id;
      return routeIds.has(pattern.route_id)
        && (direction == null || direction === "" || String(direction) === pattern.direction_id);
    }).slice(0, 3).map(alert => ({title: String(alert.title || "Muni service update"), route_match_status: "MATCHED"}));
    const slower = movementStatus === "SLOWER_THAN_COMPARISON";
    const strongRoadMatch = roadContext.some(row => ["DIRECT_OVERLAP", "DIRECT_ROUTE_MATCH"].includes(row.relation));
    const evidenceStatus = slower && strongRoadMatch ? "SLOWDOWN_WITH_MATCHED_ROAD_CONTEXT"
      : slower ? "TRANSIT_SLOWDOWN_ONLY"
      : roadContext.length ? "ROAD_CONTEXT_WITHOUT_DETECTED_SLOWDOWN"
      : "NO_MATCHED_DISRUPTION";
    return {
      route_id: pattern.route_id,
      direction_id: pattern.direction_id,
      from_stop_id: start.stop_id,
      to_stop_id: end.stop_id,
      current_speed_mph: currentSpeed == null ? null : round(currentSpeed, 1),
      comparison_speed_mph: round(comparisonSpeed, 1),
      comparison_basis: "Vehicle-mode heuristic; not a historical average.",
      speed_ratio: speedRatio == null ? null : round(speedRatio, 2),
      movement_status: movementStatus,
      evidence_status: evidenceStatus,
      road_context: roadContext.slice(0, 3),
      service_notices: serviceNotices,
      causality_note: "A matched road event may be relevant, but proximity and slowdown do not prove that the event caused the delay."
    };
  }

  cellKey(lat, lon) {
    return `${round(lat, 3).toFixed(3)}|${round(lon, 3).toFixed(3)}`;
  }

  areaSafetyContext(stop) {
    if (this.safetyStopCache.has(stop.stop_id)) return this.safetyStopCache.get(stop.stop_id);
    let nearbyCount = 0;
    for (let latOffset = -3; latOffset <= 3; latOffset += 1) {
      for (let lonOffset = -4; lonOffset <= 4; lonOffset += 1) {
        const lat = round(round(stop.lat, 3) + latOffset / 1000, 3);
        const lon = round(round(stop.lon, 3) + lonOffset / 1000, 3);
        const count = this.safetyCells.get(this.cellKey(lat, lon)) || 0;
        if (count && haversineM(stop, [lat, lon]) <= 250) nearbyCount += count;
      }
    }
    const percentileValue = this.safetyDistribution.length
      ? round(100 * bisectRight(this.safetyDistribution, nearbyCount) / this.safetyDistribution.length)
      : null;
    const result = {...publicStop(stop), reported_incidents_365d_nearby: nearbyCount, percentile: percentileValue, radius_m: 250};
    this.safetyStopCache.set(stop.stop_id, result);
    return result;
  }

  relativeContextLabel(value) {
    if (value == null) return "NOT_RATED";
    if (value >= 90) return "VERY_HIGHER_REPORTED_CONTEXT";
    if (value >= 75) return "HIGHER_REPORTED_CONTEXT";
    if (value <= 25) return "LOWER_REPORTED_CONTEXT";
    return "MID_RANGE_REPORTED_CONTEXT";
  }

  journeySafetyContext(origin, board, routeStops, transferStops, destination) {
    if (!this.safetyDistribution.length) return {
      status: "CITY_CONTEXT_ONLY", overall_percentile: null, origin_percentile: null,
      boarding_percentile: null, route_percentile: null, transfer_percentile: null,
      destination_percentile: null, label: "Stop-level evidence unavailable",
      detail: "Citywide historical context is available, but this journey is not assigned a safety score.",
      disclaimer: "Historical incident context is not a crime forecast or a safe/unsafe label."
    };
    const originContext = this.areaSafetyContext(origin);
    const boardingContext = this.areaSafetyContext(board);
    const destinationContext = this.areaSafetyContext(destination);
    const routeValues = routeStops.map(stop => this.areaSafetyContext(stop).percentile).filter(value => value != null);
    const transferValues = transferStops.map(stop => this.areaSafetyContext(stop).percentile).filter(value => value != null);
    const routePercentile = routeValues.length ? round(median(routeValues)) : null;
    const transferPercentile = transferValues.length ? round(median(transferValues)) : null;
    const components = [originContext.percentile, boardingContext.percentile, routePercentile, transferPercentile, destinationContext.percentile]
      .filter(value => value != null);
    const overall = components.length ? round(median(components)) : null;
    return {
      status: "JOURNEY_RELATIVE_CONTEXT",
      overall_percentile: overall,
      origin_percentile: originContext.percentile,
      boarding_percentile: boardingContext.percentile,
      route_percentile: routePercentile,
      transfer_percentile: transferPercentile,
      destination_percentile: destinationContext.percentile,
      label: this.relativeContextLabel(overall),
      lookback_days: this.realtime.safety?.lookback_days || 365,
      radius_m: 250,
      detail: "Relative count of reported incidents near journey areas compared with other observed San Francisco cells.",
      disclaimer: "Historical reported incidents do not predict crime, label a place safe or unsafe, or guarantee personal safety."
    };
  }

  destinationParkingContext(destination) {
    if (this.parkingStopCache.has(destination.stop_id)) return this.parkingStopCache.get(destination.stop_id);
    const matched = this.parkingCells.filter(row => Number.isFinite(Number(row.lat))
      && Number.isFinite(Number(row.lon))
      && haversineM(destination, [Number(row.lat), Number(row.lon)]) <= 400);
    if (!matched.length) {
      const unavailable = {
        status: "UNAVAILABLE", radius_m: 400, pressure_label: "NOT_RATED",
        relative_pressure_percentile: null, metered_spaces_represented: 0,
        active_paid_sessions_proxy: 0, starts_15m: 0, starts_30m: 0, starts_60m: 0,
        trend: "UNAVAILABLE", detail: "No matched on-street meter evidence near this destination.",
        disclaimer: "This does not measure physical occupancy or open spaces."
      };
      this.parkingStopCache.set(destination.stop_id, unavailable);
      return unavailable;
    }
    const total = field => matched.reduce((sum, row) => sum + Number(row[field] || 0), 0);
    const inventory = total("metered_spaces");
    const active = total("active_paid_sessions_proxy");
    const starts15 = total("starts_15m");
    const starts30 = total("starts_30m");
    const starts60 = total("starts_60m");
    const previous30 = total("previous_30m_starts");
    const ratio = active / Math.max(1, inventory);
    const percentileValue = ratio > 0 && this.parkingPressureDistribution.length
      ? round(100 * bisectRight(this.parkingPressureDistribution, ratio) / this.parkingPressureDistribution.length)
      : 0;
    const pressureLabel = percentileValue >= 90 ? "VERY_HIGH" : percentileValue >= 70 ? "HIGH" : percentileValue >= 35 ? "MODERATE" : "LOW";
    const trend = starts30 >= previous30 + 2 && starts30 >= previous30 * 1.2 ? "RISING"
      : previous30 >= starts30 + 2 && starts30 <= previous30 * 0.8 ? "FALLING" : "STEADY";
    const result = {
      status: "PAID_PARKING_PRESSURE_PROXY", radius_m: 400, pressure_label: pressureLabel,
      relative_pressure_percentile: percentileValue, metered_spaces_represented: inventory,
      active_paid_sessions_proxy: active, paid_session_pressure_ratio: round(ratio, 3),
      starts_15m: starts15, starts_30m: starts30, starts_60m: starts60,
      previous_30m_starts: previous30, trend,
      detail: "Paid-session activity near on-street meter inventory; useful for relative demand context only.",
      disclaimer: "A paid session does not prove a vehicle is present. This does not measure physical occupancy or open spaces."
    };
    this.parkingStopCache.set(destination.stop_id, result);
    return result;
  }

  directCandidate(origin, destination, pattern, boardOption, alightOption, planningEpoch) {
    const {stop: board, index: boardIndex, distance_m: originWalkM} = boardOption;
    const {stop: alight, index: alightIndex, distance_m: destinationWalkM} = alightOption;
    const originWalkMin = originWalkM / WALK_SPEED_M_PER_MIN;
    const destinationWalkMin = destinationWalkM / WALK_SPEED_M_PER_MIN;
    const realtimeTrip = this.tripForLeg(pattern, board.stop_id, alight.stop_id, planningEpoch + originWalkMin * 60);
    const trip = realtimeTrip?.trip || null;
    const waitMin = realtimeTrip ? Math.max(0, (realtimeTrip.board_epoch - planningEpoch - originWalkMin * 60) / 60) : this.waitMinutes(pattern);
    const rideMin = realtimeTrip ? (realtimeTrip.alight_epoch - realtimeTrip.board_epoch) / 60 : this.rideMinutes(pattern, boardIndex, alightIndex);
    const etaStatus = realtimeTrip ? "REALTIME_TRIP_PREDICTION" : "ESTIMATED";
    const walkingMin = originWalkMin + destinationWalkMin;
    const etaMin = walkingMin + waitMin + rideMin;
    const reliability = this.reliability([pattern]);
    const disruption = this.legDisruption(pattern, board, alight);
    const safety = this.journeySafetyContext(origin, board, pattern.stops.slice(boardIndex, alightIndex + 1), [], destination);
    const safetyPenalty = Number(safety.overall_percentile || 0) / 10;
    const journeyId = stableJourneyId(["direct", pattern.key, board.stop_id, alight.stop_id, trip?.trip_id || "estimate"]);
    return {
      journey_id: journeyId, journey_type: "DIRECT", route_sequence: pattern.route_id,
      eta_min: round(etaMin, 1), walking_min: round(walkingMin, 1), eta_status: etaStatus,
      transfer_count: 0, reliability: reliability.health, reliability_detail: reliability.evidence,
      disruption_analysis: [disruption], exposure: safety.label, safety,
      destination_parking: this.destinationParkingContext(destination), transfer: null,
      costs: {
        fastest: round(etaMin, 3),
        balanced: round(etaMin + reliability.penalty + walkingMin * 0.15, 3),
        safety_first: round(etaMin + reliability.penalty + walkingMin * 0.15 + safetyPenalty, 3)
      },
      legs: [
        {type: "WALK", from: publicStop(origin), to: publicStop(board), duration_min: round(originWalkMin, 1), distance_m: round(originWalkM)},
        {type: "WAIT", at: publicStop(board), duration_min: round(waitMin, 1), route_id: pattern.route_id, trip_id: trip?.trip_id || null, predicted_departure: realtimeTrip ? new Date(realtimeTrip.board_epoch * 1000).toISOString() : null, timing_status: etaStatus},
        {type: "RIDE", route_id: pattern.route_id, direction_id: pattern.direction_id, direction_label: pattern.direction_label, headsign: pattern.headsign, from: publicStop(board), to: publicStop(alight), duration_min: round(rideMin, 1), stop_count: alightIndex - boardIndex, trip_id: trip?.trip_id || null, vehicle_id: trip?.vehicle_id || null, predicted_departure: realtimeTrip ? new Date(realtimeTrip.board_epoch * 1000).toISOString() : null, predicted_arrival: realtimeTrip ? new Date(realtimeTrip.alight_epoch * 1000).toISOString() : null, prediction_age_seconds: trip?.update_timestamp ? Math.max(0, round(planningEpoch - trip.update_timestamp)) : null, timing_status: etaStatus, disruption},
        {type: "WALK", from: publicStop(alight), to: publicStop(destination), duration_min: round(destinationWalkMin, 1), distance_m: round(destinationWalkM)}
      ],
      map: {
        route_paths: [{route_id: pattern.route_id, direction_id: pattern.direction_id, color: ROUTE_COLORS[0], points: this.shapeSlice(pattern, board, alight)}],
        walk_paths: [[[origin.lat, origin.lon], [board.lat, board.lon]], [[alight.lat, alight.lon], [destination.lat, destination.lon]]],
        points: [{...publicStop(origin), role: "ORIGIN"}, {...publicStop(board), role: "BOARD"}, {...publicStop(alight), role: "ALIGHT"}, {...publicStop(destination), role: "DESTINATION"}]
      }
    };
  }

  bestTransferPair(first, firstBoardIndex, second, secondAlightIndex) {
    let best = null;
    let bestScore = Infinity;
    for (let firstIndex = firstBoardIndex + 1; firstIndex < first.stops.length; firstIndex += 1) {
      for (let secondIndex = 0; secondIndex < secondAlightIndex; secondIndex += 1) {
        const firstStop = first.stops[firstIndex];
        const secondStop = second.stops[secondIndex];
        const transferM = haversineM(firstStop, secondStop);
        if (transferM > TRANSFER_RADIUS_M) continue;
        const score = this.distanceBetween(first, firstBoardIndex, firstIndex)
          + this.distanceBetween(second, secondIndex, secondAlightIndex) + transferM * 2.5;
        if (score < bestScore) {
          bestScore = score;
          best = {firstStop, firstIndex, secondStop, secondIndex, transferM};
        }
      }
    }
    return best;
  }

  transferCandidate(origin, destination, first, firstBoardOption, second, finalAlightOption, transferPair, planningEpoch) {
    const firstBoard = firstBoardOption.stop;
    const firstBoardIndex = firstBoardOption.index;
    const originWalkM = firstBoardOption.distance_m;
    const finalAlight = finalAlightOption.stop;
    const finalAlightIndex = finalAlightOption.index;
    const destinationWalkM = finalAlightOption.distance_m;
    const {firstStop: firstAlight, firstIndex: firstAlightIndex, secondStop: secondBoard, secondIndex: secondBoardIndex, transferM} = transferPair;
    const originWalkMin = originWalkM / WALK_SPEED_M_PER_MIN;
    const transferWalkMin = transferM / WALK_SPEED_M_PER_MIN;
    const destinationWalkMin = destinationWalkM / WALK_SPEED_M_PER_MIN;
    const firstPrediction = this.tripForLeg(first, firstBoard.stop_id, firstAlight.stop_id, planningEpoch + originWalkMin * 60);
    const firstTrip = firstPrediction?.trip || null;
    const firstWait = firstPrediction ? Math.max(0, (firstPrediction.board_epoch - planningEpoch - originWalkMin * 60) / 60) : this.waitMinutes(first);
    const firstRide = firstPrediction ? (firstPrediction.alight_epoch - firstPrediction.board_epoch) / 60 : this.rideMinutes(first, firstBoardIndex, firstAlightIndex);
    const transferWalkCompleteEpoch = firstPrediction ? firstPrediction.alight_epoch + transferWalkMin * 60 : null;
    const secondPrediction = transferWalkCompleteEpoch == null ? null : this.tripForLeg(second, secondBoard.stop_id, finalAlight.stop_id, transferWalkCompleteEpoch + BOARDING_BUFFER_MIN * 60);
    const secondTrip = secondPrediction?.trip || null;
    const secondWait = secondPrediction ? Math.max(0, (secondPrediction.board_epoch - transferWalkCompleteEpoch) / 60) : this.waitMinutes(second);
    const secondRide = secondPrediction ? (secondPrediction.alight_epoch - secondPrediction.board_epoch) / 60 : this.rideMinutes(second, secondBoardIndex, finalAlightIndex);
    const transferBuffer = secondPrediction
      ? (secondPrediction.board_epoch - transferWalkCompleteEpoch - BOARDING_BUFFER_MIN * 60) / 60
      : secondWait - BOARDING_BUFFER_MIN;
    const etaStatus = secondPrediction ? "REALTIME_TRIP_PREDICTION" : firstPrediction ? "MIXED_REALTIME" : "ESTIMATED";
    const walkingMin = originWalkMin + transferWalkMin + destinationWalkMin;
    const etaMin = walkingMin + firstWait + firstRide + secondWait + secondRide;
    const reliability = this.reliability([first, second]);
    const firstDisruption = this.legDisruption(first, firstBoard, firstAlight);
    const secondDisruption = this.legDisruption(second, secondBoard, finalAlight);
    const safety = this.journeySafetyContext(origin, firstBoard, [
      ...first.stops.slice(firstBoardIndex, firstAlightIndex + 1),
      ...second.stops.slice(secondBoardIndex, finalAlightIndex + 1)
    ], [firstAlight, secondBoard], destination);
    const safetyPenalty = Number(safety.overall_percentile || 0) / 10;
    const catchability = transferBuffer < 0 ? "MISS" : transferBuffer >= 3 ? "CATCHABLE" : "TIGHT";
    const routeSequence = `${first.route_id} → ${second.route_id}`;
    const journeyId = stableJourneyId(["transfer", first.key, second.key, firstBoard.stop_id, firstAlight.stop_id, secondBoard.stop_id, finalAlight.stop_id, firstTrip?.trip_id || "estimate", secondTrip?.trip_id || "estimate"]);
    return {
      journey_id: journeyId, journey_type: "ONE_TRANSFER", route_sequence: routeSequence,
      eta_min: round(etaMin, 1), walking_min: round(walkingMin, 1), eta_status: etaStatus,
      transfer_count: 1, reliability: reliability.health, reliability_detail: reliability.evidence,
      disruption_analysis: [firstDisruption, secondDisruption], exposure: safety.label, safety,
      destination_parking: this.destinationParkingContext(destination),
      transfer: {
        from_stop: publicStop(firstAlight), to_stop: publicStop(secondBoard), walk_min: round(transferWalkMin, 1),
        catch_slack_min: round(transferBuffer, 1), estimated_buffer_min: round(transferBuffer, 1),
        catchability, basis: secondPrediction ? "Concrete GTFS-RT arrival and departure predictions for both trips." : "Estimated from route headway evidence; not a guaranteed connection.",
        timing_status: etaStatus,
        first_trip_arrival: firstPrediction ? new Date(firstPrediction.alight_epoch * 1000).toISOString() : null,
        ready_to_board_at: transferWalkCompleteEpoch == null ? null : new Date((transferWalkCompleteEpoch + BOARDING_BUFFER_MIN * 60) * 1000).toISOString(),
        second_trip_departure: secondPrediction ? new Date(secondPrediction.board_epoch * 1000).toISOString() : null,
        boarding_buffer_min: BOARDING_BUFFER_MIN
      },
      costs: {
        fastest: round(etaMin, 3),
        balanced: round(etaMin + reliability.penalty + walkingMin * 0.15 + 3, 3),
        safety_first: round(etaMin + reliability.penalty + walkingMin * 0.15 + 3 + safetyPenalty, 3)
      },
      legs: [
        {type: "WALK", from: publicStop(origin), to: publicStop(firstBoard), duration_min: round(originWalkMin, 1), distance_m: round(originWalkM)},
        {type: "WAIT", at: publicStop(firstBoard), duration_min: round(firstWait, 1), route_id: first.route_id, trip_id: firstTrip?.trip_id || null, predicted_departure: firstPrediction ? new Date(firstPrediction.board_epoch * 1000).toISOString() : null, timing_status: firstPrediction ? "REALTIME_TRIP_PREDICTION" : "ESTIMATED"},
        {type: "RIDE", route_id: first.route_id, direction_id: first.direction_id, direction_label: first.direction_label, headsign: first.headsign, from: publicStop(firstBoard), to: publicStop(firstAlight), duration_min: round(firstRide, 1), stop_count: firstAlightIndex - firstBoardIndex, trip_id: firstTrip?.trip_id || null, vehicle_id: firstTrip?.vehicle_id || null, predicted_departure: firstPrediction ? new Date(firstPrediction.board_epoch * 1000).toISOString() : null, predicted_arrival: firstPrediction ? new Date(firstPrediction.alight_epoch * 1000).toISOString() : null, timing_status: firstPrediction ? "REALTIME_TRIP_PREDICTION" : "ESTIMATED", disruption: firstDisruption},
        {type: "WALK", from: publicStop(firstAlight), to: publicStop(secondBoard), duration_min: round(transferWalkMin, 1), distance_m: round(transferM), transfer: true},
        {type: "WAIT", at: publicStop(secondBoard), duration_min: round(secondWait, 1), route_id: second.route_id, trip_id: secondTrip?.trip_id || null, predicted_departure: secondPrediction ? new Date(secondPrediction.board_epoch * 1000).toISOString() : null, catch_slack_min: round(transferBuffer, 1), estimated_buffer_min: round(transferBuffer, 1), timing_status: secondPrediction ? "REALTIME_TRIP_PREDICTION" : "ESTIMATED"},
        {type: "RIDE", route_id: second.route_id, direction_id: second.direction_id, direction_label: second.direction_label, headsign: second.headsign, from: publicStop(secondBoard), to: publicStop(finalAlight), duration_min: round(secondRide, 1), stop_count: finalAlightIndex - secondBoardIndex, trip_id: secondTrip?.trip_id || null, vehicle_id: secondTrip?.vehicle_id || null, predicted_departure: secondPrediction ? new Date(secondPrediction.board_epoch * 1000).toISOString() : null, predicted_arrival: secondPrediction ? new Date(secondPrediction.alight_epoch * 1000).toISOString() : null, timing_status: secondPrediction ? "REALTIME_TRIP_PREDICTION" : "ESTIMATED", disruption: secondDisruption},
        {type: "WALK", from: publicStop(finalAlight), to: publicStop(destination), duration_min: round(destinationWalkMin, 1), distance_m: round(destinationWalkM)}
      ],
      map: {
        route_paths: [
          {route_id: first.route_id, direction_id: first.direction_id, color: ROUTE_COLORS[0], points: this.shapeSlice(first, firstBoard, firstAlight)},
          {route_id: second.route_id, direction_id: second.direction_id, color: ROUTE_COLORS[1], points: this.shapeSlice(second, secondBoard, finalAlight)}
        ],
        walk_paths: [[[origin.lat, origin.lon], [firstBoard.lat, firstBoard.lon]], [[firstAlight.lat, firstAlight.lon], [secondBoard.lat, secondBoard.lon]], [[finalAlight.lat, finalAlight.lon], [destination.lat, destination.lon]]],
        points: [{...publicStop(origin), role: "ORIGIN"}, {...publicStop(firstBoard), role: "BOARD"}, {...publicStop(firstAlight), role: "TRANSFER_FROM"}, {...publicStop(secondBoard), role: "TRANSFER_TO"}, {...publicStop(finalAlight), role: "ALIGHT"}, {...publicStop(destination), role: "DESTINATION"}]
      }
    };
  }

  generateCandidates(origin, destination, planningEpoch) {
    const originAccess = this.patternAccess(this.nearbyStops(origin), true);
    const destinationAccess = this.patternAccess(this.nearbyStops(destination), false);
    const candidates = [];

    // Feature 25B.1 · Direct routes / 直达路线
    // 中文：只有同一有向运行路径中“先上车、后下车”才算直达，避免反方向匹配。
    // English: A direct trip must board before it alights on the same directed pattern.
    for (const [key, boardOptions] of originAccess) {
      const alightOptions = destinationAccess.get(key);
      if (!alightOptions) continue;
      const pattern = this.patternByKey.get(key);
      let bestPair = null;
      let bestScore = Infinity;
      for (const boardOption of boardOptions) {
        for (const alightOption of alightOptions) {
          if (alightOption.index <= boardOption.index) continue;
          const score = boardOption.distance_m + alightOption.distance_m + this.distanceBetween(pattern, boardOption.index, alightOption.index);
          if (score < bestScore) { bestScore = score; bestPair = {boardOption, alightOption}; }
        }
      }
      if (bestPair) candidates.push(this.directCandidate(origin, destination, pattern, bestPair.boardOption, bestPair.alightOption, planningEpoch));
    }

    // Feature 25B.2 · One transfer / 一次换乘
    // 中文：仅连接 180 米内的换乘站，并禁止同一路线自己换自己。
    // English: Transfer platforms must be within 180 m and the route must actually change.
    const transferBest = new Map();
    for (const [firstKey, firstOptions] of originAccess) {
      const first = this.patternByKey.get(firstKey);
      for (const [secondKey, secondOptions] of destinationAccess) {
        const second = this.patternByKey.get(secondKey);
        if (first.route_id === second.route_id) continue;
        let bestCandidate = null;
        for (const firstOption of firstOptions) {
          for (const secondOption of secondOptions) {
            const transferPair = this.bestTransferPair(first, firstOption.index, second, secondOption.index);
            if (!transferPair) continue;
            const candidate = this.transferCandidate(origin, destination, first, firstOption, second, secondOption, transferPair, planningEpoch);
            if (!bestCandidate || candidate.eta_min < bestCandidate.eta_min) bestCandidate = candidate;
          }
        }
        if (bestCandidate) transferBest.set(`${firstKey}|${secondKey}`, bestCandidate);
      }
    }
    candidates.push(...transferBest.values());
    const bestBySequence = new Map();
    for (const candidate of candidates) {
      const current = bestBySequence.get(candidate.route_sequence);
      if (!current || candidate.costs.balanced < current.costs.balanced) bestBySequence.set(candidate.route_sequence, candidate);
    }
    return [...bestBySequence.values()];
  }

  markPareto(candidates) {
    for (const candidate of candidates) {
      candidate.pareto_efficient = !candidates.some(other => other !== candidate
        && other.eta_min <= candidate.eta_min
        && other.walking_min <= candidate.walking_min
        && (RELIABILITY_PENALTY_MIN[other.reliability] ?? 5) <= (RELIABILITY_PENALTY_MIN[candidate.reliability] ?? 5)
        && (other.eta_min < candidate.eta_min
          || other.walking_min < candidate.walking_min
          || (RELIABILITY_PENALTY_MIN[other.reliability] ?? 5) < (RELIABILITY_PENALTY_MIN[candidate.reliability] ?? 5)));
    }
  }

  plan(originStopId, destinationStopId, mode = "BALANCED") {
    const origin = this.stops.get(String(originStopId));
    const destination = this.stops.get(String(destinationStopId));
    if (!origin) throw new Error(`Unknown origin stop_id: ${originStopId}`);
    if (!destination) throw new Error(`Unknown destination stop_id: ${destinationStopId}`);
    if (origin.stop_id === destination.stop_id) throw new Error("Origin and destination must be different stops.");
    const selectedMode = String(mode || "BALANCED").toUpperCase();
    const modeKeys = {FASTEST: "fastest", BALANCED: "balanced", SAFETY_FIRST: "safety_first"};
    if (!modeKeys[selectedMode]) throw new Error(`Unsupported mode: ${mode}`);
    const planningEpoch = Date.now() / 1000;
    let candidates = this.generateCandidates(origin, destination, planningEpoch);
    if (!candidates.length) throw new Error("No direct or one-transfer journey was found within the current access limits.");
    this.markPareto(candidates);
    candidates.sort((left, right) => left.costs.balanced - right.costs.balanced || left.eta_min - right.eta_min);
    candidates = candidates.slice(0, MAX_ALTERNATIVES);
    const modes = [];
    const winners = {};
    for (const [modeName, costKey] of Object.entries(modeKeys)) {
      const winner = [...candidates].sort((left, right) => left.costs[costKey] - right.costs[costKey] || left.eta_min - right.eta_min)[0];
      winners[modeName] = winner;
      modes.push({
        mode: modeName, winner_journey_id: winner.journey_id, route: winner.route_sequence,
        eta_min: winner.eta_min, walking_min: winner.walking_min, transfer_count: winner.transfer_count,
        eta_status: winner.eta_status, reliability_label: winner.reliability,
        exposure_label: winner.exposure,
        explanation: modeName === "FASTEST" ? "Lowest estimated door-to-door travel time in the current candidate set."
          : modeName === "BALANCED" ? "Balances ETA, walking, transfers, and current service-spacing evidence."
          : this.safetyDistribution.length ? "Uses relative 365-day reported-incident context when location cells are available; this is not a prediction of personal safety."
          : "Stop-level historical context is not available, so this falls back to the reliability-aware ranking."
      });
    }
    const selected = winners[selectedMode];
    return {
      meta: {
        engine_version: ENGINE_VERSION,
        calculated_at: new Date().toISOString(),
        calculation_basis: "Cached GTFS route-direction patterns plus the latest credential-free realtime snapshot; calculated in this browser.",
        eta_status: selected.eta_status,
        trip_prediction_count: [...this.predictedTrips.values()].reduce((sum, rows) => sum + rows.length, 0),
        safety_status: this.safetyDistribution.length ? "JOURNEY_RELATIVE_CONTEXT" : "CITY_CONTEXT_ONLY",
        execution: "BROWSER_WEB_WORKER",
        freshness: {
          realtime_generated_at: this.realtime.meta?.generated_at || null,
          realtime_status: this.realtime.meta?.status || null,
          network_feed_version: this.network.meta?.feed_version || null,
          parking_source_time: this.realtime.parking?.source_snapshot_time || null,
          safety_basis: this.realtime.safety?.status || null
        }
      },
      origin: publicStop(origin),
      destination: publicStop(destination),
      selected_mode: selectedMode,
      selected_journey_id: selected.journey_id,
      modes,
      alternatives: candidates
    };
  }
}

