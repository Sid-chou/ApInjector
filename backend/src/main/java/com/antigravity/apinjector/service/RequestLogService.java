package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestLogService {

    private final RequestLogRepository requestLogRepository;
    private final LogEventPublisher logEventPublisher;

    @Async
    @Transactional
    public void saveLog(RequestLog logEntry) {
        RequestLog savedLog = requestLogRepository.save(logEntry);
        log.debug("Saved request log async for project {}", savedLog.getProjectId());
        logEventPublisher.publishLog(savedLog);
    }

    @Transactional(readOnly = true)
    public List<RequestLog> getLogsByProject(UUID projectId) {
        return requestLogRepository.findByProjectIdOrderByTimestampDesc(projectId);
    }

    @Transactional(readOnly = true)
    public List<RequestLog> getFilteredLogs(UUID projectId, String method, Integer status, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));

        if (method != null && status != null) {
            return requestLogRepository.findByProjectIdAndMethodAndResponseStatusOrderByTimestampDesc(
                    projectId, method.toUpperCase(), status, pageable);
        } else if (method != null) {
            return requestLogRepository.findByProjectIdAndMethodOrderByTimestampDesc(
                    projectId, method.toUpperCase(), pageable);
        } else if (status != null) {
            return requestLogRepository.findByProjectIdAndResponseStatusOrderByTimestampDesc(
                    projectId, status, pageable);
        } else {
            return requestLogRepository.findByProjectIdOrderByTimestampDesc(projectId, pageable);
        }
    }

    @Transactional
    public void clearLogs(UUID projectId) {
        requestLogRepository.deleteByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(UUID projectId) {
        long totalRequests = requestLogRepository.countByProjectId(projectId);
        long chaosCount = requestLogRepository.countByProjectIdAndWasChaosTrue(projectId);
        Double avgLatency = requestLogRepository.avgLatencyByProjectId(projectId);

        // Chaos type breakdown
        List<Object[]> chaosRaw = requestLogRepository.countByChaosType(projectId);
        Map<String, Long> chaosBreakdown = new LinkedHashMap<>();
        for (Object[] row : chaosRaw) {
            chaosBreakdown.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        // Endpoint reliability
        List<Object[]> reliabilityRaw = requestLogRepository.endpointReliabilityStats(projectId);
        List<Map<String, Object>> reliability = new ArrayList<>();
        for (Object[] row : reliabilityRaw) {
            long total = ((Number) row[1]).longValue();
            long success = ((Number) row[2]).longValue();
            reliability.add(Map.of(
                    "path", String.valueOf(row[0]),
                    "total", total,
                    "successRate", total > 0 ? (double) success / total * 100 : 100.0
            ));
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRequests", totalRequests);
        stats.put("chaosCount", chaosCount);
        stats.put("chaosRatePercent", totalRequests > 0 ? (double) chaosCount / totalRequests * 100 : 0.0);
        stats.put("avgLatencyMs", avgLatency != null ? avgLatency : 0.0);
        stats.put("chaosBreakdown", chaosBreakdown);
        stats.put("endpointReliability", reliability);
        return stats;
    }

    @Transactional(readOnly = true)
    public byte[] exportLogs(UUID projectId, String format) {
        List<RequestLog> logs = requestLogRepository.findByProjectIdOrderByTimestampDesc(projectId);

        if ("json".equalsIgnoreCase(format)) {
            // Simple JSON array serialization
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < logs.size(); i++) {
                RequestLog l = logs.get(i);
                sb.append(String.format(
                        "{\"id\":\"%s\",\"method\":\"%s\",\"path\":\"%s\",\"status\":%d,\"latencyMs\":%d,\"wasChaos\":%b,\"chaosType\":\"%s\",\"timestamp\":\"%s\"}",
                        l.getId(), l.getMethod(), l.getPath(), l.getResponseStatus(),
                        l.getLatencyMs(), l.isWasChaos(),
                        l.getChaosType() != null ? l.getChaosType() : "",
                        l.getTimestamp()
                ));
                if (i < logs.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString().getBytes(StandardCharsets.UTF_8);
        }

        // Default: CSV
        StringBuilder csv = new StringBuilder("id,method,path,status,latencyMs,wasChaos,chaosType,timestamp\n");
        for (RequestLog l : logs) {
            csv.append(String.format("%s,%s,%s,%d,%d,%b,%s,%s\n",
                    l.getId(), l.getMethod(), l.getPath(), l.getResponseStatus(),
                    l.getLatencyMs(), l.isWasChaos(),
                    l.getChaosType() != null ? l.getChaosType() : "",
                    l.getTimestamp()
            ));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
