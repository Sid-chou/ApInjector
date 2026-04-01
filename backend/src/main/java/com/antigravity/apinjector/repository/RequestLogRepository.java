package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.RequestLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, UUID> {

    List<RequestLog> findByProjectIdOrderByTimestampDesc(UUID projectId);

    List<RequestLog> findByProjectIdOrderByTimestampDesc(UUID projectId, Pageable pageable);

    List<RequestLog> findByProjectIdAndMethodOrderByTimestampDesc(UUID projectId, String method, Pageable pageable);

    List<RequestLog> findByProjectIdAndResponseStatusOrderByTimestampDesc(UUID projectId, int status, Pageable pageable);

    List<RequestLog> findByProjectIdAndMethodAndResponseStatusOrderByTimestampDesc(
            UUID projectId, String method, int status, Pageable pageable);

    void deleteByProjectId(UUID projectId);

    long countByProjectId(UUID projectId);

    long countByProjectIdAndWasChaosTrue(UUID projectId);

    @Query("SELECT AVG(r.latencyMs) FROM RequestLog r WHERE r.projectId = :projectId")
    Double avgLatencyByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT r.chaosType, COUNT(r) FROM RequestLog r WHERE r.projectId = :projectId AND r.wasChaos = true GROUP BY r.chaosType")
    List<Object[]> countByChaosType(@Param("projectId") UUID projectId);

    @Query("SELECT r.path, COUNT(r), SUM(CASE WHEN r.responseStatus < 400 THEN 1 ELSE 0 END) FROM RequestLog r WHERE r.projectId = :projectId GROUP BY r.path")
    List<Object[]> endpointReliabilityStats(@Param("projectId") UUID projectId);
}
