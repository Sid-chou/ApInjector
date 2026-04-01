package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.Endpoint;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.repository.EndpointRepository;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.parser.OpenAPIV3Parser;
import io.swagger.v3.parser.core.models.ParseOptions;
import io.swagger.v3.parser.core.models.SwaggerParseResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenApiImportService {

    private final EndpointRepository endpointRepository;

    public record ImportResult(int imported, int skipped, List<String> errors) {}

    @Transactional
    public ImportResult importSpec(Project project, String specContent) {
        ParseOptions options = new ParseOptions();
        options.setResolve(true);

        SwaggerParseResult result = new OpenAPIV3Parser().readContents(specContent, null, options);

        if (result.getOpenAPI() == null) {
            List<String> errors = result.getMessages() != null ? result.getMessages() : List.of("Failed to parse OpenAPI spec");
            return new ImportResult(0, 0, errors);
        }

        OpenAPI openAPI = result.getOpenAPI();
        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        if (openAPI.getPaths() == null) {
            return new ImportResult(0, 0, List.of("No paths found in spec"));
        }

        for (Map.Entry<String, PathItem> pathEntry : openAPI.getPaths().entrySet()) {
            String path = pathEntry.getKey();
            PathItem pathItem = pathEntry.getValue();

            Map<String, Operation> operations = getOperations(pathItem);
            for (Map.Entry<String, Operation> opEntry : operations.entrySet()) {
                String method = opEntry.getKey().toUpperCase();
                Operation operation = opEntry.getValue();

                // Skip if already exists
                if (endpointRepository.findByProjectAndMethodAndPath(project, method, path).isPresent()) {
                    skipped++;
                    continue;
                }

                try {
                    String responseBody = extractExampleResponse(operation);
                    int statusCode = extractSuccessStatusCode(operation);

                    Endpoint endpoint = Endpoint.builder()
                            .method(method)
                            .path(path)
                            .statusCode(statusCode)
                            .responseBody(responseBody)
                            .contentType("application/json")
                            .delayMs(0)
                            .active(true)
                            .isTemplate(false)
                            .project(project)
                            .build();

                    endpointRepository.save(endpoint);
                    imported++;
                } catch (Exception e) {
                    errors.add("Failed to import " + method + " " + path + ": " + e.getMessage());
                    log.warn("Import error for {} {}: {}", method, path, e.getMessage());
                }
            }
        }

        return new ImportResult(imported, skipped, errors);
    }

    private Map<String, Operation> getOperations(PathItem pathItem) {
        Map<String, Operation> ops = new LinkedHashMap<>();
        if (pathItem.getGet() != null)    ops.put("GET", pathItem.getGet());
        if (pathItem.getPost() != null)   ops.put("POST", pathItem.getPost());
        if (pathItem.getPut() != null)    ops.put("PUT", pathItem.getPut());
        if (pathItem.getPatch() != null)  ops.put("PATCH", pathItem.getPatch());
        if (pathItem.getDelete() != null) ops.put("DELETE", pathItem.getDelete());
        return ops;
    }

    private String extractExampleResponse(Operation operation) {
        if (operation.getResponses() == null) return "{}";

        // Try to find a 200 or 201 response first
        for (String code : new String[]{"200", "201", "202"}) {
            ApiResponse response = operation.getResponses().get(code);
            if (response != null) {
                String body = extractBodyFromResponse(response);
                if (body != null) return body;
            }
        }

        // Fall back to first available response
        for (ApiResponse response : operation.getResponses().values()) {
            String body = extractBodyFromResponse(response);
            if (body != null) return body;
        }

        return "{}";
    }

    private String extractBodyFromResponse(ApiResponse response) {
        Content content = response.getContent();
        if (content == null) return null;

        MediaType mediaType = content.get("application/json");
        if (mediaType == null) mediaType = content.values().stream().findFirst().orElse(null);
        if (mediaType == null) return null;

        // Try example first
        if (mediaType.getExample() != null) {
            return mediaType.getExample().toString();
        }

        // Try examples map
        if (mediaType.getExamples() != null && !mediaType.getExamples().isEmpty()) {
            Object exampleValue = mediaType.getExamples().values().iterator().next().getValue();
            if (exampleValue != null) return exampleValue.toString();
        }

        // Generate minimal schema-based placeholder
        Schema<?> schema = mediaType.getSchema();
        if (schema != null) {
            return generateSchemaPlaceholder(schema);
        }

        return null;
    }

    private String generateSchemaPlaceholder(Schema<?> schema) {
        if (schema == null) return "{}";
        String type = schema.getType();
        if (type == null) return "{}";
        return switch (type) {
            case "array"  -> "[{}]";
            case "string" -> "\"example\"";
            case "integer", "number" -> "0";
            case "boolean" -> "true";
            default -> "{}";
        };
    }

    private int extractSuccessStatusCode(Operation operation) {
        if (operation.getResponses() == null) return 200;
        for (String code : new String[]{"200", "201", "202", "204"}) {
            if (operation.getResponses().containsKey(code)) {
                return Integer.parseInt(code);
            }
        }
        return 200;
    }
}
