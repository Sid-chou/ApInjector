package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.RequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, UUID> {
    List<RequestLog> findByProjectIdOrderByTimestampDesc(UUID projectId);
}
