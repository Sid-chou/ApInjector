# APInjector — Project Update Log

## 2026-03-30 — Critical Stack Fix & Full E2E Verification ✅

### Problem Diagnosed & Fixed

Three root-cause bugs were found and fixed:

---

### Bug 1 — CRITICAL: Wrong Spring Stack (WebFlux vs MVC)
**File:** `pom.xml`

The `pom.xml` had `spring-boot-starter-webflux` which boots a **Reactive (Netty)** application context. However all repositories, services, and `@Transactional` code are **blocking JPA** — fundamentally incompatible. This caused Spring's JPA repository scanner to find **0 repositories**, making every request crash with a 500 server error.

**Fix:** Replaced `spring-boot-starter-webflux` with `spring-boot-starter-web` (MVC / Servlet stack). Also removed `reactor-test` and `reactor-core` dependencies.

---

### Bug 2 — MockController Using WebFlux Types in an MVC Context
**File:** `controller/MockController.java`

`MockController` returned `Mono<ResponseEntity<String>>` and used `ServerWebExchange` — both WebFlux types — while running on a Servlet stack. This caused a 500 on every mock request.

**Fix:** Rewrote `MockController` as a standard Spring MVC `@RestController`:
- Returns `ResponseEntity<String>` (synchronous)
- Uses `HttpServletRequest` / `HttpServletResponse`
- Uses `Thread.sleep(ms)` for latency simulation
- Uses `response.sendError(503)` for connection drop chaos

---

### Bug 3 — `ChaosConfigService.getByProjectId()` Marked `readOnly=true` But Saves
**File:** `service/ChaosConfigService.java`

The method auto-creates and saves a default `ChaosConfig` when none exists, but was annotated `@Transactional(readOnly=true)`. This silently prevented saving new chaos configs.

**Fix:** Changed annotation to `@Transactional`.

---

### Bug 4 — H2 In-Memory DB Reset on Every Restart
**File:** `src/main/resources/application.properties`

The DB was configured as `jdbc:h2:mem:testdb` — data was lost on every server restart, breaking `test.js`.

Also the file was encoded as UTF-16LE, causing Spring to fail to parse it.

**Fix:** Changed to file-based H2: `jdbc:h2:file:./data/apinjectordb`, rewrote as UTF-8.

---

### Other Improvements
- Added `@EnableAsync` to `ApinjectorApplication` so `RequestLogService.saveLog()` actually runs asynchronously
- Added `spring.jpa.open-in-view=false` to suppress startup warning

---

### Bug 5 — WebSocket Connection Failure (SockJS Mismatch)
**File:** `config/WebSocketConfig.java`

**Problem:** Frontend `@stomp/stompjs` v7 was sending raw native WebSocket requests (`ws://`), while the backend was configured with `.withSockJS()`. Native WebSockets and SockJS handshakes are incompatible.

**Fix:** Removed `.withSockJS()` from the backend to allow direct native WebSocket connections.

---

### Bug 6 — Git Tracking Sensitive/Generated Files
**File:** `.gitignore`

**Problem:** Git was tracking `application.log`, `backend.log`, and the backend `.m2` folder, which should be local-only.

**Fix:** Updated `.gitignore` with comprehensive patterns for logs, Maven caches, and H2 data files.

---

## Final Phase 2 Status — COMPLETED ✅

All core features for Phase 1 and 2 are now functional, tested, and pushed to the repository.

### Active Features
- ✅ Project & Endpoint Management
- ✅ Dynamic Mock Engine with path stripping
- ✅ **Chaos Engine**: Injects errors, latency, and drops based on % probability
- ✅ **Real-time Monitoring**: WebSocket/STOMP streaming of every request to the dashboard
- ✅ **Persistence**: Data survives restarts via file-based H2

---

## 2026-03-30 — Phase 2.5 Completion: Premium Visual Excellence ✅

Started and completed a full design overhaul to meet high aesthetic standards and icon rule compliance.

