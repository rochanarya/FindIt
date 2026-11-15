package com.findit.dto.response;

import com.findit.entity.Notification;
import com.findit.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private UUID relatedItemId;
    private Instant createdAt;

    public static NotificationDto from(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .relatedItemId(notification.getRelatedItemId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

