package com.antigravity.apinjector.service;

import com.antigravity.apinjector.model.ChaosConfig;
import com.antigravity.apinjector.model.Project;
import com.antigravity.apinjector.repository.ChaosConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChaosConfigService {

    private final ChaosConfigRepository chaosConfigRepository;
    private final ProjectService projectService;

    @Transactional
    public ChaosConfig getByProjectId(UUID projectId) {
        return chaosConfigRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    Project project = projectService.getProjectById(projectId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
                    ChaosConfig newConfig = ChaosConfig.builder().project(project).build();
                    return chaosConfigRepository.save(newConfig);
                });
    }

    @Transactional
    public ChaosConfig updateConfig(UUID projectId, ChaosConfig newConfig) {
        ChaosConfig existing = getByProjectId(projectId);
        
        existing.setEnabled(newConfig.isEnabled());
        existing.setErrorRatePercent(newConfig.getErrorRatePercent());
        existing.setLatencySpikePercent(newConfig.getLatencySpikePercent());
        existing.setMinSpikeMs(newConfig.getMinSpikeMs());
        existing.setMaxSpikeMs(newConfig.getMaxSpikeMs());
        existing.setMalformedResponsePercent(newConfig.getMalformedResponsePercent());
        existing.setConnectionDropPercent(newConfig.getConnectionDropPercent());
        
        return chaosConfigRepository.save(existing);
    }
}
