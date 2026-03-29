package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EndpointRepository extends JpaRepository<Endpoint, UUID> {
    List<Endpoint> findByProject(Project project);
    Optional<Endpoint> findByProjectAndMethodAndPath(Project project, String method, String path);
}
