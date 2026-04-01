# APInjector — Interview Q&A Guide

> [!IMPORTANT]
> Every answer below is grounded in your **actual code**. Reference file names and class names when you are speaking to interviewers — it shows depth and ownership.

---

## 🏗️ System Design

---

### Q1. "Walk me through the architecture of your APInjector project."

**A:**
APInjector is a full-stack API mocking and chaos testing platform. At a high level, it has three layers:

1. **Management API** (`/api/...`): A standard Spring Boot REST API that handles CRUD for Projects, Endpoints, and Chaos configuration. The React frontend talks to this layer.

2. **Mock Engine** (`/m/{projectSlug}/**`): A catch-all `@RequestMapping` in `MockController.java` that intercepts every HTTP call at runtime. It resolves the project by slug, finds the matching endpoint, runs the chaos evaluation, simulates latency with `Thread.sleep()`, and returns the configured response — all without any server restart.

3. **Real-Time Layer**: After returning the response, we asynchronously save a `RequestLog` via `@Async`, then use `SimpMessagingTemplate` in `LogEventPublisher.java` to push that log over STOMP/WebSocket to the React dashboard at the topic `/topic/logs/{projectId}`.

The database is H2 (file-based for local dev, designed to swap to PostgreSQL in production), using JPA entities with UUID primary keys.

---

### Q2. "How does your dynamic route matching work without restarting the server?"

**A:**
The key insight is that I use a single **catch-all route pattern** — `@RequestMapping("/{projectSlug}/**")` in `MockController.java` — rather than registering individual routes. So Spring Boot's servlet mapping never changes.

The "dynamic" part happens in code:
1. I parse the incoming URI: strip the `/m` prefix, extract the `projectSlug` from `parts[1]`, and reconstruct the `mockPath` from `parts[2]`.
2. I call `endpointService.findMatch(project, method, mockPath)` which does a database query to find a matching endpoint by HTTP method and path pattern.
3. Since endpoint configs are just database records, adding/removing them via the UI requires zero server-side changes.

The trade-off I made was simplicity over caching. A production version would cache the route table in Redis using a cache-aside pattern to avoid a DB hit per mock request.

---

### Q3. "Why did you choose Spring MVC over Spring WebFlux for this project?"

**A:**
This was actually a critical bug I had to debug and fix. The initial setup had `spring-boot-starter-webflux`, which runs on **Netty** with a reactive, non-blocking model. However, all my repositories and services used **Spring Data JPA**, which is fundamentally blocking I/O.

JPA uses a thread-per-request Servlet model and connection pools — it's incompatible with reactive pipelines without project Reactor wrappers. The symptom was Spring's JPA repository scanner reporting 0 repositories found, causing 500 errors on every request.

The fix was switching to `spring-boot-starter-web` (Spring MVC). For latency simulation, instead of `Mono.delay()`, I use `Thread.sleep()` on the servlet thread — this is safe because each request has its own dedicated thread in the MVC model, so sleeping it doesn't block other requests.

---

## ⚡ Chaos Engineering

---

### Q4. "Explain how your Chaos Engine works. Walk me through the code."

**A:**
The `ChaosEngine.java` is a stateless `@Service` that takes a `ChaosConfig` and returns a `ChaosResult` (a Lombok `@Builder` value object).

The decision logic is a **percentage-threshold cascade**:

```java
int roll = random.nextInt(100); // 0–99
int currentThreshold = 0;

currentThreshold += config.getErrorRatePercent();
if (roll < currentThreshold) → inject 5xx error

currentThreshold += config.getConnectionDropPercent();
if (roll < currentThreshold) → drop connection

currentThreshold += config.getMalformedResponsePercent();
if (roll < currentThreshold) → truncate the JSON body

currentThreshold += config.getLatencySpikePercent();
if (roll < currentThreshold) → Thread.sleep(randomMs)
```

Each chaos type is **mutually exclusive** — a single request can only experience one type of failure. The rolling threshold approach means if I set `errorRate=20%` and `latency=10%`, then:
- Roll 0–19 → Server Error (20%)
- Roll 20–29 → Connection Drop (10%)
- Roll 30–99 → Normal

