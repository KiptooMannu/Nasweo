package org.nasweo.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEvent {
    private String action;
    private String performedBy;
    private String entityName;
    private String entityId;
    private String details;
    private String ipAddress;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
