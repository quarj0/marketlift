# Audit remediation and geographic search

Work is on `audit/project-readiness-2026-09-05` in the marketplace, admin and backend repositories. Nothing has been committed, pushed or deployed. Payments and identity verification integration remain excluded. Hardware evidence is designed; implementation is deferred as requested.

The old checkout Neon URL is obsolete. Production management commands and migrations belong inside Railway, using its actual environment. The [historical audit](PROJECT_AUDIT_2026-09-05.md) now records this correction.

## Repository changes

These checkboxes describe implemented repository work, not proof that the live deployment has changed.

- [x] F01: correct the migration inference; add `deployment_diagnostics` and a Railway release procedure.
- [x] F02: bound and log the realtime round-trip check; reconcile private data on reconnect and poll while disconnected.
- [x] F03: enforce admin/support permissions consistently on ticket list/detail and protect internal notes.
- [x] F04: connect support submission to the API, retain drafts on failure/sign-in, show real references, and add customer history/replies.
- [x] F05: replace and clear private query caches when the account changes; reject stale session responses.
- [x] F06: server pagination/search/status filters and matching totals for users, sellers, listings, moderation, reports, support and activity; persist list state in URLs.
- [x] F07: load listing market/report/moderation dependencies, fix Brazilian currency fallbacks, and fetch detail context by listing ID. Seller owner/location/plan data no longer depends on unrelated first-page arrays.
- [x] F08: paginate conversations and messages; include the message ID when timestamps tie.
- [x] F09: preload seller settings for listing cards and bound support message prefetches.
- [x] F10: add Playwright/axe regression suites and frontend CI for lint, types, builds and browser checks.
- [x] F11: fix sampled 320px reflow and contrast defects, plus admin table/sidebar contrast.
- [x] F12: associate registration errors with their controls, including phone and terms fields.
- [x] F13: reserve search loading space and retain listing skeleton dimensions during loading.
- [x] F14: add request deadlines, anonymous server query reads, and short public category/home/listing caches.
- [x] F15: reduce the mobile category wall, omit empty recommendation sections, and provide useful empty-inventory actions.
- [x] F16: connect help search to relevant topics and destination links.
- [x] F17: use Portuguese/Brazil defaults in server HTML, public metadata, footer and phone examples.
- [x] F18: replace the first-50-listings sitemap with an index and complete UUID partitions; return an explicit error on backend/capacity failure.
- [x] F19: restore per-account listing drafts for seven days in the same browser tab; require photo/location review before publishing.
- [x] F20: expose password changes, account deactivation, a private activity export and tracked support requests for additional data/deletion.
- [x] F21: restrict offline HTML to document navigation and remove obsolete service-worker caches.
- [x] F22: add worker heartbeat readiness, notification row locking and operational backlog diagnostics.
- [x] F23: apply a shared GraphQL request budget to reads and writes; explicitly fail closed when rate-limit storage is unavailable in production.
- [x] F24: add request correlation/timing, sampled anonymous web vitals, a bounded capacity probe and a restore/operations runbook.
- [x] Implement geographic continuation with signed cursors and preserved product filters.
- [x] Write the [hardware evidence design](HARDWARE_EVIDENCE_DESIGN.md).

Listing structured-data output also escapes user-supplied `<` characters so content cannot break out of its JSON-LD script element.

## Geographic behavior

For a named Brazilian location, results expand from district → city → state → macroregion → country, excluding areas already visited. Administrative order is used when coordinates are unavailable; it is not a claim of measured nearest-city order. With coordinates and a radius, results expand through disjoint distance bands, then remaining country results, then listings lacking coordinates. Country boundaries and all product filters remain fixed.

Empty areas are skipped. The UI announces expansion, retains a keyboard-accessible load-more button, and distinguishes an exhausted search from the existing 5,000-result search window. At that window, users are asked to refine their filters rather than being told all inventory was exhausted. New listings created after a search starts wait for a refreshed search; deletion or edits during browsing can still change offset-based pages. Browser results are deduplicated by listing ID.

## Validation

- A 220-test backend regression run passed against disposable local PostGIS and Redis. Subsequent targeted runs passed after additional changes: 28 tests covering messaging/support/search/API boundaries, 15 final geographic/API tests, and a two-worker notification overlap test. These runs overlap; their counts are not additive.
- New backend coverage includes 250-record admin pagination, cross-role detail access, more than 50 sitemap entries, export ownership/internal-note exclusion, 105 messages sharing a timestamp, invalid telemetry payloads, cache outages and signed geographic cursors.
- All eight marketplace browser scenarios passed together against the production build (17.6 seconds): 320px home/search/registration reflow and axe checks, regional continuation, support failure/retry, draft restoration, account switching during a slow response, and offline behavior. An earlier cold development-server run timed out once on the homepage; the targeted retry and the complete production-build run passed.
- A ninth marketplace scenario passed against the production build: all sitemap routes return 503 when inventory is unavailable, and malformed partitions return 404 (2.1 seconds).
- Both admin browser scenarios passed together against the production build (9.8 seconds): server search/paging beyond record 200 with URL restoration and axe checks; direct Brazilian listing details with BRL and related reports/moderation.
- Both frontend TypeScript and ESLint checks passed. Migration drift check: no changes detected. A final six-test seller/export/context run and the real-schema deployment-diagnostics test also passed.
- Both production builds passed `next build --webpack`, with the build API target deliberately unavailable. Public-data failures recover without failing the homepage build; sitemap routes run at request time.
- CI runs the browser scenarios against the built applications (`E2E_PRODUCTION=1`). For local reproduction, build with `NEXT_PUBLIC_MARKETLIFT_API_URL=http://127.0.0.1:8123`, then run `E2E_PRODUCTION=1 pnpm test:e2e`; ordinary `pnpm test:e2e` starts a development server.

Browser API responses use local fixtures. Backend tests use the real schema on an isolated local database. This combination does not replace a deployed end-to-end smoke test, manual screen-reader testing or field performance measurements. Frontend CI is added but has not run remotely because these changes have not been pushed.

Temporary browser servers were stopped by Playwright. The disposable PostGIS and Redis containers were stopped and removed; all four task ports were confirmed closed. No production commands, migrations or deployment were run.

## Railway and operational work remaining

Follow [RAILWAY_RELEASE_AND_OPERATIONS.md](../../marketlift-backend/docs/RAILWAY_RELEASE_AND_OPERATIONS.md). Deploy the backend before the two frontends because their new query fields/endpoints require it.

The operator still needs to establish the active revision/database, inspect and apply any real pending migrations in Railway, verify sustained readiness and two-client messaging, deploy a worker and one beat scheduler, prove email/upload processing, enable worker heartbeat enforcement, and configure alerts. The original realtime 503 cannot be declared resolved until the new diagnostics run in that environment.

Capacity targets, realistic inventory/load measurements, database connection headroom, backups and a successful restore drill require staging/provider evidence. Automated browser scans cover sampled routes, not a complete accessibility conformance audit. Manual cross-browser and assistive-technology journeys remain release checks.

Notification sends have overlap protection and bounded retries. A worker crash after the email provider accepts a send but before the database commit can still produce a retry duplicate. Activity export is an explicit profile/activity subset; additional records and deletion use support, with retention/erasure policy and audited staff fulfillment to be established before irreversible deletion automation.
