package com.antigravity.apinjector.controller;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.ResponseVariant;
import com.antigravity.apinjector.service.ResponseVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResponseVariantController {

    private final ResponseVariantService variantService;

    // List variants for an endpoint
    @GetMapping("/api/endpoints/{endpointId}/variants")
    public List<ResponseVariant> getVariants(@PathVariable UUID endpointId) {
        return variantService.getVariantsByEndpoint(endpointId);
    }

    // Create a new variant
    @PostMapping("/api/endpoints/{endpointId}/variants")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseVariant createVariant(
            @PathVariable UUID endpointId,
            @Valid @RequestBody ResponseVariant variant) {
        return variantService.createVariant(endpointId, variant);
    }

    // Update a variant
    @PutMapping("/api/variants/{variantId}")
    public ResponseVariant updateVariant(
            @PathVariable UUID variantId,
            @Valid @RequestBody ResponseVariant variant) {
        return variantService.updateVariant(variantId, variant);
    }

    // Delete a variant
    @DeleteMapping("/api/variants/{variantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVariant(@PathVariable UUID variantId) {
        variantService.deleteVariant(variantId);
    }

    // Activate a specific variant for an endpoint
    @PostMapping("/api/endpoints/{endpointId}/activate-variant/{variantId}")
    public Endpoint activateVariant(
            @PathVariable UUID endpointId,
            @PathVariable UUID variantId) {
        return variantService.activateVariant(endpointId, variantId);
    }

    // Deactivate variant — revert to using endpoint's responseBody directly
    @PostMapping("/api/endpoints/{endpointId}/deactivate-variant")
    public Endpoint deactivateVariant(@PathVariable UUID endpointId) {
        return variantService.deactivateVariant(endpointId);
    }
}
