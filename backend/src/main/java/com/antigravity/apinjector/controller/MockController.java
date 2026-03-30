package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.service.ChaosConfigService;
import com.antigravity.apinjector.service.ChaosEngine;
import com.antigravity.apinjector.service.EndpointService;
import com.antigravity.apinjector.service.ProjectService;
import com.antigravity.apinjector.service.RequestLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/m")
@RequiredArgsConstructor
@Slf4j
public class MockController {

    private final ProjectService projectService;
    private final EndpointService endpointService;
    private final RequestLogService requestLogService;
    private final ChaosConfigService chaosConfigService;
    private final ChaosEngine chaosEngine;

    @RequestMapping("/{projectSlug}/**")
    public ResponseEntity<String> handleMockRequest(HttpServletRequest request, HttpServletResponse response) {
        String fullPath = request.getRequestURI(); // e.g. /m/e2e-test/hello
        String method = request.getMethod();

        // Strip the leading "/m" → "/e2e-test/hello", then split on first "/"
        // After substring(2): "/e2e-test/hello"  → split("/", 3) → ["", "e2e-test", "hello"]
        String stripped = fullPath.substring(2); // "/e2e-test/hello"
        String[] parts = stripped.split("/", 3);  // ["", "e2e-test", "hello"]

        if (parts.length < 2 || parts[1].isBlank()) {
            return ResponseEntity.badRequest().body("Invalid mock URL");
        }

        String projectSlug = parts[1];
        String mockPath = parts.length > 2 ? "/" + parts[2] : "/";

        log.info("Mock Request: {} {} for project: {}", method, mockPath, projectSlug);

        var projectOpt = projectService.getProjectBySlug(projectSlug);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Project not found: " + projectSlug);
        }

        var project = projectOpt.get();
        var endpointOpt = endpointService.findMatch(project, method, mockPath);
        if (endpointOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No endpoint found for " + method + " " + mockPath);
        }

        Endpoint endpoint = endpointOpt.get();
        if (!endpoint.isActive()) {
            return ResponseEntity.status(503).body("Endpoint is disabled");
        }

        var chaosConfig = chaosConfigService.getByProjectId(project.getId());
        ChaosEngine.ChaosResult chaosResult = chaosEngine.evaluate(chaosConfig);

        // CONNECTION DROP — close socket immediately
        if (chaosResult.isDropConnection()) {
            requestLogService.saveLog(RequestLog.builder()
                    .projectId(project.getId())
                    .endpointId(endpoint.getId())
                    .method(method)
                    .path(mockPath)
                    .responseStatus(0)
                    .responseBody("")
                    .latencyMs(0)
                    .wasChaos(true)
                    .chaosType(chaosResult.getChaosType())
                    .build());
            try {
                response.sendError(503, "Connection drop simulated");
            } catch (IOException e) {
                log.warn("Error sending connection drop response", e);
            }
            return null;
        }

        int finalStatus = chaosResult.getOverrideStatusCode() > 0
                ? chaosResult.getOverrideStatusCode() : endpoint.getStatusCode();

        String finalBody = endpoint.getResponseBody();
        if (chaosResult.isMalformedBody() && finalBody != null && finalBody.length() > 5) {
            finalBody = finalBody.substring(0, finalBody.length() / 2);
        }

        // LATENCY SPIKE — Thread.sleep (we're on a normal servlet thread)
        int totalDelayMs = endpoint.getDelayMs() + chaosResult.getAddedLatencyMs();
        if (totalDelayMs > 0) {
            log.info("Simulating delay: {}ms", totalDelayMs);
            try {
                Thread.sleep(totalDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // Save log asynchronously
        requestLogService.saveLog(RequestLog.builder()
                .projectId(project.getId())
                .endpointId(endpoint.getId())
                .method(method)
                .path(mockPath)
                .responseStatus(finalStatus)
                .responseBody(finalBody)
                .latencyMs(totalDelayMs)
                .wasChaos(chaosResult.isChaos())
                .chaosType(chaosResult.getChaosType())
                .build());

        return ResponseEntity.status(finalStatus)
                .contentType(MediaType.parseMediaType(endpoint.getContentType()))
                .body(finalBody);
    }
}
