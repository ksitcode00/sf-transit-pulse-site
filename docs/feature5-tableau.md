# Feature 5 Tableau data — Construction & Closure Exposure

This package is for spatial exposure analysis. It does **not** establish that a closure caused a Muni delay or a reroute.

## What is generated each day

| File | One row represents | Tableau use |
| --- | --- | --- |
| `feature5_events_current.csv` | One source event on one daily snapshot | Map marks, source/type/status filters, event details |
| `feature5_route_shapes.csv` | One ordered point on one route direction | Route line map |
| `feature5_route_exposure_current.csv` | One spatially matched event × route direction | Exposure counts and route/event comparison |
| `feature5_data_dictionary.csv` | One output-file definition | Import reference |

The GitHub Actions artifact is retained for 90 days. The independent Cloudflare scheduler starts this workflow once daily at 13:19 UTC. You can also run it manually from **Actions → Build Feature 5 Tableau data → Run workflow**.

## Sources and evidence labels

| Source | Label | What it means |
| --- | --- | --- |
| 511 SF Bay WZDx | `WORK_ZONE` | Planned or active work zones, closures, and detours |
| SFMTA Temporary Street Closures | `PERMITTED_CLOSURE` | Upcoming/current SFMTA-permitted street closure |
| DataSF Utility Excavation Permits | `EXCAVATION_PERMIT` | Active/approved utility excavation permit; not proof of road closure |

`DIRECT_OVERLAP` means the sampled event geometry is within 80 m of sampled route geometry. `NEARBY_CONTEXT` means 80–250 m away. Treat both as spatial context only.

## Tableau practice sequence

1. Connect `feature5_route_exposure_current.csv`.
2. Join `feature5_events_current.csv` on `event_id`.
3. Filter `evidence_type` to `WORK_ZONE` and `PERMITTED_CLOSURE` for a strict closure view.
4. Count distinct `event_id` by `route_short_name`, `direction_id`, or `event_type`.
5. For a map, use `latitude`/`longitude` in the events table and draw `feature5_route_shapes.csv` as a line using `point_sequence` as Path.

For a later historical view, union daily artifacts and retain `snapshot_date`; deduplicate on `snapshot_date + event_id` before counting. A multi-day event should appear on each day it remains active.
