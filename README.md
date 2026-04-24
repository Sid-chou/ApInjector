<h1 align="center">
  <img src="https://img.shields.io/badge/APInjector-v2.5-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsNyA1IDEtMU0yMiAxN2wtNyA1LTEtMU0yIDEybDEwIDUgMTAtNSIvPjwvc3ZnPg==&labelColor=0f0f1a" alt="APInjector" />
</h1>

<p align="center">
  <strong>A full-stack API mock server and resilience testing platform.</strong><br/>
  Spin up live mock endpoints, simulate real-world failure scenarios, and monitor traffic in real-time — all without touching a production backend.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6db33f?style=flat-square&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-21-f89820?style=flat-square&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-dc382d?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-8b5cf6?style=flat-square" />
  <img src="https://img.shields.io/badge/Phase-2.5_Complete-22c55e?style=flat-square" />
</p>

---

## What Is APInjector?

APInjector is an **API Mock Server Builder** and **Chaos Testing Platform**. It lets you:

- **Unblock frontend development** by creating mock REST endpoints with configurable responses — no backend required.
- **Stress-test resilience** by activating Chaos Mode, which injects random 5xx errors, latency spikes, malformed responses, and connection drops on a configurable percentage of requests.
- **Monitor traffic live** through a real-time WebSocket dashboard that streams every incoming request and chaos event as it happens.

> Think Postman Mock Servers + Netflix's Chaos Monkey, combined into a single developer tool.

---

## Feature Overview

### ✅ Phase 1 & 2 — Shipped

| Feature | Description |
|---|---|
| **Dynamic Mock Engine** | Catch-all controller handles all HTTP methods on any path. No server restart needed on route changes. |
| **Project Workspaces** | Each project gets a unique base URL: `/mock/{projectId}/...` |
| **Endpoint CRUD** | Create, update, toggle (pause/play), and delete endpoints via the UI. |
| **Response Variants** | Define multiple named response variants per endpoint; activate any one instantly. |
| **Response Templating** | Use `{{faker.name.fullName}}`, `{{request.body.id}}`, `{{timestamp}}` in response bodies. Powered by Datafaker. |
| **OpenAPI / Swagger Import** | Paste or upload an OpenAPI 3.0 / Swagger 2.0 spec; endpoints are auto-generated. |
| **Latency Profiles** | Per-project and per-endpoint latency simulation: `NONE`, `FAST_LAN`, `CABLE`, `SLOW_3G`, `CUSTOM` with jitter. |
| **Chaos Mode 🔥** | Probabilistic injection of: 5xx errors, latency spikes, malformed responses, connection drops. |
| **Chaos Dashboard** | Real-time analytics: pie chart by chaos type, latency timeline, endpoint reliability bar chart. |
| **Live Request Logs** | WebSocket (native STOMP) streaming of every request with method, path, status, latency, and chaos flag. |
| **Log Filter & Export** | Filter by method/status, paginate, download as CSV or JSON. |
| **Premium Glassmorphism UI** | Dark-mode glassmorphism theme, Phosphor Icons, Outfit/Inter typography, pulse animations. |

### 🔜 Phase 3 — Planned

| Feature | Status |
|---|---|
| Monaco Editor for JSON/YAML | In Planning |
| Proxy Mode — forward & record real responses | Planned |
| Project Sharing & Team Workspaces | Planned |
| Webhook Simulation | Planned |
| GraphQL Mock Support | Planned |

---

## Architecture

```
┌─────────────────────────────────────────┐
│              React Frontend             │
│  (Projects · Endpoints · Chaos · Logs)  │
└──────────────┬──────────────────────────┘
               │ REST API (CRUD)
               ▼
┌─────────────────────────────────────────┐
│          Spring Boot (MVC)              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Filter Chain            │   │
│  │  Rate Limit → Chaos → Logging   │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │       Mock Engine               │   │
│  │  Route Match → Variant Resolve  │   │
│  │  → Template Engine → Response   │   │
│  └──────────────┬──────────────────┘   │
│                 ▼                       │
│  Async: Log → PostgreSQL               │
│  Async: Push event → WebSocket/STOMP   │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
PostgreSQL             Redis
(Configs · Logs)    (Cache · State)
```

### Request Lifecycle

```
External Client → /mock/{projectId}/users/123
        ↓
  Spring MVC Catch-All (MockController)
        ↓
  Chaos Engine — rolls dice (0–100)
    ├─ Hit error rate?    → Return 5xx
    ├─ Hit latency spike? → Thread.sleep(Xms) → Normal response
    ├─ Hit malformed?     → Truncated/wrong content-type body
    └─ Hit drop?          → response.sendError(503)
        ↓
  Normal: ResponseTemplateEngine resolves {{placeholders}}
        ↓
  Async: Persist log to PostgreSQL
  Async: Push log event via WebSocket to dashboard
```

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Zustand | 5 | Client state management |
| React Router | 7 | Client-side routing |
| Recharts | 3 | Charts for chaos analytics |
| `@stomp/stompjs` | 7 | Native WebSocket / STOMP client |
| `@phosphor-icons/react` | 2 | Icon library (Bold & Duotone) |
| Axios | 1.14.0 (pinned) | HTTP client |

