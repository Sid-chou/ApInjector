package com.antigravity.apinjector.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "request_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "endpoint_id")
    private UUID endpointId; // Can be null if unmatched

    private String method;
    private String path;

    private int responseStatus;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    private int latencyMs;
    
    private boolean wasChaos;
    private String chaosType;

    @CreationTimestamp
    private LocalDateTime timestamp;
}
