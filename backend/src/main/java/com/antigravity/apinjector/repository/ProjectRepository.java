package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
