# 📋 APInjector — Project Update Log

## Project: API Mock Server Builder (APInjector)
**Started**: 2026-03-29

---

## Update #1 — Project Inception (2026-03-29)

### What Happened
- ✅ Project rated **9.2/10** — top-tier portfolio project
- ✅ Comprehensive PRD created with full feature specifications
- ✅ Tech stack finalized:
  - **Frontend**: React 18+ with Zustand, Monaco Editor, Recharts
  - **Backend**: Spring Boot 3.x (Java 21) with WebFlux
  - **Database**: PostgreSQL 16 + Redis 7
  - **Real-time**: WebSocket + STOMP
- ✅ System architecture designed (4 architecture diagrams)
- ✅ Data models defined (6 entities with ER diagram)
- ✅ API endpoints designed (Management API + Mock Server API)
- ✅ Chaos Mode fully specified (error injection, latency spikes, malformed responses, connection drops)
- ✅ 6-week implementation roadmap created

### Tech Stack Decision
**Spring Boot** was chosen over Node.js and Go because:
1. Enterprise credibility on resume
2. Best-in-class dynamic routing capabilities
3. WebFlux perfect for chaos mode latency simulation
4. Java 21 Virtual Threads for high concurrency
5. Spring Data JPA for clean PostgreSQL integration

### Update #2 — Phase 1 Completion (2026-03-29)

### What Happened
- ✅ Initialized Spring Boot backend (`apinjector-backend`) running on H2 (File-based fallback due to Docker absence).
- ✅ Initialized React frontend (`apinjector-frontend`) using Vite.
- ✅ Designed the core database schema (`Project`, `Endpoint`, `RequestLog`).
- ✅ Implemented the Dynamic Mock Engine (`MockController.java`) using Spring WebFlux, supporting dynamic URL routing pattern `/m/{projectSlug}/**`, custom response types, and latency simulation.
- ✅ Developed dynamic frontend Dashboard mapping to API endpoints for CRUD operations.
- ✅ Added the `CreateProjectModal` and `CreateEndpointModal` to allow intuitive project layout and configuration without any signups.
- ✅ Implemented `RequestLogService` for future metrics processing.
- ✅ Ran comprehensive E2E tests validating the full creation lifecycle and successfully matched mock responses.
- ✅ Refined `README.md` to be highly concise and developer-focused.

### Next Steps (Phase 2)
- [ ] Connect `RequestLogService` to a real-time WebSocket layer.
- [ ] Build the "Logs" dashboard on the frontend to visualize incoming traffic in real-time.
- [ ] Implement and integrate "Chaos Mode" (failure/latency injection engine).
- [ ] Ensure persistence stability using H2/PostgreSQL.
