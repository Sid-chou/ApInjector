package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.service.RequestLogService;
import com.antigravity.apinjector.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RequestLogController {

    private final RequestLogService requestLogService;
    private final ProjectService projectService;

    /**
     * GET /api/projects/{id}/logs
     * Optional query params: method, status, page (default 0), size (default 50)
     */
    @GetMapping
    public List<RequestLog> getLogs(
            @PathVariable UUID projectId,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        ensureProject(projectId);
        return requestLogService.getFilteredLogs(projectId, method, status, page, size);
    }

    /**
     * DELETE /api/projects/{id}/logs — clears all logs for project
     */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearLogs(@PathVariable UUID projectId) {
        ensureProject(projectId);
        requestLogService.clearLogs(projectId);
    }

    /**
     * GET /api/projects/{id}/logs/stats — aggregated analytics
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats(@PathVariable UUID projectId) {
        ensureProject(projectId);
        return requestLogService.getStats(projectId);
    }

    /**
     * GET /api/projects/{id}/logs/export — CSV file download
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLogs(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "csv") String format) {
        ensureProject(projectId);
        byte[] data = requestLogService.exportLogs(projectId, format);
        String contentType = "json".equalsIgnoreCase(format) ? "application/json" : "text/csv";
        String filename = "logs-" + projectId + "." + format.toLowerCase();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }

    private void ensureProject(UUID projectId) {
        projectService.getProjectById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }
}
