package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.service.ProjectService;
import com.antigravity.apinjector.service.ChaosConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;
    private final ChaosConfigService chaosConfigService;

    @GetMapping
    public List<Project> getAll() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<Project> getByIdentifier(@PathVariable String identifier) {
        return projectService.getProjectByIdentifier(identifier)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project create(@Valid @RequestBody Project project) {
        return projectService.createProject(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable UUID id, @RequestBody Project updates) {
        return projectService.getProjectById(id)
                .map(existing -> {
                    existing.setLatencyProfile(updates.getLatencyProfile());
                    existing.setGlobalLatencyMs(updates.getGlobalLatencyMs());
                    existing.setJitterMs(updates.getJitterMs());
                    if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
                    return ResponseEntity.ok(projectService.updateProject(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        projectService.deleteProject(id);
    }

    @GetMapping("/{id}/chaos")
    public com.antigravity.apinjector.model.ChaosConfig getChaosConfig(@PathVariable UUID id) {
        return chaosConfigService.getByProjectId(id);
    }

    @PutMapping("/{id}/chaos")
    public com.antigravity.apinjector.model.ChaosConfig updateChaosConfig(
            @PathVariable UUID id,
            @Valid @RequestBody com.antigravity.apinjector.model.ChaosConfig config) {
        return chaosConfigService.updateConfig(id, config);
    }
}
