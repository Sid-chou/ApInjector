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

## Test Results — All Passing ✅

| Test | Result |
|------|--------|
| `node test.js` — basic mock endpoint E2E | ✅ PASSED — `{"message":"hello world"}` 200 |
| `node test_chaos.js` — 100% chaos error rate | ✅ PASSED — Received expected 500 |

---

## Current Architecture

```
Backend: Spring Boot 3.4.4 (MVC + JPA + WebSocket/STOMP)
DB:      H2 file-based (./data/apinjectordb)
Port:    8080
```

### Active Features
- ✅ Project CRUD (`/api/projects`)
- ✅ Endpoint CRUD (`/api/projects/{id}/endpoints`)
- ✅ Dynamic mock server (`/m/{slug}/{path}`)
- ✅ Chaos Engine (error rate, latency spike, malformed body, connection drop)
- ✅ Chaos Config API (`GET/PUT /api/projects/{id}/chaos`)
- ✅ Request logging (async, persisted)
- ✅ WebSocket/STOMP live log streaming (`/ws` → `/topic/logs/{projectId}`)

### Next Phase Options
- Response Templating (Faker.js-style dynamic data)
- OpenAPI Schema Importer
- Frontend dashboard improvements
