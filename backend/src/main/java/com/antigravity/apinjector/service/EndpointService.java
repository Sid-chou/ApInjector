package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.repository.EndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Endpoint createEndpoint(Endpoint endpoint) {
        return endpointRepository.save(endpoint);
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
