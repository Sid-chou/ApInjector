package com.antigravity.apinjector.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "response_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    @JsonIgnore
    private Endpoint endpoint;

    @NotBlank
    private String name; // e.g., "Success", "Not Found", "Server Error"

    @Builder.Default
    private int statusCode = 200;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Builder.Default
    private String contentType = "application/json";

    @Builder.Default
    private boolean isTemplate = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
