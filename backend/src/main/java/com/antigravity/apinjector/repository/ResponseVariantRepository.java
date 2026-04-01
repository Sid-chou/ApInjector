package com.antigravity.apinjector.repository;

import com.antigravity.apinjector.model.ResponseVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResponseVariantRepository extends JpaRepository<ResponseVariant, UUID> {
    List<ResponseVariant> findByEndpointId(UUID endpointId);
    Optional<ResponseVariant> findByEndpointIdAndId(UUID endpointId, UUID variantId);
}
