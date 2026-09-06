# Marketlift project audit — 5 September 2026

**Historical audit, corrected after the owner clarified deployment:** the old checkout Neon URL is obsolete. The eight migrations observed on that connection do not establish Railway migration status. The owner runs all production management commands inside Railway. Implementation and current validation are tracked in [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).

The marketplace has a substantial implemented foundation. The next work should close operational and customer-journey gaps, then improve performance and growth readiness. A redesign or a service split is not the immediate priority.

Scope: marketplace frontend, admin frontend, Django backend, public production behavior, accessibility, UX, speed, scaling, security boundaries, SEO, and operations. Payments and identity verification implementation are excluded. No application code, production records, deployment, or production schema was changed.

## Evidence and validation

| Check | Result |
| --- | --- |
| Marketplace snapshot | `fc6ce773235d0236d8802d9ca808fad0912095ea` |
| Admin snapshot | `13214ecf0f2f45627b13c63f755bcbc34ef4f2bd` |
| Backend snapshot | `d8169bab4a652084bc7289df4bb75306e0b81b74` |
| Working branches | `audit/project-readiness-2026-09-05` in all three repositories |
| Frontend lint | Both applications passed |
| Frontend TypeScript | Both applications passed `tsc --noEmit --incremental false` |
| Production builds | Both applications passed `next build --webpack` |
| Backend tests | **213 passed in 332.278 seconds**, using disposable local PostGIS and Redis; payment/identity and service-billing feature suites were omitted |
| Local migration drift | `makemigrations --check --dry-run`: no changes detected |
| Backend CI | [Current backend commit passed CI](https://github.com/quarj0/marketlift-backend/actions/runs/33949520199) |
| Public browser checks | 19 page/viewport combinations in Chromium; 1440px and 390px for home, search, help, report, login, registration, password recovery, admin login; additional home/search/registration checks at 320px |
| Automated accessibility | 18/19 sampled combinations had no violations under the selected WCAG A/AA tags; 320px registration had a serious contrast failure |
| Browser runtime | No uncaught page errors or HTTP 4xx/5xx responses in the 19 initial page scans |
| Historical database inspection | The obsolete checkout Neon connection had eight pending migrations; this is not evidence about the Railway database |
| Production readiness | Three requests returned **503**, with database/search/Redis `ok` and realtime `unavailable` |
| Public inventory | Search returned `totalCount: 0` for both an empty query and `iphone` |
| Sitemap | Live sitemap contained 137 URLs: 130 categories, seven static routes, zero listings |

Builds initially failed inside the filesystem/process sandbox with “Could not parse output from TypeScript's --showConfig”; both succeeded when rerun with the required execution permissions. This was an audit-environment limitation, not an application build defect. An automated permission review for a browser check timed out; the retry was approved and the check completed.

Saved evidence: [browser results](audit-2026-09-05/browser-results.jsonl), [interaction checks](audit-2026-09-05/browser-interactions.jsonl), [local backend probes](audit-2026-09-05/backend-probes.jsonl), and [validation summary](audit-2026-09-05/validation.json).

The live page scans do not prove that the deployed backend matches the checkout. Database migration evidence came from the obsolete checkout Neon connection. Only diagnostics inside Railway can establish the active deployment and migration state. Authenticated production selling/admin workflows were not exercised, no messages or emails were sent, and no production load test was run. Automated accessibility results are a sample, not a conformance certification. Lab timings below are not field Core Web Vitals.

## What is already working well

- The backend has real accounts, seller profiles, taxonomy, listing lifecycle, search, uploads, messaging, reports, moderation, reviews, saved searches, notifications, support, and administrative role controls. Much of the work is integration and hardening rather than missing domain models.
- Public pages load successfully; search has structured filters, location support, pagination, empty states, and retry UI. Existing category imagery and branding are coherent in the sampled pages.
- There are skip links, labeled controls, visible focus treatments, password visibility buttons, dialog primitives, responsive layouts, and localized validation messages. The mobile filter dialog passed its additional automated scan, kept keyboard focus inside during the Tab test, and closed with Escape after its animation completed.
- Backend defenses include session/CSRF protection, separate admin session cookies, scoped permissions, upload validation and private storage separation, soft-deleted listings, audit records, GraphQL depth/token/alias limits, and search statement timeouts.
- PostgreSQL search already has structured filtering, geospatial support, indexed search documents, capped page sizes, and a bounded signed pagination cursor. Preserve these foundations while measuring larger datasets.
- Image variants, R2/CDN integration, Celery task definitions, readiness endpoints, and operational documentation already exist.

## Prioritized findings

Priority means implementation order: **P0 before launch or wider promotion**, **P1 the next completion/hardening pass**, **P2 product and performance improvements**, **P3 evidence required before materially increasing traffic**. “Observed” means a browser, endpoint, database, or local reproduction demonstrated it. “Code-confirmed” describes a source-level defect or missing mechanism; production impact may still need a controlled reproduction.

### F01 — Corrected: Verify schema using the actual Railway environment

**Superseded production inference.** The owner confirmed that the checkout Neon URL had changed. The following migrations were pending on the old connection only:

```text
categories.0004_category_image_upload
categories.0005_dependent_catalog_fields
categories.0006_category_form_metadata
listings.0010_listing_condition_labels
listings.0011_listing_condition_catalog
platform_settings.0004_min_listing_images
reports.0003_expand_report_reasons
uploads.0003_alter_uploadasset_purpose
```

Do not use this list as the live migration plan. Fresh-database CI validates the repository schema; release diagnostics inside Railway must validate the real upgrade path. No production migration is required on the basis of this historical observation alone.

**Next:** compare Railway's deployed revision and database target, inspect the migration plan and data changes, establish a restore point, validate the upgrade against a restored staging database, and coordinate migrations with the release. Add a migration gate and document rollback/forward recovery. **Done when:** the intended deployment's migration plan is empty and category editing, listing forms, image constraints, reports, and uploads pass smoke tests against that schema.

### F02 — P0: Realtime readiness fails in production

**Observed.** `/api/v1/health/` returns 200, but `/api/v1/ready/` repeatedly returns 503 because `realtime` is unavailable. The final two checks took 6.42s and 6.35s. Database, search extension, and ordinary Redis checks passed.

Source: backend `marketlift/api/views.py:112`, `marketlift/realtime/events.py`, and frontend `src/providers/realtime-provider.tsx:88`.

**Next:** inspect Railway logs for the channel-layer round trip and check the effective `CHANNEL_REDIS_URL`, Redis connection settings, ASGI process, and WebSocket routing. The current evidence does not establish the underlying cause. Also add a disconnected state and bounded data polling/reconciliation: the frontend's 1.5-second interval only reads connection status; it does not refresh missed messages or notifications. **Done when:** readiness stays 200 and two authenticated staging clients exchange messages, disconnect, reconnect, and recover missed updates.

### F03 — P0: Support-ticket detail bypasses the support role boundary

**Locally reproduced.** A staff account with the finance role was denied `supportTickets`, but `supportTicket(id)` returned another customer's ticket and its internal staff note. This is a support authorization defect, independent of payment implementation.

Source: backend `support/graphql/queries.py:24` versus `:33–39`. The detail resolver treats any `is_staff` account as authorized and passes `include_internal=True`.

**Next:** apply the same admin/support role boundary to detail reads, keep customer access ownership-scoped, and restrict internal notes explicitly. Add a role/ownership matrix test. **Done when:** unrelated staff roles and other customers cannot obtain ticket contents or internal notes through any list/detail path. No real customer records were used in the reproduction.

### F04 — P1: Support submission is a false success, and the customer ticket journey is missing

**Observed and code-confirmed.** Clicking the empty “Report a problem” form displays “Relato recebido” without making a POST request. The form simply calls `setDone(true)`. Backend ticket creation/reply/query APIs exist, but no customer support service/page connects them. Backend support replies link to `/account/support`; that route is absent and returned HTTP 404 before the unauthenticated redirect.

Source: frontend `src/app/help/report/page.tsx:28–37`; backend `support/graphql/mutations.py`, `support/graphql/queries.py`, `support/services.py:113`.

**Next:** wire validated ticket creation, show a server-issued reference, build ticket history/detail/replies, and correct notification links. The existing API requires authentication, so the form must guide signed-out users through sign-in while preserving their draft, or support a deliberately designed guest intake. **Done when:** a submitted problem appears in admin support, failures preserve the form, and the customer can read and reply to the response.

### F05 — P1: Private query caches survive logout/account changes

**Code-confirmed privacy risk; account-switch behavior was not exercised with production users.** The root QueryClient persists across navigation. Logout clears `user`, but does not cancel or clear user-scoped queries. Keys such as `saved-searches`, `saved-listings`, `conversations`, and `notifications` omit the user ID. A second account in the same tab can encounter the previous account's cached data, including while a refetch is pending.

Source: `src/providers/query-provider.tsx`, `src/providers/auth-provider.tsx:48–64`, `src/app/account/saved/page.tsx:25`, `src/components/messaging/messages-client.tsx:74`.

**Next:** cancel outstanding private requests on identity changes, remove private cache entries, scope keys by user, and reset realtime state. **Done when:** an automated account-A → logout → account-B test shows no A-specific information, including during slow/failing network responses.

### F06 — P1: Admin pagination only navigates the initially loaded subset

**Code-confirmed.** Admin users/listings/support/audit queries request at most 200 records; several queues request 100. `DataTable` filters and paginates that in-memory array. Staff cannot search the complete dataset or browse later server records from these tables. Some backend resolvers accept offsets, while others need a pagination contract.

Source: admin `src/components/admin/admin-data-provider.tsx:325–335`, `src/components/ui/data-table.tsx:38`; backend `accounts/graphql/queries.py:89`, `support/graphql/queries.py:21`.

**Next:** implement server search/filter/sort and pagination, total counts, stable ordering, and list state in the URL. Keep detail reads independent of loaded list pages. **Done when:** staff can find and act on a fixture beyond record 200 and displayed totals represent the server dataset.

### F07 — P1: Admin listing pages can format Brazilian prices as GHS and omit related context

**Code-confirmed.** The route loader requests only listing data on `/listings...`, excluding markets, reports, and moderation. Listing formatting falls back to `GHS` when the market map is empty. The listing detail page also depends on those omitted context arrays for price and associated reports/moderation.

Source: admin `src/components/admin/admin-data-provider.tsx:639`, `:870–887`; `src/app/(dashboard)/listings/[listingId]/page.tsx`.

**Next:** make currency and relevant listing context explicit dependencies of list/detail routes, preferably return display currency with the listing contract, and query related records by listing ID. **Done when:** a direct load and a client navigation to a Brazilian listing both show BRL and its actual related reports/moderation, regardless of previously visited routes.

### F08 — P1: Older messages become inaccessible after the initial history limit

**Code-confirmed.** The frontend always requests the newest 100 messages and does not use the backend's `before` parameter. Conversations are limited to 200 without a continuation API. Long-running buyers/sellers will lose access to older history through the UI even though the database retains it.

Source: frontend `src/services/messaging.service.ts:44–50`, `src/components/messaging/messages-client.tsx:85`; backend `messaging/graphql/queries.py:44–108`.

**Next:** add older-message pagination with scroll anchoring and a conversation cursor. Reconcile message IDs after reconnect. **Done when:** a conversation with more than 100 messages and an inbox with more than 200 threads remain fully navigable without duplicate messages or scroll jumps.

### F09 — P1: Database work grows per result in listing and support serialization

**Locally measured.** Serializing one listing executed five queries; ten listings executed fourteen. Seller settings were queried once per listing, even for the same seller. Listing eager loading does not include `seller__settings`. One support ticket used two queries; ten tickets used eleven. The ticket mapper queries all messages per ticket, even when the GraphQL list selection only asks for summary fields.

Source: backend `listings/querysets.py:9`, `sellers/graphql/mappers.py:17`, `support/graphql/mappers.py:15–19`.

**Next:** include seller settings in eager loading; separate support summary/detail mapping and paginate message history; prefetch only where full message rows are needed. Add query-count regression checks with multiple records. **Done when:** list serialization query counts stay approximately constant as page size grows, and list endpoints do not materialize unnecessary histories.

### F10 — P1: Frontend behavior has no repository CI regression gate

**Code-confirmed.** Both frontend repositories have lint/build scripts but no checked-in workflow or frontend test suite. Recent marketplace Actions entries are older failed runs; they are not evidence that the current frontend commit fails. Admin had no returned Actions runs. Current local frontend lint/types/build checks all passed.

**Next:** add PR checks for lint/types/build and a small browser suite covering login/logout isolation, search filters, listing draft/publish/edit, support submission, moderation roles, and messaging history/reconnect. Add automated accessibility on representative states. **Done when:** the important defects in this audit are reproducible as failing checks before their fixes and current-commit checks gate releases.

### F11 — P1: Narrow mobile authentication header overflows and loses contrast

**Observed at a configured 320px viewport.** Registration expanded its layout viewport to 386px; the white “Explorar” link extended outside the dark header onto a pale background. Axe measured contrast **1.04:1**, below the 4.5:1 normal-text target. Home and search also expanded slightly to 325px. Comparing `scrollWidth` only with `innerWidth` would miss this mobile viewport expansion.

Source: `src/components/auth/auth-shell.tsx:69–78`. [Registration screenshot](audit-2026-09-05/registration-320.png).

**Next:** use a smaller/compact logo or wrap/reflow the header controls, constrain intrinsic widths, and test the configured viewport rather than only document width. **Done when:** 320px layouts stay within 320px, the browse action stays readable, and zoom/reflow checks pass.

### F12 — P2: Form errors are visible but not programmatically associated

**Observed.** Empty registration correctly shows translated validation errors and marks inputs `aria-invalid=true`, but all five invalid text/password/phone fields lack `aria-describedby`. The visible error paragraphs have no IDs linking them to the input. A generic empty alert does not provide these descriptions.

Source: `src/app/register/page.tsx:84–179`, `src/components/forms/phone-input.tsx`.

**Next:** give errors stable IDs, connect them to controls, provide an announced error summary, and focus the first invalid field. Extend shared controls to support descriptions consistently. **Done when:** a screen-reader user hears the field's specific error and can reach all errors with the keyboard.

### F13 — P2: Search loading causes significant layout movement

**Observed in lab runs.** The initial 1440px search scan recorded cumulative layout shift about **0.324**; 390px recorded **0.163** and 320px about **0.250**. A separate cold interaction trace showed a large footer movement as the short prerendered fallback was replaced. Values vary by cache/network state; these are not population percentiles.

Source: `src/app/search/page.tsx:17–25`, `src/components/search/search-results-client.tsx:938–984`, root Suspense/provider setup.

**Next:** reserve stable space for the search header/results, align loading/error/empty-state geometry, and serve the first public result state earlier. Avoid a short fallback that initially places the footer high on the page. **Done when:** repeated cold/warm mobile tests stay within a CLS budget of 0.1, then field measurements confirm the target.

### F14 — P2: Public data fetching adds avoidable round trips and lacks request deadlines

**Code-confirmed, with a live request trace.** Server GraphQL reads perform a CSRF GET followed by POST, both `no-store`. The shared API clients supply no default timeout/cancellation. The homepage provides initial categories, while the feed still loads in a client query. A fresh desktop home load made six API requests, including market, location suggestions, session, CSRF, search, and feed; its observed LCP was 3.04s. Later warm loads were quicker, so this is a baseline rather than a capacity result.

Source: `src/lib/api-client.ts:91–229`, `src/app/page.tsx`, `src/components/marketplace/homepage-content.tsx:222–233`.

**Next:** cache public category/market data with explicit invalidation, reuse server reads within a render, consider a cacheable public read endpoint or server adapter, and render the first useful feed state early. Preserve CSRF protection for browser mutations. Add request deadlines and pass cancellation signals through search. Measure transfer/CPU cost before splitting bundles. **Done when:** timeouts produce usable retry UI and cold-route waterfalls have fewer sequential API dependencies.

### F15 — P2: Empty inventory produces a very long, low-value homepage

**Observed.** Public search returned zero listings. Home separately renders empty nearby, featured, and recent sections. At 390px the full page was approximately 6,149px tall, with fourteen categories in a long two-column grid before the hero, followed by repeated empty sections and informational blocks.

Source: `src/components/marketplace/homepage-content.tsx`. [Desktop home](audit-2026-09-05/home-desktop.png), [mobile home](audit-2026-09-05/home-mobile.png).

**Next:** create an explicit low-inventory experience: compact the initial category selection, offer “all categories,” consolidate empty modules, explain availability, and provide a clear publish-listing or save-search action. Recruit real initial sellers and inventory by locality/category; do not insert fake live listings. **Done when:** a first-time mobile visitor reaches a useful action quickly and inventory availability is clear.

### F16 — P2: Help search is decorative

**Code-confirmed.** The help search input has no query state, submit handler, filtering, or results. Topic cards are static articles rather than navigable help content.

Source: `src/app/help/page.tsx:24–42`.

**Next:** connect a small searchable help/FAQ catalog and topic pages, or remove the inactive search until it works. Prioritize posting, finding listings, contacting sellers, reporting abuse, and account recovery. **Done when:** common customer questions return a relevant answer and unknown queries lead to the functioning support journey.

### F17 — P2: Portuguese localization is incomplete and client-driven

**Observed and code-confirmed.** Hydrated pages switch to Portuguese, but the footer remains an English sentence and registration still says “Phone number.” Page metadata and the initial HTML language/default locale are English. Some location/filter strings are also hardcoded. This can produce language changes during startup and mixed-language experiences.

Source: `src/components/layout/marketplace-footer.tsx:56`, `src/components/forms/phone-input.tsx`, `src/i18n/config.ts:5`, `src/app/layout.tsx`, `src/providers/locale-provider.tsx:74`.

**Next:** choose locale consistently on the server for public Brazilian pages, persist preferences safely, and translate shared controls, empty/error states, metadata, and descriptive copy. Keep alternate markets explicit. **Done when:** a fresh Portuguese browser session and initial HTML agree on language, with no unexplained English fallback strings.

### F18 — P2: Sitemap coverage stops at the newest 50 listings

**Code-confirmed growth gap.** The sitemap requests one page of 50 listings and never follows `nextCursor`. Categories are included; the live zero-listing sitemap is consistent with the currently empty public search, not proof of a sitemap request failure.

Source: `src/app/sitemap.ts:16–25`.

**Next:** provide paginated/split sitemaps for all indexable published listings, accurate modification times, and consistent canonicals. Check representative category/listing HTML and noindex rules once real inventory is available. **Done when:** a dataset above 50 listings yields all intended URLs without exposing drafts/deleted/private content. Ranking and indexing require deployment and crawl evidence.

### F19 — P2: Listing authoring lacks durable in-progress recovery

**Code-confirmed UX gap.** The multi-step new-listing form keeps its editing state in React/form state; no local/session persistence or unload protection was found in the page. A page reload before saving can discard completed steps and selected files.

Source: `src/app/selling/listings/new/page.tsx`.

**Next:** autosave a server draft or carefully scoped local draft, show save status, restore text/category/location, and handle abandoned uploads explicitly. Warn only when there is unsaved work. **Done when:** a reload/network interruption preserves recoverable progress and a user can resume without starting over.

### F20 — P2: Account exit and data-management workflows need completion

**Code-confirmed gap.** The backend exposes `deactivateMyAccount`, but the inspected customer settings/service code does not expose a deactivation journey. No end-to-end account export/deletion request workflow or implemented retention schedule was found in the reviewed paths.

Source: backend `accounts/graphql/mutations.py:129`, `accounts/services.py:213`; frontend `src/services/account.service.ts`, `src/app/account/settings/page.tsx`, privacy page.

**Next:** implement authenticated account deactivation with clear consequences, provide a supported data-request route, and document what happens to listings, messages, reports, and retained operational records. Establish the intended retention/removal policy before implementing irreversible deletion. **Done when:** a customer can complete the promised account/privacy controls and staff have an auditable fulfillment process. This finding describes product implementation, not a legal compliance determination.

### F21 — P2: Offline fallback is applied to every failed GET request

**Code-confirmed.** The service worker returns the offline HTML page for any failed GET, including API, script, image, and other resource requests. A failed JSON fetch can therefore receive HTML and produce a parsing error instead of a useful connection state. Activation also does not remove old named caches.

Source: `public/sw.js`.

**Next:** limit document fallback to navigation requests, preserve appropriate failure behavior for APIs/assets, remove obsolete caches on activation, and test upgrading an already-installed worker. **Done when:** offline navigation shows the offline page while API calls show a usable disconnected/retry state without HTML-as-JSON errors.

### F22 — P3: Background-job operation and duplicate-delivery protection need evidence

**Code-confirmed risks plus an operational verification gap.** Celery tasks/schedules exist, but `railpack.json` only describes the Daphne web process. Separate Railway worker and single-scheduler operation were not verified. Readiness checks do not prove the worker is consuming jobs. Notification delivery selects pending rows and sends them without a claim/lease or overlap guard; concurrent runs can deliver the same notification twice. Image processing defaults to synchronous, including in the inspected production configuration.

Source: backend `railpack.json`, `marketlift/settings.py:321–325`, `:622`, `notifications/tasks.py:34–65`, `uploads/services.py:287–295`, `docs/OPERATIONS.md`.

**Next:** verify a worker and one beat scheduler, add heartbeat/queue-age/failed-task alerts, claim delivery batches safely, implement bounded retries and dead-letter review, and enable async image processing after the worker path is proven. **Done when:** saved-search alerts, notifications, listing expiry, abandoned-upload cleanup, and processing complete under a worker restart without lost or duplicate observable effects.

### F23 — P3: Abuse and availability controls need a combined budget

**Code-confirmed.** GraphQL read operations bypass the request-count limiter. Depth/token/alias limits protect individual requests but do not bound aggregate read volume. Rate-limit cache errors fail open. The proxy-IP trust option needs validation against the actual Railway/Cloudflare forwarding chain.

Source: backend `marketlift/security/middleware.py:94–190`, `marketlift/security/rate_limit.py:12–54`, `marketlift/graphql/schema.py`.

**Next:** add an appropriate overall query/cost budget and edge controls without breaking legitimate admin traffic; choose explicit degraded behavior for sensitive actions when Redis is unavailable. Test trusted proxy/IP parsing in staging. **Done when:** one client cannot consume unbounded read work and cache failure produces documented, observable behavior. No traffic flood or bypass attempt was run against production.

### F24 — P3: Capacity, monitoring, backups, and restore targets are not demonstrated

**Evidence gap, not a claim that provider features are absent.** Current repository documentation delegates backup/restore and monitoring to deployment. The audit did not verify Railway resource/replica settings, Neon connection capacity/PITR, R2 recovery controls, dashboards/alerts, or a successful restore. The existing search cursor carries an offset, so deep paging still needs measurement despite the signed cursor contract.

Source: backend `docs/PRODUCTION.md`, `docs/OPERATIONS.md`, `marketlift/search/backends/postgres.py:156–169`, `:451–466`, `marketlift/settings.py:685`.

**Next:** define peak traffic, dataset size, availability, recovery-point and recovery-time targets; benchmark representative queries and end-to-end flows on staging; record database/worker/Redis limits; and demonstrate a restore. Add request IDs, error collection, latency/error dashboards, queue age, and public uptime/readiness alerts. Configure field performance collection. **Done when:** the agreed peak plus headroom is supported by a reproducible run and the restore/rollback procedure has evidence.

## Recommended delivery sequence

| Pass | Work | Acceptance gate |
| --- | --- | --- |
| 1 — Production and privacy | F01–F05: schema/release alignment, realtime diagnosis, support role enforcement, real support intake, account cache isolation | Correct schema; stable readiness; role-denial and account-switch tests; customer report reaches staff |
| 2 — Daily marketplace operations | F06–F10: admin pagination/context/currency, message history, query growth, frontend CI | Records beyond initial caps remain accessible; correct BRL display; bounded query count; checks run on current commits |
| 3 — Customer experience | F11–F21: mobile reflow/contrast, error associations, stable loading, public fetches, inventory-aware home, help, locale, sitemap, drafts, account controls, offline behavior | 320px/zoom/keyboard checks; useful empty states; recoverable forms; complete customer journeys |
| 4 — Growth evidence | F22–F24: worker operations, delivery claims, abuse budgets, capacity/monitoring/restore | Measured service budgets, failure drills, queue alerts, and a successful restore |

Apply fixes in reviewable groups with tests for their actual failure modes. Keep unrelated UI layout and existing category artwork intact. Payment/identity provider integration remains outside these passes.

## Performance and accessibility acceptance targets

Use **WCAG 2.2 AA** as the accessibility target: keyboard navigation, meaningful names, associated errors, reflow/zoom, visible focus, contrast, and usable touch controls. Automated scans should be supplemented by manual screen-reader testing and authenticated listing/admin flows. Source: [W3C WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/).

For field performance, use p75 **LCP ≤2.5s, INP ≤200ms, CLS ≤0.1**, split by mobile/desktop and important routes. The browser measurements in this report are diagnostic lab samples, including warm cache effects; they do not establish INP or field performance. Source: [Google Web Vitals guidance](https://web.dev/articles/vitals).

Suggested initial internal staging budgets, to agree against the expected audience and infrastructure: p95 public search under 500ms at the API, useful error states within a bounded request timeout, stable list query counts, and an explicit queue-age objective. These are proposed project budgets, not measured achievements.

Keep the modular Django application and PostgreSQL search while fixing the measured hotspots. Consider more replicas, connection pooling, dedicated search infrastructure, or separate services only after a representative staging workload identifies the limiting component.

## Remaining validation work

- Authenticated desktop/mobile/browser coverage: create/resume/publish/edit/pause/sell/delete a listing; upload retry; favorites/follow/review; customer support; role-limited moderation and admin detail pages.
- Two-user messaging history, reconnect and unread state; weak-network tests and retry/deduplication behavior.
- Manual screen-reader testing, zoom/reflow, focus restoration, reduced motion, and authenticated dialog/form accessibility in Chromium, WebKit and Firefox.
- Deployed transactional-email delivery and recovery behavior. Source now uses the Resend backend; historical SMTP problems must not be assumed to describe the current deployment. No real email was sent during this audit.
- Controlled search/listing datasets at realistic volumes; query plans, database connection use, concurrent upload/processing, long histories and queue backlog.
- Confirm Railway's deployed commit/environment, all pending migrations, worker/beat services, monitoring and alert ownership, backup retention, and restore evidence.
- Dependency vulnerability scanning and full security testing were not performed; build/type/lint success is not a security scan.

No development server was started. Temporary browser processes closed and the disposable database/Redis containers were stopped and removed after testing. The audit branches contain documentation/evidence only; nothing was committed, pushed, merged, or deployed.