The `ChaosResult` is checked in `MockController.java`, which applies the result: override the status code, truncate the body, or call `Thread.sleep()`.

---

### Q5. "What is Chaos Engineering and why did you implement it in a mock server?"

**A:**
Chaos Engineering is the discipline of deliberately injecting failures into a system to discover weaknesses before they hit production. Netflix's Chaos Monkey is the famous example — it randomly terminates production instances to ensure the system is resilient to node failures.

I applied it to a mock server because **frontend teams and QA engineers have no easy way to test how their application handles real API failures**. With my Chaos Mode:
- A QA engineer can set error rate to 30% and verify their UI shows a proper error toast or fallback state.
- A frontend dev can test retry logic and loading spinners under latency spikes.
- An SRE can configure real-world failure distributions to validate monitoring and alerting.

This transforms APInjector from a simple stubbing tool into a **resilience testing platform** — which is the core differentiator vs. tools like Postman Mock or WireMock.

---

### Q6. "How would you improve the Chaos Engine in a production system?"

**A:**
Several improvements I'd make:

1. **Remove mutual exclusivity**: In real chaos, a request can be both slow AND return a 500. I'd evaluate each chaos dimension independently.
2. **Per-endpoint rules**: Currently, chaos is project-wide. I'd add a `ChaosRule` entity per endpoint for surgical control.
3. **Redis-backed state**: To avoid a DB query on every mock request, I'd cache the `ChaosConfig` in Redis with a TTL, invalidating the cache on each config update.
4. **Chaos schedule**: Add time-window based activation (e.g., "inject chaos only Mon-Fri 9am-5pm") to simulate business-hours load patterns.
5. **Circuit Breaker pattern**: Expose chaos stats so consumers can implement a circuit breaker that trips when error rate exceeds a threshold.

---

## 🔌 Real-Time & WebSocket

---

### Q7. "How does real-time request logging work in your system?"

**A:**
The flow is: **HTTP Request → Mock Controller → Async Log Save → WebSocket Push → React Dashboard**.

After the mock request is handled and a response is sent:
1. `requestLogService.saveLog(...)` is annotated with `@Async`. Because I added `@EnableAsync` to the main application class, Spring runs this in a separate thread pool — the HTTP request thread is freed immediately and the client gets their response without waiting for DB writes.
2. Inside `RequestLogService`, after saving the log to H2, it calls `LogEventPublisher.publishLog(log)`.
3. `LogEventPublisher` uses Spring's `SimpMessagingTemplate` to push the log as JSON to the STOMP topic `/topic/logs/{projectId}`.
4. The React frontend subscribes to this exact topic using `@stomp/stompjs` and appends each incoming log entry to the live dashboard in real time.

---

### Q8. "Why did you remove SockJS from the WebSocket config?"

**A:**
This was a protocol mismatch bug. SockJS is a **fallback library** — it first tries native WebSocket, and if that fails, falls back to long-polling or XHR streaming. It uses a custom HTTP handshake, not a raw `ws://` upgrade.

The modern `@stomp/stompjs` v7 (used in the React frontend) connects directly via `new WebSocket("ws://...")` — a native WebSocket, NOT a SockJS client. When the backend had `.withSockJS()` enabled, the server expected a SockJS handshake and the native WebSocket client sent an incompatible upgrade request, causing the connection to fail immediately.

The fix was simple: remove `.withSockJS()` from `WebSocketConfig.java`. The config now just registers the `/ws` endpoint and allows all origins. This is the right approach when your client explicitly supports native WebSocket.

---

## 🗄️ Database Design

---

### Q9. "Walk me through your data model. Why UUIDs as primary keys?"

**A:**
The core entity graph is: `PROJECT` → `ENDPOINT` → `REQUEST_LOG`, with a `CHAOS_CONFIG` in a 1:1 relationship with `PROJECT`.

In JPA, I modeled this with:
- `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` on Project's endpoint list — deleting a project cascades to all its endpoints and logs automatically.
- `@OneToOne(fetch = FetchType.LAZY)` for `ChaosConfig` — lazy fetching prevents loading the chaos config on every project query unless specifically needed.
- `@JsonIgnore` on bidirectional relationships to prevent infinite JSON serialization loops.

