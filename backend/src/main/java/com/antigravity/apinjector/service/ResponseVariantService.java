package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.ResponseVariant;
import com.antigravity.apinjector.repository.EndpointRepository;
import com.antigravity.apinjector.repository.ResponseVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResponseVariantService {

    private final ResponseVariantRepository variantRepository;
    private final EndpointRepository endpointRepository;

    @Transactional(readOnly = true)
    public List<ResponseVariant> getVariantsByEndpoint(UUID endpointId) {
        return variantRepository.findByEndpointId(endpointId);
    }

    @Transactional
    public ResponseVariant createVariant(UUID endpointId, ResponseVariant variant) {
        Endpoint endpoint = endpointRepository.findById(endpointId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endpoint not found"));
        variant.setEndpoint(endpoint);
        return variantRepository.save(variant);
    }

    @Transactional
    public ResponseVariant updateVariant(UUID variantId, ResponseVariant updated) {
        ResponseVariant existing = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        existing.setName(updated.getName());
        existing.setStatusCode(updated.getStatusCode());
        existing.setBody(updated.getBody());
        existing.setContentType(updated.getContentType());
        existing.setTemplate(updated.isTemplate());
        return variantRepository.save(existing);
    }

    @Transactional
    public void deleteVariant(UUID variantId) {
        variantRepository.deleteById(variantId);
    }

    @Transactional
    public Endpoint activateVariant(UUID endpointId, UUID variantId) {
        Endpoint endpoint = endpointRepository.findById(endpointId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endpoint not found"));
        // Ensure the variant belongs to this endpoint
        variantRepository.findByEndpointIdAndId(endpointId, variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found for this endpoint"));
        endpoint.setActiveVariantId(variantId);
        return endpointRepository.save(endpoint);
    }

    @Transactional
    public Endpoint deactivateVariant(UUID endpointId) {
        Endpoint endpoint = endpointRepository.findById(endpointId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endpoint not found"));
        endpoint.setActiveVariantId(null);
        return endpointRepository.save(endpoint);
    }
}
