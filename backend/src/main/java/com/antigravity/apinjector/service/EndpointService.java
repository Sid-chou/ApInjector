package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.repository.EndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EndpointService {

    private final EndpointRepository endpointRepository;

    @Transactional(readOnly = true)
    public List<Endpoint> getEndpointsByProject(Project project) {
        return endpointRepository.findByProject(project);
    }

    @Transactional(readOnly = true)
    public Optional<Endpoint> findById(UUID id) {
        return endpointRepository.findById(id);
    }

    @Transactional
    public Endpoint createEndpoint(Endpoint endpoint) {
        return endpointRepository.save(endpoint);
    }

    @Transactional
    public Endpoint updateEndpoint(UUID id, Endpoint updated) {
        Endpoint existing = endpointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endpoint not found"));
        existing.setMethod(updated.getMethod());
        existing.setPath(updated.getPath());
        existing.setStatusCode(updated.getStatusCode());
        existing.setResponseBody(updated.getResponseBody());
        existing.setContentType(updated.getContentType());
        existing.setDelayMs(updated.getDelayMs());
        existing.setTemplate(updated.isTemplate());
        return endpointRepository.save(existing);
    }

    @Transactional
    public Endpoint toggleEndpoint(UUID id) {
        Endpoint existing = endpointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endpoint not found"));
        existing.setActive(!existing.isActive());
        return endpointRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Optional<Endpoint> findMatch(Project project, String method, String path) {
        return endpointRepository.findByProjectAndMethodAndPath(project, method, path);
    }

    @Transactional
    public void deleteEndpoint(UUID id) {
        endpointRepository.deleteById(id);
    }
}
