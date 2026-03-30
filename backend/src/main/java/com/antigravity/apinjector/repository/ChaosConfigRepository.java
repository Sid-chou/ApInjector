package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.ChaosConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChaosConfigRepository extends JpaRepository<ChaosConfig, UUID> {
    Optional<ChaosConfig> findByProjectId(UUID projectId);
}
