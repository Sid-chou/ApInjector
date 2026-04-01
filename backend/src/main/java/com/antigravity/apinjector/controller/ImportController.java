package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.service.OpenApiImportService;
import com.antigravity.apinjector.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/import")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImportController {

    private final OpenApiImportService importService;
    private final ProjectService projectService;

    /**
     * POST /api/projects/{projectId}/import/openapi
     * Body: { "spec": "<raw JSON or YAML OpenAPI spec>" }
     */
    @PostMapping("/openapi")
    @ResponseStatus(HttpStatus.CREATED)
    public OpenApiImportService.ImportResult importOpenApi(
            @PathVariable UUID projectId,
            @RequestBody Map<String, String> body) {

        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        String spec = body.get("spec");
        if (spec == null || spec.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "spec field is required");
        }

        return importService.importSpec(project, spec);
    }
}