### Improvements & Brand Refresh
- **Design System**: Implemented a **Glassmorphism** theme with `backdrop-filter`, radial gradients, and modern slate/indigo color palettes.
- **Icon Migration**: 100% migration from `lucide-react` to **Phosphor Icons** (Bold & Duotone variants).
- **Typography**: Configured **Outfit** (Headings) and **Inter** (Body) via Google Fonts.
- **Monitoring Station**: Refined the Project Detail page as a real-time command center with a live STOMP "heartbeat" pulse.
- **Chaos Dashboard**: Redesigned the Chaos Control panel with glowing active states and high-tech sliders.
- **Code Editor**: Integrated a dark-themed JSON editor view in the deployment modals.

---

## Final Phase 2.5 Status — COMPLETED ✅

The project is now visually premium and operationally stable.

### Active Features
- ✅ **Full CRUD**: Projects and Endpoints management.
- ✅ **Dynamic Mock Engine**: Handles nested paths and automatic URL stripping.
- ✅ **Chaos Mode**: Real-time error, latency, and connection drop injection.
- ✅ **Live Monitoring**: Native STOMP streaming of request logs.
- ✅ **Premium UI**: Glassmorphism, Pulse animations, and Phosphor icon sets.
- ✅ **Infrastructure**: File-based persistence and MVC-stable Spring stack.

---

## 2026-03-31 — Phase 1 & 2 Feature Completion ✅

Completed all incomplete Phase 1 and Phase 2 features from the PRD.

### New Backend Files
- `model/ResponseVariant.java` — JPA entity for named response variants per endpoint
- `repository/ResponseVariantRepository.java` — CRUD + endpoint-scoped queries
- `service/ResponseVariantService.java` — CRUD + activateVariant / deactivateVariant
- `controller/ResponseVariantController.java` — Full REST API for variants
- `service/ResponseTemplateEngine.java` — `{{placeholder}}` variable resolver with Datafaker integration
- `service/OpenApiImportService.java` — Parses OpenAPI 3.0/Swagger 2.0 specs, auto-creates endpoints
- `controller/ImportController.java` — `POST /api/projects/{id}/import/openapi`
- `controller/RequestLogController.java` — Paginated logs, stats, CSV/JSON export, clear

### Modified Backend Files
- `model/Endpoint.java` — Added `isTemplate`, `activeVariantId`, `variants` OneToMany
- `model/Project.java` — Added `latencyProfile`, `globalLatencyMs`, `jitterMs`
- `controller/EndpointController.java` — Added `PUT /{id}` (update) and `PATCH /{id}/toggle`
- `controller/ProjectController.java` — Added `PUT /{id}` (update project settings)
- `controller/MockController.java` — Full refactor: variant resolution, template engine, latency profiles
- `service/EndpointService.java` — Added `updateEndpoint()`, `toggleEndpoint()`, `findById()`
- `service/ProjectService.java` — Added `updateProject()`
- `service/RequestLogService.java` — Added paginated queries, stats aggregation, CSV/JSON export
- `repository/RequestLogRepository.java` — Extended with paged queries, stats JPQL, delete by project
- `pom.xml` — Added `net.datafaker:datafaker:2.4.2` and `io.swagger.parser.v3:swagger-parser:2.1.25`

### New Frontend Files
- `components/EditEndpointModal.jsx` — Pre-filled edit modal with template toggle + placeholder hints
- `components/ResponseVariantModal.jsx` — Variant list, create, activate, deactivate UI
- `components/ImportSpecModal.jsx` — OpenAPI paste/upload with result summary
- `components/LatencyProfilePanel.jsx` — NONE/FAST_LAN/CABLE/SLOW_3G/CUSTOM with jitter slider
- `components/ChaosDashboard.jsx` — Analytics: stat cards, PieChart, LineChart timeline, reliability BarChart

### Modified Frontend Files
- `store/useStore.js` — Complete overhaul with all new actions
- `components/CreateEndpointModal.jsx` — Added template toggle + placeholder hints
- `pages/ProjectDetail.jsx` — Full overhaul: all buttons wired, filter bar, tab toggle, pagination, export

### Phase 1 & 2 Feature Status
- ✅ **Endpoint Update & Toggle** — Edit and Pause/Play buttons fully functional
- ✅ **Response Variants** — Create, name, and activate alternative responses per endpoint
- ✅ **Response Templating + Faker** — `{{faker.name.fullName}}`, `{{request.body.id}}`, etc.
- ✅ **OpenAPI/Swagger Import** — Auto-generate endpoints from spec JSON/YAML
- ✅ **Latency Profiles** — NONE/FAST_LAN/CABLE/SLOW_3G/CUSTOM with jitter ± range
- ✅ **Request Log Filter, Pagination & Export** — Filter by method/status, paginate, CSV/JSON download
- ✅ **Chaos Dashboard Analytics** — Pie chart, latency timeline, endpoint reliability BarChart

