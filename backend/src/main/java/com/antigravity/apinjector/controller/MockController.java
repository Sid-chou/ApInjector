package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.model.ResponseVariant;
import com.antigravity.apinjector.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Random;

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
    private final ResponseVariantService responseVariantService;
    private final ResponseTemplateEngine templateEngine;

    private final Random random = new Random();

    @RequestMapping("/{projectSlug}/**")
    public ResponseEntity<String> handleMockRequest(HttpServletRequest request, HttpServletResponse response) {
        String fullPath = request.getRequestURI();
        String method = request.getMethod();

        String stripped = fullPath.substring(2);
        String[] parts = stripped.split("/", 3);

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

        // ── Resolve response body & status (variant or direct) ───────────────
        String finalBody;
        int finalStatus;
        String finalContentType;

        if (endpoint.getActiveVariantId() != null) {
            var variantList = responseVariantService.getVariantsByEndpoint(endpoint.getId());
            ResponseVariant activeVariant = variantList.stream()
                    .filter(v -> v.getId().equals(endpoint.getActiveVariantId()))
                    .findFirst()
                    .orElse(null);

            if (activeVariant != null) {
                finalBody = activeVariant.getBody();
                finalStatus = activeVariant.getStatusCode();
                finalContentType = activeVariant.getContentType();
            } else {
                // Variant was deleted — fall back to endpoint defaults
                finalBody = endpoint.getResponseBody();
                finalStatus = endpoint.getStatusCode();
                finalContentType = endpoint.getContentType();
            }
        } else {
            finalBody = endpoint.getResponseBody();
            finalStatus = endpoint.getStatusCode();
            finalContentType = endpoint.getContentType();
        }

        // ── Apply response templating ─────────────────────────────────────────
        if (endpoint.isTemplate() && finalBody != null) {
            finalBody = templateEngine.resolve(finalBody, request);
        }

        // ── Chaos evaluation ──────────────────────────────────────────────────
        var chaosConfig = chaosConfigService.getByProjectId(project.getId());
        ChaosEngine.ChaosResult chaosResult = chaosEngine.evaluate(chaosConfig);

        // CONNECTION DROP
        if (chaosResult.isDropConnection()) {
            requestLogService.saveLog(buildLog(project, endpoint, method, mockPath, 0, "", 0, true, chaosResult.getChaosType()));
            try {
                response.sendError(503, "Connection drop simulated");
            } catch (IOException e) {
                log.warn("Error sending connection drop response", e);
            }
            return null;
        }

        // Override status for chaos errors
        if (chaosResult.getOverrideStatusCode() > 0) {
            finalStatus = chaosResult.getOverrideStatusCode();
        }

        // Malformed body
        if (chaosResult.isMalformedBody() && finalBody != null && finalBody.length() > 5) {
            finalBody = finalBody.substring(0, finalBody.length() / 2);
        }

        // ── Latency simulation ────────────────────────────────────────────────
        int profileDelay = resolveProfileDelay(project);
        int totalDelayMs = profileDelay + endpoint.getDelayMs() + chaosResult.getAddedLatencyMs();
        if (totalDelayMs > 0) {
            log.info("Simulating total delay: {}ms", totalDelayMs);
            try {
                Thread.sleep(totalDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // ── Async log ─────────────────────────────────────────────────────────
        requestLogService.saveLog(buildLog(project, endpoint, method, mockPath,
                finalStatus, finalBody, totalDelayMs, chaosResult.isChaos(), chaosResult.getChaosType()));

        return ResponseEntity.status(finalStatus)
                .contentType(MediaType.parseMediaType(finalContentType != null ? finalContentType : "application/json"))
                .body(finalBody);
    }

    // ── Latency profile resolver ──────────────────────────────────────────────

    private int resolveProfileDelay(Project project) {
        if (project.getLatencyProfile() == null) return 0;
        int base = switch (project.getLatencyProfile()) {
            case "FAST_LAN"  -> 5;
            case "CABLE"     -> 50;
            case "SLOW_3G"   -> 1500;
            case "CUSTOM"    -> project.getGlobalLatencyMs();
            default          -> 0; // NONE
        };
        // Add jitter ±jitterMs
        int jitter = project.getJitterMs();
        if (jitter > 0) {
            base += (random.nextInt(jitter * 2 + 1) - jitter);
            base = Math.max(0, base);
        }
        return base;
    }

    private RequestLog buildLog(Project project, Endpoint endpoint, String method,
                                 String path, int status, String body,
                                 int latency, boolean wasChaos, String chaosType) {
        return RequestLog.builder()
                .projectId(project.getId())
                .endpointId(endpoint.getId())
                .method(method)
                .path(path)
                .responseStatus(status)
                .responseBody(body)
                .latencyMs(latency)
                .wasChaos(wasChaos)
                .chaosType(chaosType)
                .build();
    }
}
