package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.ChaosConfig;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class ChaosEngine {

    private final Random random = new Random();

    @Data
    @Builder
    public static class ChaosResult {
        private boolean isChaos;
        private String chaosType;
        private int addedLatencyMs;
        private int overrideStatusCode;
        private boolean dropConnection;
        private boolean malformedBody;
    }

    public ChaosResult evaluate(ChaosConfig config) {
        if (config == null || !config.isEnabled()) {
            return ChaosResult.builder().isChaos(false).build();
        }

        int roll = random.nextInt(100); // 0-99

        int currentThreshold = 0;

        // 1. Check Error Rate
        currentThreshold += config.getErrorRatePercent();
        if (roll < currentThreshold) {
            int[] errorCodes = {500, 502, 503, 504};
            int randomError = errorCodes[random.nextInt(errorCodes.length)];
            return ChaosResult.builder()
                    .isChaos(true)
                    .chaosType("SERVER_ERROR")
                    .overrideStatusCode(randomError)
                    .build();
        }

        // 2. Check Connection Drop
        currentThreshold += config.getConnectionDropPercent();
        if (roll < currentThreshold) {
            return ChaosResult.builder()
                    .isChaos(true)
                    .chaosType("CONNECTION_DROP")
                    .dropConnection(true)
                    .build();
        }

        // 3. Check Malformed Response
        currentThreshold += config.getMalformedResponsePercent();
        if (roll < currentThreshold) {
            return ChaosResult.builder()
                    .isChaos(true)
                    .chaosType("MALFORMED_RESPONSE")
                    .malformedBody(true)
                    .build();
        }

        // 4. Check Latency Spikes (Could be combined with others, but let's make it mutually exclusive for simplicity first)
        currentThreshold += config.getLatencySpikePercent();
        if (roll < currentThreshold) {
            int spikeDuration = config.getMinSpikeMs() + random.nextInt(Math.max(1, config.getMaxSpikeMs() - config.getMinSpikeMs()));
            return ChaosResult.builder()
                    .isChaos(true)
                    .chaosType("LATENCY_SPIKE")
                    .addedLatencyMs(spikeDuration)
                    .build();
        }

        return ChaosResult.builder().isChaos(false).build();
    }
}
