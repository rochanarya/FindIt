package com.findit.dto.response;

import com.findit.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String adminEmail;
    private String adminName;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private Instant createdAt;

    public static AuditLogDto from(AuditLog log) {
        if (log == null) return null;
        return AuditLogDto.builder()
                .id(log.getId())
                .adminEmail(log.getAdmin() != null ? log.getAdmin().getEmail() : "SYSTEM")
                .adminName(log.getAdmin() != null ? log.getAdmin().getFullName() : "System")
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

