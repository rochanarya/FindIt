package com.findit.service;

import com.findit.dto.response.NotificationDto;
import com.findit.dto.response.PagedResponse;
import com.findit.entity.Notification;
import com.findit.entity.User;
import com.findit.enums.NotificationType;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type, UUID relatedItemId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedItemId(relatedItemId)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getMyNotifications(Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        Page<NotificationDto> page = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(NotificationDto::from);
        return PagedResponse.from(page);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        return notificationRepository.countByUserIdAndReadFalse(currentUser.getId());
    }

    @Transactional
    public void markAsRead(Long id) {
        User currentUser = authService.getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        notificationRepository.markAllAsReadByUserId(currentUser.getId());
    }
}

