package com.antigravity.apinjector.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chaos_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChaosConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @Builder.Default
    private boolean enabled = false;

    @Builder.Default
    private int errorRatePercent = 0;

    @Builder.Default
    private int latencySpikePercent = 0;

    @Builder.Default
    private int minSpikeMs = 500;

    @Builder.Default
    private int maxSpikeMs = 2000;

    @Builder.Default
    private int malformedResponsePercent = 0;

    @Builder.Default
    private int connectionDropPercent = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
