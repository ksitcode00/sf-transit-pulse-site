# UI V1.4 restore point

This folder records the last UI state before the UI V2 redesign.

- Git tag: `ui-v1.4-before-ui-v2`
- Commit: `206bb33`
- Scope preserved: the complete website state, including UI, planner behavior, public data contract, and deployment configuration
- Reference images: desktop and mobile screenshots of the home and journey sections

If UI V2 needs to be undone, use this tag as the source of truth. Prefer a new restore commit on `main` so the published history remains auditable; do not delete or move the tag.

The UI V2 work is intentionally limited to presentation files and UI contract assertions. Route planning, realtime parsing, scoring, Safety Method 3.0, public JSON schemas, and GitHub Actions are not changed.
