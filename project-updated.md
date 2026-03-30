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

## 🚀 Next Priority: Phase 3 — Dynamic Response Templating

The next major feature is adding intelligence to the mock responses:
1.  **Variable Injection**: Use `{{request.body.id}}` or `{{request.query.name}}` in responses.
2.  **Data Generation**: Integrate a generator (Faker-style) for `{{faker.name}}`, `{{faker.email}}`, etc.
3.  **Conditional Logic**: (Optional) Simple if/else for different response scenarios.
