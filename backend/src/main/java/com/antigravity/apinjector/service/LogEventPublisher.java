package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.RequestLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishLog(RequestLog logEntry) {
        if (logEntry == null || logEntry.getProjectId() == null) {
            return;
        }
        String topic = "/topic/logs/" + logEntry.getProjectId();
        log.debug("Publishing log event to topic: {}", topic);
        try {
            messagingTemplate.convertAndSend(topic, logEntry);
        } catch (Exception e) {
            log.error("Failed to publish log event", e);
        }
    }
}
