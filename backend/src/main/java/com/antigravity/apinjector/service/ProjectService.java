package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.repository.ProjectRepository;
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
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Project> getProjectById(UUID id) {
        return projectRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Project> getProjectBySlug(String slug) {
        return projectRepository.findBySlug(slug);
    }

    @Transactional(readOnly = true)
    public Optional<Project> getProjectByIdentifier(String identifier) {
        try {
            return projectRepository.findById(UUID.fromString(identifier));
        } catch (IllegalArgumentException ignored) {
            return projectRepository.findBySlug(identifier);
        }
    }

    @Transactional
    public Project createProject(Project project) {
        if (projectRepository.existsByName(project.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project with name '" + project.getName() + "' already exists"
            );
        }
        if (projectRepository.existsBySlug(project.getSlug())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project with slug '" + project.getSlug() + "' already exists"
            );
        }
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        projectRepository.deleteById(id);
    }
}