---

## 🚀 Next Priority: Phase 3

### Deferred to Phase 3
- [ ] **Monaco Editor** — Replace textarea with VS Code editor for JSON/YAML (In Planning)
- [ ] **Proxy Mode (F8)** — Forward unmatched requests to real backend, record responses
- [ ] **Project Sharing & Teams (F9)** — Auth, shareable links, role-based access
- [ ] **Webhook Simulation (F10)** — Outbound HTTP on mock request event
- [ ] **GraphQL Mock Support (F11)** — Schema-based resolver mocking

---

## 2026-04-03 — Comprehensive Code Audit ✅

Performed a full system check to identify missing features and technical debt.

### Audit Findings
- **Frontend**: All Phase 2 features (Chaos, Variants, Latency) are functional and polished. Monaco Editor is the most immediate visual upgrade needed.
- **Backend**: Core engine is stable. `ResponseTemplateEngine` is functional but could be extended for nested JSON.
- **Infrastructure**: Persistence and real-time streaming are verified.

### Updated Roadmap for Phase 3
1. **Monaco Integration**: Enhancing the developer experience with a real IDE-like editor.
2. **Security & Auth**: Foundations for multi-user support.
3. **Traffic Recording (Proxy Mode)**: Helping users migrate from real APIs to mocks instantly.

---

## 2026-04-03 — Security Patch: Axios Supply Chain Mitigation ✅

Addressed the critical supply chain attack on the `axios` npm package (versions `1.14.1` and `0.30.4`).

### Security Intervention
- **Vulnerability**: Malicious versions published on March 31, 2026, containing a Remote Access Trojan (RAT).
- **Action Taken**: Pinned `axios` to exactly `1.14.0` in both root and frontend `package.json` files.
- **Verification**: 
    - Confirmed existing `node_modules` were on `1.14.0` (SAFE).
    - Found no traces of `plain-crypto-js` (the malicious phantom dependency).
    - Removed caret (`^`) prefixes to prevent accidental upgrades to the compromised versions.

---

## 2026-04-06 — Frontend Performance Optimization: Glassmorphism GPU Compositing ✅

Optimized the CSS for glassmorphism components to improve rendering performance and reduce UI lag.

### Changes & Optimizations
- **File:** `frontend/src/index.css`
- **GPU Acceleration**: Added `will-change: transform` and `transform: translateZ(0)` to all glassmorphic elements (`.glass-card`, `.navbar`, and a new `.glass` utility). This forces the browser to promote these elements to their own GPU layer, preventing expensive re-paints during scrolls and animations.
- **Utility Class**: Added a reusable `.glass` utility class for quick application of optimized glassmorphism.
- **Cross-Browser**: Ensured `-webkit-backdrop-filter` is consistently applied for Safari compatibility.

---

## 2026-04-23 — README Overhaul ✅

Completely rewrote `README.md` from a 24-line stub into a comprehensive project reference document.

### What Was Added
- **Badges**: Tech stack badges (Spring Boot, React, Java 21, PostgreSQL, Redis, WebSocket, Phase status).
- **Feature Table**: Full Phase 1 & 2 feature matrix with descriptions; Phase 3 roadmap table.
- **Architecture Diagram**: ASCII art of the system architecture and full request lifecycle flow.
- **Tech Stack Tables**: Separate frontend and backend tables with versions and purposes.
- **Getting Started**: Step-by-step setup guide covering Docker, backend, and frontend startup.
- **Project Structure**: Annotated file tree highlighting key files and their roles.
- **API Reference**: Full management API endpoint listing + mock server catch-all description.
- **Chaos Mode Table**: Per-chaos-type behavior and dashboard color coding.
- **Response Templating**: Example JSON showing `{{faker.*}}` and `{{request.*}}` syntax.
- **Security Note**: Documented the Axios supply-chain vulnerability and the pinning fix.
- **Changelog Highlights**: Summary table linking to `project-updated.md` for full history.
- **Project Rating Table**: Pulled from PRD internal review scores.