### Backend

| Component | Technology |
|---|---|
| Framework | Spring Boot 3.x — Spring MVC (Servlet stack) |
| Language | Java 21 |
| Database | PostgreSQL 16 (via Docker) |
| Cache | Redis 7 (via Docker) |
| ORM | Spring Data JPA + Hibernate |
| Real-time | Spring WebSocket + STOMP |
| Fake Data | Datafaker 2.4.2 |
| API Import | swagger-parser 2.1.25 (OpenAPI 3.0 / Swagger 2.0) |
| Async | `@EnableAsync` for non-blocking log persistence |

---

## Getting Started

### Prerequisites

- **Java 21** (`java -version`)
- **Node.js 18+** (`node -v`)
- **Docker Desktop** (for PostgreSQL & Redis)
- **Maven** (or use the `mvnw` wrapper in `backend/`)

### 1 — Start Infrastructure

```bash
# From the project root
docker-compose up -d
```

This starts:
- `apinjector-db` — PostgreSQL 16 on port `5432`
- `apinjector-redis` — Redis 7 on port `6379`

### 2 — Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API server starts on **`http://localhost:8080`**.

### 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI is available at **`http://localhost:5173`**.

---

## Project Structure

```
ApiInjector/
├── backend/
│   └── src/main/java/com/apinjector/
│       ├── controller/
│       │   ├── MockController.java          # Catch-all mock route handler
│       │   ├── ProjectController.java
│       │   ├── EndpointController.java
│       │   ├── ResponseVariantController.java
│       │   ├── ImportController.java        # OpenAPI import
│       │   └── RequestLogController.java    # Paginated logs + export
│       ├── service/
│       │   ├── ChaosConfigService.java
│       │   ├── ResponseTemplateEngine.java  # {{placeholder}} resolver
│       │   ├── OpenApiImportService.java
│       │   └── RequestLogService.java
│       ├── model/                           # JPA entities
│       └── config/
│           └── WebSocketConfig.java         # Native WebSocket (no SockJS)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CreateEndpointModal.jsx
│       │   ├── EditEndpointModal.jsx
│       │   ├── ResponseVariantModal.jsx
│       │   ├── ImportSpecModal.jsx
│       │   ├── LatencyProfilePanel.jsx
│       │   └── ChaosDashboard.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx                # Projects list
│       │   └── ProjectDetail.jsx            # Live command center
│       └── store/
│           └── useStore.js                  # Zustand store
├── docker-compose.yml
└── APInjector_PRD.md                        # Full product spec
```

---

## API Reference

### Management API

```
Projects
  GET    /api/projects
  POST   /api/projects
  GET    /api/projects/{id}
  PUT    /api/projects/{id}
  DELETE /api/projects/{id}

Endpoints
  GET    /api/projects/{id}/endpoints
  POST   /api/projects/{id}/endpoints
  PUT    /api/endpoints/{id}
  PATCH  /api/endpoints/{id}/toggle
  DELETE /api/endpoints/{id}

Response Variants
  GET    /api/endpoints/{id}/variants
  POST   /api/endpoints/{id}/variants
  PUT    /api/variants/{id}
  DELETE /api/variants/{id}
  POST   /api/endpoints/{id}/activate-variant/{variantId}

OpenAPI Import
  POST   /api/projects/{id}/import/openapi

Chaos Config
  GET    /api/projects/{id}/chaos
  PUT    /api/projects/{id}/chaos

Request Logs
  GET    /api/projects/{id}/logs        (paginated)
  GET    /api/projects/{id}/logs/stats
  DELETE /api/projects/{id}/logs

WebSocket
  WS     /ws/logs/{projectId}           (native STOMP)
```

### Mock Server API

```
ALL METHODS  /mock/{projectId}/**
```

Any HTTP method to any path under `/mock/{projectId}/` is intercepted by the catch-all handler, matched against configured endpoints, and served with the active response variant (after chaos/latency processing).

---

## Chaos Mode

Chaos is configured per-project with probability percentages for each failure type:

| Chaos Type | Behavior | Dashboard Color |
|---|---|---|
| **Error Injection** | Returns a random 5xx status code | 🔴 Red |
| **Latency Spike** | `Thread.sleep()` for 2–30 seconds before responding | 🟡 Yellow |
| **Malformed Response** | Truncates JSON body or returns wrong Content-Type | 🟠 Orange |
| **Connection Drop** | Calls `response.sendError(503)` to drop the connection | 🟣 Purple |

Chaos events are streamed in real-time to the Chaos Dashboard via WebSocket.

---

## Response Templating

Use `{{` `}}` placeholders in any response body:

```json
{
  "id":    "{{request.params.id}}",
  "name":  "{{faker.name.fullName}}",
  "email": "{{faker.internet.emailAddress}}",
  "ts":    "{{timestamp}}"
}
```

Powered by [Datafaker](https://www.datafaker.net/). Supports `faker.*`, `request.body.*`, `request.params.*`, `request.query.*`, and `timestamp`.