**Why UUIDs?** Two reasons:
1. **Security** — Sequential integer IDs can be enumerated (`/project/1`, `/project/2`). UUIDs are non-guessable.
2. **Distributed readiness** — UUIDs can be generated client-side or across multiple app instances without coordination. If this app ever needed to shard or merge databases, UUID PKs avoid ID collisions.

The trade-off is slightly larger index size (~16 bytes vs 4 bytes for int), but for this scale, it's negligible.

---

### Q10. "Why did you use a file-based H2 database instead of in-memory?"

**A:**
Initially the database was configured as `jdbc:h2:mem:testdb`. The issue was that every time the Spring Boot server restarted (which happens constantly in development), all data was wiped. Mock endpoints, project configurations, chaos settings — gone. This made testing and development extremely frustrating.

I switched to `jdbc:h2:file:./data/apinjectordb`. H2 in file mode persists data to disk, giving the same development convenience (no PostgreSQL install needed) with data durability.

There was also a secondary bug: the `application.properties` file was encoded as **UTF-16LE** (likely due to a Windows text editor), which caused Spring's properties parser to fail silently with garbled config values. I rewrote it as UTF-8 to fix this.

For production, the config would swap to a proper `jdbc:postgresql://...` URL via environment variable overrides — H2 is a dev-only dependency.

---

## 🎨 Frontend & Full Stack

---

### Q11. "How does the React frontend communicate with the backend for real-time logs vs. regular data?"

**A:**
There are two distinct communication channels:

1. **REST (Axios + React Query)**: All CRUD operations — creating projects, adding endpoints, updating chaos config — go through standard HTTP REST calls. React Query manages server state caching, refetching, and loading states automatically.

2. **STOMP over WebSocket**: For the live monitoring dashboard, the frontend establishes a persistent WebSocket connection to `ws://localhost:8080/ws` using `@stomp/stompjs`. It then subscribes to `/topic/logs/{projectId}`. The backend pushes a JSON-serialized `RequestLog` object to this topic whenever a mock request is processed. The frontend appends it to the live log feed instantly — no polling needed.

This is the right architectural split: REST for write operations and initial data loads, WebSocket for streaming real-time events. Polling would introduce unnecessary load and latency.

---

### Q12. "What was the hardest bug you debugged in this project?"

**A:**
The hardest was the **WebFlux vs. MVC incompatibility** causing 0 JPA repositories being detected.

The symptom was confusing: the app would start fine, but every API call returned a 500 with `UnsatisfiedDependencyException`. The error message mentioned repository beans not found.

My debugging process:
1. Checked the stack trace — saw it was a Spring context initialization failure, not a runtime error.
2. Read the Spring Boot auto-configuration log (set `logging.level.org.springframework=DEBUG`) — noticed the JPA autoconfiguration was being skipped.
3. Realized the `spring-boot-starter-webflux` dependency was importing `spring-webflux` and booting a **Reactive Application Context**, which doesn't load Spring MVC or traditional JPA auto-config.
4. The fix was replacing `spring-boot-starter-webflux` with `spring-boot-starter-web` and removing all `Mono`/`Flux` types from the codebase.

The lesson: in Spring Boot, the starter dependency you choose fundamentally determines the application context type, and mixing reactive and blocking paradigms without proper bridges causes silent failures that are hard to trace without deep understanding of Spring's auto-configuration model.

---

## 🧠 Design Decisions

---

### Q13. "How would you scale this to support 10,000 concurrent mock users?"

**A:**
The current setup has a single Spring Boot instance doing everything. To scale:

1. **Redis Route Cache**: Every mock request currently hits H2/PostgreSQL for endpoint lookup. Cache-aside pattern: on first hit, load from DB → cache in Redis with a `{projectSlug}:{method}:{path}` key. Invalidate on endpoint update. This drops DB load by ~95% for read-heavy mock traffic.

