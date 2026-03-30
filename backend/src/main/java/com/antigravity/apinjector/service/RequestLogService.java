package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.RequestLog;
import com.antigravity.apinjector.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
}
