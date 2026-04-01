package com.antigravity.apinjector.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolves {{placeholder}} variables in response body templates.
 *
 * Supported placeholders:
 *   {{timestamp}}              - Current Unix epoch milliseconds
 *   {{uuid}}                   - Random UUID
 *   {{randomInt}}              - Random integer 1-10000
 *   {{faker.name.fullName}}    - Full name from Datafaker
 *   {{faker.name.firstName}}   - First name
 *   {{faker.name.lastName}}    - Last name
 *   {{faker.internet.email}}   - Email address
 *   {{faker.internet.url}}     - Random URL
 *   {{faker.address.city}}     - City name
 *   {{faker.phoneNumber.phoneNumber}} - Phone number
 *   {{request.query.PARAM}}    - Query string parameter
 *   {{request.header.NAME}}    - Request header value
 *   {{request.body.FIELD}}     - JSON body field (top-level)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResponseTemplateEngine {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([^}]+)}}");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Faker faker = new Faker();

    public String resolve(String template, HttpServletRequest request) {
        if (template == null || !template.contains("{{")) {
            return template;
        }

        // Cache request body for field extraction
        String requestBody = readRequestBody(request);

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String placeholder = matcher.group(1).trim();
            String resolved = resolvePlaceholder(placeholder, request, requestBody);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(resolved));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String resolvePlaceholder(String key, HttpServletRequest request, String requestBody) {
        try {
            // --- Utility generators ---
            if ("timestamp".equals(key)) return String.valueOf(Instant.now().toEpochMilli());
            if ("uuid".equals(key)) return UUID.randomUUID().toString();
            if ("randomInt".equals(key)) return String.valueOf((int) (Math.random() * 10000) + 1);

            // --- Faker generators ---
            if (key.startsWith("faker.")) {
                return resolveFaker(key.substring(6));
            }

            // --- Request context ---
            if (key.startsWith("request.query.")) {
                String param = key.substring("request.query.".length());
                String value = request.getParameter(param);
                return value != null ? value : "";
            }
            if (key.startsWith("request.header.")) {
                String header = key.substring("request.header.".length());
                String value = request.getHeader(header);
                return value != null ? value : "";
            }
            if (key.startsWith("request.body.")) {
                String field = key.substring("request.body.".length());
                return extractJsonField(requestBody, field);
            }
        } catch (Exception e) {
            log.warn("Failed to resolve placeholder '{}': {}", key, e.getMessage());
        }
        return "{{" + key + "}}"; // Return unresolved if unknown
    }

    private String resolveFaker(String fakerKey) {
        return switch (fakerKey) {
            case "name.fullName"           -> faker.name().fullName();
            case "name.firstName"          -> faker.name().firstName();
            case "name.lastName"           -> faker.name().lastName();
            case "internet.email"          -> faker.internet().emailAddress();
            case "internet.url"            -> faker.internet().url();
            case "internet.username"       -> faker.internet().username();
            case "address.city"            -> faker.address().city();
            case "address.country"         -> faker.address().country();
            case "address.streetAddress"   -> faker.address().streetAddress();
            case "phoneNumber.phoneNumber" -> faker.phoneNumber().phoneNumber();
            case "company.name"            -> faker.company().name();
            case "lorem.sentence"          -> faker.lorem().sentence();
            case "lorem.word"              -> faker.lorem().word();
            case "number.randomNumber"     -> String.valueOf(faker.number().randomNumber());
            default -> {
                log.warn("Unknown faker key: {}", fakerKey);
                yield "{{faker." + fakerKey + "}}";
            }
        };
    }

    private String extractJsonField(String body, String fieldName) {
        if (body == null || body.isBlank()) return "";
        try {
            JsonNode node = objectMapper.readTree(body);
            JsonNode field = node.get(fieldName);
            return field != null ? field.asText() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private String readRequestBody(HttpServletRequest request) {
        try {
            byte[] bytes = request.getInputStream().readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "";
        }
    }
}
