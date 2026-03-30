# APInjector

APInjector is a full-stack, dynamic API mock server and resilience testing tool. It allows developers to quickly spin up mock REST endpoints, simulate edge cases, and test client applications against network failures before reaching production.

## Features

- **Dynamic Mocking**: Create endpoints manually or via OpenAPI/Swagger imports. Route registrations are dynamic; no server restarts are required.
- **Chaos Mode**: Intentionally inject targeted failures (e.g., 500 errors, latency spikes, malformed responses) to perform resilience testing on clients.
- **Live Logs**: Monitor incoming requests and payloads in real-time through a websocket-connected dashboard.

## Tech Stack

- **Frontend**: React, Vite, Zustand
- **Backend**: Spring Boot, Spring WebFlux 
- **Database**: PostgreSQL, Redis

## How it Works

1. **Create a Project**: Allocate a workspace, which provides a unique base URL for your mocks.
2. **Define Endpoints**: Specify HTTP methods, paths, and response structures.
3. **Configure Chaos**: Selectively enable failure injection on specific endpoints to test client error handling.
4. **Point Your Client**: Direct your frontend application to the generated APInjector endpoint.
5. **Monitor Traffic**: Inspect incoming requests, payloads, and triggered chaos events in the real-time log viewer.
