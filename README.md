# SF Transit Pulse

<p align="right"><a href="./README.zh.md">中文</a> · <strong>English</strong></p>

<div align="center">
  <p><strong>What should I take in San Francisco right now, and why?</strong></p>

  [Open the live app in English](https://ksitcode00.github.io/sf-transit-pulse-site/?lang=en)

  [![Deploy GitHub Pages](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/pages.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/pages.yml)
  [![Verify application contracts](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/ci.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/ci.yml)
  [![Refresh transit snapshot](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-data.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-data.yml)
  [![Recover stale transit snapshot](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-watchdog.yml/badge.svg)](https://github.com/ksitcode00/sf-transit-pulse-site/actions/workflows/refresh-watchdog.yml)
</div>

SF Transit Pulse is a Muni decision tool for everyday riders. It goes beyond departure times by explaining vehicle spacing, possible long gaps, transfer timing, and why one route ranks above another.

> This is an independent research prototype, not an official SFMTA service. Live predictions can change, so leave extra time for important trips.

## Try it in 30 seconds

1. Open the [English live app](https://ksitcode00.github.io/sf-transit-pulse-site/?lang=en).
2. Choose a route and direction under “Muni now,” then inspect vehicle positions, spacing, and service notices.
3. Under “Plan a trip,” select “Find nearby stops,” allow location access, and choose a 100, 200, 300, or 400 meter range.
4. Use a nearby stop as your start or destination, then compare Fastest, Balanced, and Safety-first.

## Product goal

Most transit apps answer “When is the next vehicle?” SF Transit Pulse also asks:

- Are the two directions of the same route behaving differently right now?
- Is the fastest option still the best choice, or is another route steadier?
- Does the recommendation use a concrete live trip, a current estimate, or historical context?
- Can a rider understand the evidence and limits behind every conclusion?

The product rule is simple: show only what the available evidence supports, and place important limits beside the result.

## Why this is a decision system, not only a dashboard

The project follows one end-to-end production-style path:

| System layer | What it does | Why it matters |
|---|---|---|
| Live ingestion | Scheduled jobs collect vehicle positions, trip predictions, alerts, road events, paid-parking activity, and historical incident records. | The public site works without the author running a Notebook or computer. |
| Cache and freshness | Credential-free files are split by update cadence. A second workflow checks whether transit observations are actually current and recovers stale snapshots. | A successful script run cannot disguise an old transit feed. |
| Route diagnostics | Vehicles, headways, bunching, long gaps, and service health are calculated by route and direction. | A problem in one direction does not incorrectly label the other direction. |
| Realtime candidate generation | The planner keeps every stop inside the 250 m access radius and every feasible transfer pair until concrete trips are evaluated. | Static walking distance cannot discard an 11th nearby stop or a ninth transfer option when it catches the fastest real trip. |
| Multi-objective scoring | Fastest, Balanced, and Safety-first rank the same feasible pool using documented inputs. | Preference changes affect ranking, not the underlying ETA. |
| Explainable browser UI | A Web Worker calculates on the visitor's device. Timing evidence, transfer slack, A/B comparison, freshness, and limitations appear beside the recommendation. | Riders can understand both the choice and the uncertainty behind it. |

## Feature catalog

Each row explains the rider need, the implementation's practical value, and an example of how to use it.

| Feature | Why it matters | Example | Status |
|---|---|---|---|
| Full Muni route catalog | The app is not limited to a few demo routes; its selector reads the current public GTFS catalog. | Select 14R, 38, N, or another Muni route from the route menu. | Live |
| Route and direction filter | Two directions can behave differently. Vehicles, spacing, and health are separated by `route_id + direction_id`. | A long gap on one 38R direction does not label the other direction unstable. | Live |
| Live vehicle map | Shows reported positions. Unmatched vehicles are counted separately instead of being assigned by guesswork. | Check where the next Route 5 vehicle appears along the corridor before leaving. | Live |
| Direction-level service health | Turns raw predictions into plain-language states such as steady spacing or possible longer waits. | If one 14R direction has highly variable waits, compare Route 14 or rail. | Live |
| Headways, bunching, and long gaps | Average arrival times can hide two vehicles together followed by a long wait. This feature exposes the spacing evidence. | See both a bunch ahead and the long gap behind it. | Live |
| Current reported speed | Shows whether movement is below a transparent vehicle-type reference without presenting that reference as a historical average. | See a slowdown note when a corridor's median reported speed is unusually low. | Live when speed data exists |
| Muni service notices | Places stop moves, elevator outages, and service changes beside route information. | Learn that a stop moved before walking to its usual location. | Live |
| Street work and route context | Shows road events beside transit movement without claiming proximity proves causation. | Work near Market Street and a slower transit segment appear as possible context only. | Research beta |
| Nearby stop location | After explicit permission, the browser calculates distance to every Muni stop. Coordinates are not uploaded or saved. | Choose 200 m and see every stop in range, its distance, and its routes. | Live beta |
| 100–400 meter range | Provides exactly four predictable choices: 100, 200, 300, and 400 m. Changing the range does not request permission again. | Increase the range from 100 m to 300 m when no stop is close enough. | Live |
| Use nearby stop as start or destination | Removes the need to retype a stop name, especially on mobile. | Select “Use as start,” then enter a destination and compare routes. | Live |
| Stop search | Finds origin and destination stops and shows routes serving each stop using the public GTFS catalog in the browser. | Enter “4th St & Market” and choose the correct stop ID. | Live |
| Browse every stop | Opens the complete alphabetized Muni stop catalog without requiring any typing. Stops load 100 at a time while scrolling, so the full list remains available without freezing the page. | Select “Browse all stops,” scroll through the catalog, and choose a stop with its route list. | Live |
| Direct and one-transfer planning | Finds feasible boarding and alighting stops while rejecting wrong-direction and distant fake transfers. | Compare direct and one-transfer options from SoMa to Fillmore. | Public beta |
| Trip-level live boarding and arrival | A leg is labeled live only when one concrete trip has valid predictions at both stops and the update is no more than 10 minutes old. Otherwise it is estimated. | Show predicted 8:12 boarding, 8:27 arrival, and a trip ID instead of a vague 15 minutes. | Live with fresh complete predictions |
| Transfer catch slack | Uses first-trip arrival, walking time, a one-minute boarding allowance, and second-trip departure to calculate remaining minutes. | An 8:20 arrival, two-minute walk, and 8:25 departure produces about two minutes of slack. | Live or clearly estimated |
| Realtime-first transfer selection | Keeps every spatially feasible transfer pair until concrete trip predictions are compared, instead of trimming to the eight closest pairs first. | A ninth, slightly farther transfer can win when its next vehicle arrives much earlier. | Live with fresh complete predictions |
| Fastest | Ranks the lowest door-to-door estimate. Preference scores never replace ETA. | Use Fastest when arrival time matters more than extra walking or variable service. | Live |
| Balanced | Considers ETA, walking, transfer count, and current spacing reliability. | A slightly slower direct option may rank above a trip with more walking and a transfer. | Live, default mode |
| Safety-first | Compares deduplicated 30-, 90-, and 365-day historical reports with transparent category weights. Origin, boarding, route, transfer, and destination use documented weights, and one extreme location is capped. | Use past area context as one extra input for a night trip. It is not a personal safety prediction. | Research beta |
| Option A vs Option B | Places any two displayed routes side by side with ETA, evidence level, walking, transfers, connection slack, reliability, historical context, and street context. | Compare a faster tight transfer with a steadier direct route without switching cards repeatedly. | Live beta |
| Destination parking pressure | Combines meter inventory and recent paid sessions as a relative signal; it is not occupancy or open-space availability. | Check whether paid activity near Mission is rising before driving there for pickup. | Research beta |
| Freshness and failure labels | Each source distinguishes current, retained, outdated, and unavailable. “No events” appears only after a usable source returns no matching events. | If street data fails, the app says it is unavailable instead of implying the road is clear. | Live |
| Stable auto-refresh | A route structure has a stable itinerary ID, while its concrete vehicle run has a separate trip-instance ID. New snapshots recalculate the request without making the open option jump. | The next 38R trip can replace the prior trip while the rider stays on the same 38R itinerary card. | Live |
| Mobile recommendation bar | Keeps the selected route and a 44-pixel trip button within reach on narrow screens; comparison cards collapse to one column. | Check the chosen trip one-handed while walking to a stop. | Live beta |
| Separate English and Chinese UI | URLs can select a language, and controls, states, errors, and method copy switch together. The preference is also stored locally. | `?lang=en` opens English and `?lang=zh` opens Chinese. | Live |
| On-device browser calculation | Trip and nearby-stop queries need no Render server. A Web Worker keeps the map responsive, and the API key never enters the browser. | Anyone can use GitHub Pages while the author's Notebook and computer remain offline. | Live |

## Market comparison

This matrix compares capabilities described in official product material, not routing accuracy. Availability varies by city, device, operating system, and data partner. “Related” means a nearby capability exists but the output or evidence differs. “No equivalent found” means the cited official material does not document an equivalent, not that every regional version lacks it.

Sources checked: 2026-09-14.

| Rider capability | SF Transit Pulse | Google Maps | Apple Maps | Transit | Citymapper |
|---|---|---|---|---|---|
| Transit trip planning | Muni direct and one transfer | Yes | Yes | Yes | Yes |
| Live departures | Yes, with live versus estimated labels | Some stations | Where supported | Yes | Yes |
| Live vehicles on map | Yes; unmatched vehicles excluded | Related; official material emphasizes departures | Where supported | Yes, including rider crowdsourcing | Bus location features |
| Nearby stops with adjustable distance | Yes; four 100–400 m ranges and on-device location | Nearby transit search | Nearby transit features | Nearby stops | Nearby stops |
| Direction-specific health | Yes; each direction is evaluated separately | No equivalent found | No equivalent found | No equivalent found | No equivalent found |
| Bunching and long-gap evidence | Yes; counts and spacing shown | No equivalent found | No equivalent found | Related live and rider reports | Related vehicle location and traffic predictions |
| Exact transfer catch slack | Yes; minutes and basis shown | Related connection information | Related connection information | Related tight-transfer warnings | No equivalent minute value found |
| Fastest route | Yes | Yes | Yes | Yes | Yes |
| Time, walking, transfer, and reliability ranking | Yes, with documented scoring | Related mode and accessibility preferences | Related transit preferences | Related long-walk and tight-transfer cues | Related Walk Less and Simple routes |
| Historical incident context in ranking | Research beta with explicit limits | No equivalent found | No equivalent found | No equivalent found | Related Main Roads walking option using different evidence |
| Road event and slowdown context | Yes, without claiming causation | No equivalent explanation found | Related outages and road incidents | Related service alerts | Related traffic and diversion features |
| Paid parking pressure near destination | Research beta | No equivalent pressure metric found | No equivalent pressure metric found | No equivalent found | No equivalent found |
| Evidence, freshness, and limits | Shown beside results | Related live versus scheduled labels | Related live times and outages | Related source labels and crowdsourcing | Related live predictions and route types |
| Step-by-step navigation and alerts | Roadmap | Yes | Approaching-stop alerts | GO navigation and alerts | GO, voice, and lock-screen navigation |
| Future leave or arrive time | Roadmap | Yes | Yes | Yes | Related feature |
| Accessible routing | Not available; standard routes are not mislabeled as accessible | Wheelchair option | Equivalent filter not confirmed in cited material | Where city data exists | Step-free routing |
| Multimodal and shared mobility | Muni only | Multimodal | Multimodal | Transit, bike, scooter, and ridehail | Multimodal combinations |

### Competitor sources

- [Google Maps: transit departures](https://support.google.com/maps/answer/6142130)
- [Google Maps: accessible transit](https://support.google.com/accessibility/answer/6396990)
- [Apple Maps: transit features](https://www.apple.com/maps/)
- [Apple Support: transit directions](https://support.apple.com/guide/iphone/get-transit-directions-ipha44f57caa/26)
- [Transit: product features](https://transitapp.com/)
- [Transit Support: how GO works](https://help.transitapp.com/article/549-how-to-use-go)
- [Transit: GO crowdsourcing](https://transitapp.com/en/features/go-crowdsourcing)
- [Citymapper: feature news](https://citymapper.com/news)
- [Citymapper: Step-free routes](https://citymapper.com/news/2262/step-free-routing)
- [Citymapper: walking route choices](https://citymapper.com/news/2266/turn-by-turn-directions-for-walking)

## How recommendations are calculated

Every query builds one shared set of direct and one-transfer candidates. The three modes change ranking only; they never rewrite a route's ETA.

| Mode | Ranking basis | Best used when |
|---|---|---|
| Fastest | Door-to-door ETA | Arrival time matters most |
| Balanced | ETA + current reliability penalty + walking cost + transfer cost | You want a practical balance |
| Safety-first | Balanced cost + relative historical report context along the trip | You want historical context as one input, not a safety prediction |

## Evidence contract

- A leg is live only when one concrete trip has valid predictions at both stops. Otherwise it is estimated.
- A live transfer needs complete predictions for both trips. Incomplete evidence falls back to a headway estimate.
- Missing live information does not mean a route has stopped running.
- An unavailable street-event source does not mean there are no disruptions.
- A nearby road event and a slowdown are context, not proof that one caused the other.
- Historical reports do not predict crime, label a place safe or unsafe, or guarantee personal safety.
- Paid parking sessions do not prove a vehicle is present. Parking pressure is not occupancy or open-space availability.
- Preference costs rank routes. They are never shown as ETA.
- Location is requested only after a rider selects the button. Coordinates stay on the current page and are neither uploaded nor saved.

## Serverless architecture

```text
511 SF Bay + DataSF + SFMTA public data
                    |
                    | 5-minute refresh + stale-snapshot watchdog
                    | API key stays in an encrypted Secret
                    v
       split, credential-free JSON snapshots
                    |
                    | freshness gates + GitHub Pages CDN
                    v
             visitor's web browser
                    |
                    | Web Worker + local distance calculation
                    v
  candidate generation -> three rankings -> explanation
```

Core vehicle positions and trip predictions are scheduled every five minutes. Service and road context refresh every 15 minutes, parking every 30 minutes, and safety plus static GTFS daily. The core plan uses an estimated 32 of the default 60 hourly 511 requests, leaving a 28-request margin. A separate 15-minute watchdog compares both `generated_at` and the underlying transit `observed_at`; when either is more than 12 minutes old, it performs a recovery refresh. Predictions older than 10 minutes automatically become estimates.

User searches do not call 511 and do not need Render. `SF_TRANSIT_511_API_KEY` belongs only in the encrypted GitHub Actions Secret. It must not appear in code, browser storage, Notebook output, or public data files.

## Engineering evidence

The checked-in public snapshot verified on 2026-09-14 contained 347 reported vehicle positions, 149 predicted trips, 31 route-direction rows across 18 routes, and five service notices. Counts naturally change with service and feed availability; the page displays the current values rather than hard-coding these numbers.

- The frequently refreshed transit file is about 0.5 MB; slower road, parking, safety, and static-network data are separate, so the browser does not repeatedly download the full legacy snapshot.
- A rolling `refresh-health.json` keeps up to 288 attempts, including script gaps, transit observation gaps, and source age at each refresh.
- Realtime evidence expires after 10 minutes. Alerts and road context expire after 30 minutes; parking context after three hours.
- Regression tests cover an 11th nearby stop, a ninth transfer, stable itinerary identity, unavailable road data, and context-file failure recovery.

## Repository guide

```text
site/
  index.html             Page structure and accessible semantics
  styles.css             Responsive visual system
  app.js                 UI state, maps, search, location, and bilingual copy
  nearby-stops.js        Distance calculation and nearby-stop filtering
  stop-catalog.js        Search and progressive full-catalog browsing
  planner-engine.mjs     Browser routing engine and ranking rules
  planner-worker.js      Background calculation thread
  data/                  Public snapshots with no API key

scripts/
  refresh_data.py        Scheduled collection and snapshot generation
  check_refresh_health.py Detects stale generated and transit-observation times

.github/workflows/
  refresh-data.yml       Five-minute ingestion and slower-source cadence
  refresh-watchdog.yml   Independent stale-snapshot recovery
  ci.yml                 Python, JavaScript, workflow, and data-contract checks
  pages.yml              Static deployment

backend/
  planner.py             Python reference implementation for parity tests
  main.py                Legacy API boundary, unused by the live app

data/
  static-index.json      Non-site lookup used only by scheduled refreshes
  parking-inventory.json Non-site meter locations used only by refreshes

tests/
  browser-planner.test.mjs  Browser planner contracts
  nearby-stops.test.cjs     Nearby distance and radius contracts
  stop-catalog.test.cjs      Search and full-catalog batching contracts
  test_planner.py           Python reference contracts
```

### Local preview

```bash
python3 -m http.server 8765 --directory site
```

Open `http://127.0.0.1:8765/?lang=en`. Do not open `index.html` directly because browser workers need an HTTP origin.

### Tests

```bash
node --test tests/browser-planner.test.mjs tests/nearby-stops.test.cjs tests/stop-catalog.test.cjs
python3 -m pytest -q tests
```

## Current scope and roadmap

| Available now | Next |
|---|---|
| All Muni routes, directions, and live vehicles | Address and place search |
| Nearby stops within 100–400 meters | Show current location and nearby stops on the map |
| Direct and one-transfer planning | Multiple transfers and a fuller walking graph |
| Fastest, Balanced, and Safety-first | Accessible routing only when evidence is complete |
| Live trips and transfer slack | Future leave and arrive times |
| Transit, road, historical incident, and parking context | Favorites, alerts, and step-by-step guidance |

## Data sources

- [511 SF Bay Open Data](https://511.org/open-data/transit): GTFS, realtime vehicle positions, trip updates, and alerts
- [DataSF](https://datasf.org/): San Francisco historical incident and parking datasets used for research context
- [SFMTA](https://www.sfmta.com/): Muni and parking program context
- [Caltrans QuickMap](https://quickmap.dot.ca.gov/): road event context where available in the public snapshot
- [OpenStreetMap](https://www.openstreetmap.org/): map tiles and attribution
- [W3C Geolocation](https://www.w3.org/TR/geolocation/): browser location permission and privacy standard

## Version

Current public release: `v1.4 · Decision Support Beta`

The private analytical Notebook is intentionally not published here. This repository contains only the deployable application, credential-free snapshots, refresh workflow, reference implementation, and tests.
