# 🚀 API Mock Server Builder — Product Requirements Document

## Table of Contents
1. [Project Rating](#project-rating)
2. [Executive Summary](#executive-summary)
3. [Problem Statement](#problem-statement)
4. [Target Users](#target-users)
5. [Feature Specifications](#feature-specifications)
6. [Tech Stack Analysis](#tech-stack-analysis)
7. [System Architecture](#system-architecture)
8. [Data Models](#data-models)
9. [API Design](#api-design)
10. [Chaos Mode Design](#chaos-mode-design)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Project Rating

### Overall Score: **9.2 / 10** ⭐⭐⭐⭐⭐

| Criteria | Score | Notes |
|---|---|---|
| **Real-World Relevance** | 10/10 | Every dev team needs mock servers. Direct industry applicability. |
| **Technical Depth** | 9/10 | Dynamic routing, request interception, chaos engineering — serious backend chops. |
| **System Design Showcase** | 9.5/10 | Demonstrates event-driven architecture, dynamic configuration, caching, concurrency. |
| **Interview Impact** | 9/10 | Chaos mode alone is a conversation starter. Shows you think about resilience. |
| **Frontend Polish Potential** | 8.5/10 | Request log viewer, endpoint builder UI, live dashboard — rich UI territory. |
| **Portfolio Differentiation** | 9.5/10 | Almost zero student projects do this. Postman/WireMock are your "competitors" — that's a flex. |
| **Scalability Story** | 9/10 | Can discuss horizontal scaling, Redis caching, connection pooling — all real. |
| **Difficulty (Reasonable)** | 9/10 | Hard enough to impress, achievable enough to ship in 4-6 weeks. |

### Strengths
- **Unique Niche**: No student project does this. You're in Postman/WireMock territory.
- **Chaos Engineering**: This is a Netflix-grade concept (Chaos Monkey). Adding it to a mock server is brilliant.
- **System Design Gold**: Dynamic route registration, request lifecycle, response templating — every line of backend code is interview-worthy.
- **Full Stack Story**: Backend isn't just CRUD — it's a proxy/server engine. Frontend isn't just forms — it's a real-time dashboard.

### Minor Weaknesses (-0.8)
- No ML/AI component (not necessary, but some interviewers look for it — easily fixable by adding smart response generation)
- Mock servers can seem "tooling" rather than "product" — mitigate with excellent UI/UX

---

## Executive Summary

**API Mock Server Builder** (codename: **APInjector**) is a full-stack web application that allows developers to rapidly create, configure, and manage mock API servers. Users can paste an OpenAPI/Swagger spec or manually define endpoints through an intuitive UI. The system spins up live mock servers with configurable responses, latency simulation, error injection, and a unique **Chaos Mode** for resilience testing.

> **Key Differentiator:** Chaos Mode — randomly injecting 500 errors, timeout spikes, and malformed responses on a configurable percentage of requests. This transforms it from "yet another mock tool" into a **resilience testing platform**.

---

## Problem Statement

| Pain Point | Current Solutions | Our Edge |
|---|---|---|
| Frontend devs blocked waiting for backend APIs | Postman Mock (paid tiers), WireMock (heavy setup) | Free, lightweight, instant setup via UI |
| No easy way to test frontend against API failures | Manual error injection, no automation | Chaos Mode — automated, configurable failure injection |
| Mock server configs are not shareable/versioned | Config files scattered, no central management | PostgreSQL-backed, shareable projects with history |
| Request debugging during mock development | Scattered logging, no unified view | Real-time request log viewer with filtering |

---

## Target Users

1. **Frontend Developers** — Need mock APIs while backend is in development
2. **QA Engineers** — Want to test edge cases (timeouts, 500s, malformed data)
3. **Backend Developers** — Need to prototype API contracts before implementation
4. **DevOps/SRE Teams** — Want to inject chaos into staging environments
5. **API Designers** — Want to validate OpenAPI specs with live mock responses

---

## Feature Specifications

### Phase 1: Core (MVP)

#### F1: Endpoint Definition Engine
- Manual endpoint creation via UI (method, path, headers, response body, status code)
- Path parameter support (`/users/:id`)
- Query parameter matching
- Multiple response variants per endpoint (switch between them)

#### F2: OpenAPI/Swagger Import
- Paste or upload OpenAPI 3.0 / Swagger 2.0 spec (JSON/YAML)
- Auto-generate all endpoints with example responses
- Parse `examples`, `default`, and schema-based response generation

#### F3: Live Mock Server
- Each project gets a unique base URL (`https://mock.apiinjector.dev/{project-id}/...`)
- Dynamic route registration — no server restart needed
- Request/Response logging with timestamps
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)

#### F4: Request Log Viewer
- Real-time request log dashboard
- Filter by method, path, status code, timestamp range
- Request/Response body inspection
- Export logs as JSON/CSV

### Phase 2: Advanced Features

#### F5: Response Templating
- Dynamic response bodies using template variables
- `{{request.body.name}}`, `{{request.params.id}}`, `{{faker.name}}`, `{{timestamp}}`
- Faker.js integration for realistic data generation

#### F6: Latency Simulation
- Per-endpoint configurable delay (fixed or range)
- Global latency profile (e.g., "slow 3G", "fast LAN")
- Jitter simulation (random delay within range)

#### F7: Chaos Mode 🔥
- **Error Injection**: Randomly return 500, 502, 503, 504 on X% of requests
- **Latency Spikes**: Inject random delays (2-30 seconds) on Y% of requests
- **Malformed Responses**: Return truncated JSON, wrong content-type, empty body
- **Connection Drops**: Simulate TCP reset / connection timeout
- **Per-endpoint or global chaos rules**
- **Chaos Dashboard**: Real-time view of injected failures vs normal responses

#### F8: Proxy Mode
- Forward unmatched requests to a real backend
- Record real responses and auto-create mock endpoints
- Compare mock vs real response diffs

### Phase 3: Collaboration & Polish

#### F9: Project Sharing & Teams
- Shareable project links
- Team workspaces with role-based access

#### F10: Webhook Simulation
- Define outbound webhooks triggered by mock requests
- Configurable delay and retry logic

#### F11: GraphQL Mock Support
- Define GraphQL schema and resolvers
- Auto-generate query responses from schema

---

## Tech Stack Analysis

### Frontend (Fixed: React)

| Technology | Purpose |
|---|---|
| **React 18+** | UI framework |
| **React Router v6** | Client-side routing |
| **Zustand** | Lightweight state management |
| **Monaco Editor** | Code editor for JSON/YAML editing (same editor as VS Code) |
| **Recharts** | Charts for chaos mode dashboard & request analytics |
| **React Query (TanStack Query)** | Server state management & caching |
| **Axios** | HTTP client |
| **Sonner** | Toast notifications |
| **Framer Motion** | Animations |
| **Tabler Icons** | Icon library |

### Recommended Backend Stack

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | Spring Boot 3.x (Java 21) | Enterprise standard, dynamic routing, virtual threads |
| **API Layer** | Spring WebFlux (Reactive) | Non-blocking I/O for mock server, chaos mode latency simulation |
| **Database** | PostgreSQL 16 | Relational integrity for endpoint configs, JSONB for flexible response storage |
| **Cache** | Redis 7 | Request rate tracking, session management, chaos mode state, real-time counters |
| **Message Queue** | Redis Pub/Sub | Real-time request log streaming to frontend |
| **WebSocket** | Spring WebSocket + STOMP | Live request log viewer, chaos mode dashboard |
| **ORM** | Spring Data JPA + Hibernate | Database abstraction, migrations via Flyway |
| **API Docs** | SpringDoc (OpenAPI 3) | Auto-generated API docs |
| **Auth** | Spring Security + JWT | User authentication, project-level authorization |
| **Build** | Gradle (Kotlin DSL) | Modern build system |
| **Testing** | JUnit 5 + Mockito + Testcontainers | Comprehensive testing with real PostgreSQL/Redis containers |

---

## System Architecture

### High-Level Flow

```
React Frontend
    ↓ REST API (CRUD)
Management API (Spring Boot)
    ↓
Mock Server Engine → Chaos Filter → Response Templater
    ↓                      ↓
Request Logger      Log Chaos Event
    ↓                      ↓
WebSocket (STOMP) ← ← ← ← ←
    ↑
React Dashboard (Live Logs)

Data Layer:
PostgreSQL — endpoint configs, users, projects, logs
Redis — cache, rate limits, real-time counters
```

### Request Flow

```
External Client → GET /mock/{projectId}/users/123
    ↓
Nginx → Mock Engine
    ↓
Redis cache lookup (route config)
    ↓ (cache miss → PostgreSQL → cache write)
Chaos Engine → roll dice
    ↓
Normal: Response Templater → HTTP Response
Chaos: Inject failure → HTTP Response
    ↓
Async: Persist log to PostgreSQL
Async: Push log event via WebSocket to React dashboard
```

### Filter Chain

```
AuthFilter → RateLimitFilter → ChaosFilter → LoggingFilter → Business Logic
```

---

## Data Models

### Entity Relationship

```
USER ──< PROJECT ──< ENDPOINT ──< RESPONSE_VARIANT
                  |           └──< REQUEST_LOG
                  └──< CHAOS_CONFIG
                  
ENDPOINT ──< CHAOS_RULE
```

### Key Tables

**PROJECT**
```sql
id          UUID PK
user_id     UUID FK
name        VARCHAR
slug        VARCHAR UNIQUE
base_path   VARCHAR
is_active   BOOLEAN
global_headers  JSONB
default_latency_ms  INTEGER
created_at  TIMESTAMP
```

**ENDPOINT**
```sql
id              UUID PK
project_id      UUID FK
http_method     VARCHAR       -- GET, POST, PUT, etc.
path_pattern    VARCHAR       -- /users/:id
latency_ms      INTEGER
is_active       BOOLEAN
active_variant_id  UUID FK
matching_rules  JSONB
```

**RESPONSE_VARIANT**
```sql
id          UUID PK
endpoint_id UUID FK
name        VARCHAR
status_code INTEGER
headers     JSONB
body        TEXT
content_type VARCHAR
is_template BOOLEAN
```

**REQUEST_LOG**
```sql
id              UUID PK
endpoint_id     UUID FK
project_id      UUID FK
method          VARCHAR
path            VARCHAR
request_headers JSONB
request_body    TEXT
response_status INTEGER
latency_ms      INTEGER
was_chaos       BOOLEAN
chaos_type      VARCHAR
timestamp       TIMESTAMP
```

**CHAOS_CONFIG**
```sql
id                      UUID PK
project_id              UUID FK
is_enabled              BOOLEAN
error_rate_percent      INTEGER
latency_spike_percent   INTEGER
min_spike_ms            INTEGER
max_spike_ms            INTEGER
malformed_response_percent  INTEGER
connection_drop_percent INTEGER
excluded_paths          JSONB
```

### Key PostgreSQL Design Decisions
1. **JSONB for Flexibility**: Headers, matching rules, custom error responses use `jsonb` — queryable, indexable, yet flexible.
2. **Response Variants**: Multiple response variants per endpoint allow quick switching.
3. **Separated Chaos Config**: Project-level chaos config + per-endpoint chaos rules = granular control.
4. **Request Logs**: Indexed on `project_id + timestamp` for efficient range queries.

---

## API Design

### Management API (React Frontend)

```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh

Projects:
  GET    /api/projects
  POST   /api/projects
  GET    /api/projects/{id}
  PUT    /api/projects/{id}
  DELETE /api/projects/{id}

Endpoints:
  GET    /api/projects/{id}/endpoints
  POST   /api/projects/{id}/endpoints
  PUT    /api/endpoints/{id}
  DELETE /api/endpoints/{id}

Response Variants:
  GET    /api/endpoints/{id}/variants
  POST   /api/endpoints/{id}/variants
  PUT    /api/variants/{id}
  DELETE /api/variants/{id}
  POST   /api/endpoints/{id}/activate-variant/{variantId}

Import:
  POST   /api/projects/{id}/import/openapi

Chaos:
  GET    /api/projects/{id}/chaos
  PUT    /api/projects/{id}/chaos
  GET    /api/endpoints/{id}/chaos
  PUT    /api/endpoints/{id}/chaos

Logs:
  GET    /api/projects/{id}/logs        -- paginated
  DELETE /api/projects/{id}/logs
  GET    /api/projects/{id}/logs/stats

WebSocket:
  WS     /ws/logs/{projectId}           -- real-time log stream
```

### Mock Server API (External Consumers)

```
ALL METHODS  /mock/{projectSlug}/**     -- catch-all dynamic route handler
```

---

## Chaos Mode Design

### Chaos Decision Flow

```
Incoming Request
    ↓
Chaos Enabled?
  NO  → Normal Response
  YES → Roll Random (0-100)
            ↓
        Roll ≤ Error Rate%?     YES → Return 5xx Error → Log Chaos Event
            ↓ NO
        Roll ≤ Latency Spike%?  YES → Add Random Delay → Normal Response
            ↓ NO
        Roll ≤ Malformed%?      YES → Truncated/Wrong Content-Type Response
            ↓ NO
        Roll ≤ Connection Drop%? YES → Reset Connection
            ↓ NO
        Normal Response
            ↓
        Push Chaos Event via WebSocket → Dashboard
```

### Chaos Types

| Chaos Type | Implementation | Dashboard Display |
|---|---|---|
| **500 Errors** | Return random 5xx | 🔴 Red flash on log entry |
| **Latency Spikes** | `Mono.delay()` with random duration | 🟡 Yellow with delay badge |
| **Malformed JSON** | Truncate body at random point | 🟠 Orange with "malformed" tag |
| **Connection Drop** | Close socket stream mid-response | 🟣 Purple with "dropped" tag |
| **Header Chaos** | Remove/add garbage headers | 🔵 Blue with "headers" tag |

### Chaos Dashboard Metrics (Real-time)
- Total Requests (last 5 min / 1 hr / 24 hr)
- Chaos Injection Rate (actual % vs configured %)
- Breakdown by Chaos Type (pie chart)
- Request Timeline (line chart with chaos events highlighted)
- Endpoint Reliability Score (success rate per endpoint)

---

## Implementation Roadmap

### 2-Week MVP Plan

| Days | Backend | Frontend |
|---|---|---|
| 1–2 | Spring Boot setup, PostgreSQL schema, Project + Endpoint CRUD | React + Vite + Zustand setup |
| 3–4 | Catch-all mock controller, dynamic route matching | Dashboard + Project View pages |
| 5 | Chaos filter — error injection + latency simulation | Endpoint Builder with Monaco Editor |
| 6–7 | Async request logger, WebSocket (STOMP) setup | Real-time Log Viewer |
| 8–9 | Redis caching for route configs | Chaos Control Panel UI |
| 10 | Deploy on Render (backend + DB) | Deploy on Vercel (frontend) |
| 11–12 | Bug fixes, performance tuning | UI polish, README + demo GIF |

### 4–6 Week Full Build

**Phase 1 (Week 1–2):** Foundation — Auth, Project CRUD, Basic Mock Server

**Phase 2 (Week 3–4):** Core Features — Response Variants, OpenAPI Import, Request Logging, WebSocket Logs, Latency Sim

**Phase 3 (Week 5):** Chaos Mode — Filter chain, Chaos config API, Real-time chaos dashboard

**Phase 4 (Week 6):** Polish — Response Templating, Proxy Mode, Performance optimization, Testing, Docs

---

## Success Metrics

| Metric | Target |
|---|---|
| Mock server response time (P99) | < 50ms (without latency sim) |
| Concurrent mock connections | 1000+ |
| OpenAPI import time (1000 endpoints) | < 5 seconds |
| Real-time log latency (request → UI) | < 200ms |
| Chaos mode accuracy (actual vs configured %) | Within ±2% over 1000 requests |

---

## Interview Talking Points

| Question | Your Answer |
|---|---|
| "Tell me about a challenging system design" | Dynamic route registration at runtime |
| "How do you handle concurrency?" | Java 21 Virtual Threads + Reactive WebFlux |
| "Describe your database design" | JSONB flexibility, partitioning strategy, indexing |
| "How do you handle real-time data?" | WebSocket + STOMP + async event publishing |
| "What's your testing strategy?" | Testcontainers for integration tests with real DB |
| "How do you ensure reliability?" | The chaos mode IS the reliability lesson |
| "How do you handle caching?" | Redis cache-aside for route configs, invalidation on update |
| "Tell me about a unique feature" | **Chaos Mode.** |

---

## Resume Bullets

**APInjector — API Mock & Chaos Testing Platform** | GitHub | Live Demo

`Spring Boot` `React` `TypeScript` `PostgreSQL` `Redis` `WebSocket` `Java 21`

▷ Engineered a runtime mock server engine in Spring Boot with dynamic route registration and a filter chain pipeline (Rate Limit → Chaos → Logging), handling all HTTP methods via a catch-all controller with path parameter resolution — no server restart required on endpoint changes.

▷ Built a per-endpoint Chaos Injection system simulating configurable error rates, latency spikes, and malformed responses, paired with a React real-time request log dashboard over WebSocket (STOMP) — giving frontend teams live visibility into API instability before production.
