package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.service.EndpointService;
import com.antigravity.apinjector.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/endpoints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EndpointController {

    private final EndpointService endpointService;
    private final ProjectService projectService;

    @GetMapping
    public List<Endpoint> getByProject(@PathVariable UUID projectId) {
        Project project = getProjectOrThrow(projectId);
        return endpointService.getEndpointsByProject(project);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Endpoint create(@PathVariable UUID projectId, @Valid @RequestBody Endpoint endpoint) {
        Project project = getProjectOrThrow(projectId);
        endpoint.setProject(project);
        return endpointService.createEndpoint(endpoint);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        endpointService.deleteEndpoint(id);
    }

    private Project getProjectOrThrow(UUID id) {
        return projectService.getProjectById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }
}
