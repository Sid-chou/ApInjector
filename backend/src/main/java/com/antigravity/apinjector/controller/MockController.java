package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.service.EndpointService;
import com.antigravity.apinjector.service.ProjectService;
import com.antigravity.apinjector.service.RequestLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
@RequestMapping("/m")
@RequiredArgsConstructor
@Slf4j
public class MockController {

    private final ProjectService projectService;
    private final EndpointService endpointService;
    private final RequestLogService requestLogService;

    @RequestMapping("/{projectSlug}/**")
    public Mono<ResponseEntity<String>> handleMockRequest(ServerWebExchange exchange) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        // Extract project slug and the relative mock path
        // URL format: /m/{projectSlug}/{mockPath}
        String[] parts = path.substring(3).split("/", 2);
        if (parts.length < 1) {
            return Mono.just(ResponseEntity.badRequest().body("Invalid mock URL"));
        }

        String projectSlug = parts[0];
        String mockPath = parts.length > 1 ? "/" + parts[1] : "/";

        log.info("Mock Request: {} {} for project: {}", method, mockPath, projectSlug);

        return Mono.fromCallable(() -> projectService.getProjectBySlug(projectSlug))
                .flatMap(projectOpt -> {
                    if (projectOpt.isEmpty()) {
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project not found: " + projectSlug));
                    }

                    return Mono.fromCallable(() -> endpointService.findMatch(projectOpt.get(), method, mockPath))
                            .flatMap(endpointOpt -> {
                                if (endpointOpt.isEmpty()) {
                                    return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                            .body("No endpoint found for " + method + " " + mockPath));
                                }

                                Endpoint endpoint = endpointOpt.get();
                                if (!endpoint.isActive()) {
                                    return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Endpoint is disabled"));
                                }

                                // Handle Latency Simulation
                                Mono<ResponseEntity<String>> response = Mono.just(
                                        ResponseEntity.status(endpoint.getStatusCode())
                                                .contentType(MediaType.parseMediaType(endpoint.getContentType()))
                                                .body(endpoint.getResponseBody())
                                );

                                Mono<ResponseEntity<String>> finalResponse = response;
                                if (endpoint.getDelayMs() > 0) {
                                    log.info("Simulating delay: {}ms", endpoint.getDelayMs());
                                    finalResponse = response.delayElement(Duration.ofMillis(endpoint.getDelayMs()));
                                }

                                return finalResponse.doOnSuccess(res -> {
                                    RequestLog logEntry = RequestLog.builder()
                                            .projectId(projectOpt.get().getId())
                                            .endpointId(endpoint.getId())
                                            .method(method)
                                            .path(mockPath)
                                            .responseStatus(endpoint.getStatusCode())
                                            .responseBody(endpoint.getResponseBody())
                                            .latencyMs(endpoint.getDelayMs())
                                            .wasChaos(false)
                                            .build();
                                    requestLogService.saveLog(logEntry);
                                });
                            });
                });
    }
}