2. **Async Logging**: Already done with `@Async`. At high scale, upgrade to a message queue (Kafka/Redis Streams) — separate log-writing workers consume from the queue, preventing DB write bottlenecks from affecting mock response latency.

3. **Horizontal Scaling**: The mock engine is stateless (no local state per request). Multiple instances behind a load balancer work immediately if Redis handles shared state.

4. **Java 21 Virtual Threads**: Replace `Thread.sleep()` latency simulation with `Thread.currentThread().isVirtual()` checks. Virtual threads are extremely lightweight — `Thread.sleep()` on a virtual thread parks it without blocking an OS thread, enabling millions of concurrent simulated latency requests without thread pool exhaustion.

---

### Q14. "If you were to add authentication, how would you do it?"

**A:**
I'd use Spring Security with **JWT (stateless tokens)**.

Architecture:
1. `POST /api/auth/register` and `POST /api/auth/login` are public endpoints that return a signed JWT.
2. Every other API request carries the JWT in the `Authorization: Bearer {token}` header.
3. A `JwtAuthFilter` (extending `OncePerRequestFilter`) intercepts each request, validates the JWT signature and expiry, extracts the `userId`, and sets a `UsernamePasswordAuthenticationToken` in the `SecurityContextHolder`.
4. The mock server endpoint (`/m/**`) stays **public** — it's designed to be called by external clients without auth. Project-level access control is enforced at the management API layer.
5. For multi-tenancy, every service method adds a `.findByIdAndUserId(id, currentUserId)` filter so users can only see their own projects.

Refresh tokens would be stored in an `HttpOnly` cookie (not localStorage) to prevent XSS theft, with a short-lived access token (15 min) and longer refresh token (7 days).

---

## 💡 Quick-Fire Conceptual Questions

---

### Q15. "What is the difference between a mock server and a proxy server?"

**A:**
- A **mock server** returns pre-configured, fake responses. It never touches a real backend. Used when the backend doesn't exist yet or for isolated testing.
- A **proxy server** forwards requests to a real backend and relays the response. Used for traffic inspection, caching, or modification.

APInjector is primarily a mock server. The PRD includes a planned **Proxy Mode** (Phase 3) where unmatchted requests are forwarded to a real backend, real responses are recorded, and mock endpoints are auto-created from them — bridging both worlds.

---

### Q16. "What is STOMP and why use it over raw WebSocket?"

**A:**
Raw WebSocket is a bidirectional binary/text stream — it has no concept of topics, subscriptions, or message routing. If you have 100 project dashboards open simultaneously, you'd have to manually manage which client gets which log event.

**STOMP (Simple Text Oriented Message Protocol)** is a messaging protocol built on top of WebSocket that adds:
- **Topics**: Clients subscribe to `/topic/logs/{projectId}`, and only get messages published to their specific topic.
- **Pub/Sub**: Spring's `SimpMessagingTemplate` acts as an in-memory broker, routing messages to the right subscribers automatically.
- **Message headers**: Framing, content-type, and acknowledgement metadata.

In my case, `SimpMessagingTemplate.convertAndSend("/topic/logs/{projectId}", logEntry)` automatically serializes the `RequestLog` to JSON and delivers it only to clients subscribed to that specific project's topic.

---

### Q17. "What does `CascadeType.ALL` with `orphanRemoval = true` mean in JPA?"

**A:**
- `CascadeType.ALL` means all JPA operations on the parent (persist, merge, remove, refresh, detach) are cascaded to child entities. If I save a `Project`, JPA also saves its `Endpoint` children. If I delete a Project, JPA also deletes all associated Endpoints.
- `orphanRemoval = true` is specifically for the **remove-from-collection** case. If I call `project.getEndpoints().remove(endpoint)` (removing it from the Java list without calling `entityManager.remove()`), JPA treats the now-orphaned child as deleted and issues a `DELETE` SQL statement automatically.

Together, they ensure referential integrity is managed at the ORM level, not just at the database level, making the API safer and simpler to work with.

---

> [!TIP]
> When answering, always be specific: name the class (`ChaosEngine.java`), describe the pattern (`cascade threshold rolling`), and mention the trade-off you considered. That's what separates a good answer from a great one.
