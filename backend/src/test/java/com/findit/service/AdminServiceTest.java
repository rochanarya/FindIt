package com.findit.service;

import com.findit.dto.request.ReviewClaimRequest;
import com.findit.dto.response.ClaimDto;
import com.findit.dto.response.UserDto;
import com.findit.entity.Claim;
import com.findit.entity.Item;
import com.findit.entity.User;
import com.findit.enums.ClaimStatus;
import com.findit.enums.ItemStatus;
import com.findit.enums.UserRole;
import com.findit.exception.BadRequestException;
import com.findit.repository.AuditLogRepository;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AuthService authService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    private User admin;
    private User student1;
    private User student2;
    private Item item;
    private Claim claim1;
    private Claim claim2;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(UUID.randomUUID()).email("admin@campus.edu").fullName("Admin Security").role(UserRole.ADMIN).build();
        student1 = User.builder().id(UUID.randomUUID()).email("s1@campus.edu").fullName("Student One").build();
        student2 = User.builder().id(UUID.randomUUID()).email("s2@campus.edu").fullName("Student Two").build();

        item = Item.builder()
                .id(UUID.randomUUID())
                .title("Scientific Calculator TI-84")
                .reportedBy(student2)
                .status(ItemStatus.PENDING_CLAIM)
                .build();

        claim1 = Claim.builder()
                .id(101L)
                .item(item)
                .claimant(student1)
                .status(ClaimStatus.PENDING)
                .build();

        claim2 = Claim.builder()
                .id(102L)
                .item(item)
                .claimant(student2)
                .status(ClaimStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should approve claim, resolve item, and reject competing claims")
    void shouldApproveClaimAndRejectOtherClaims() {
        when(authService.getCurrentUser()).thenReturn(admin);
        when(claimRepository.findById(101L)).thenReturn(Optional.of(claim1));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(claimRepository.findPendingClaimsByItemId(item.getId())).thenReturn(List.of(claim1, claim2));

        ReviewClaimRequest request = ReviewClaimRequest.builder().comment("Verified serial number match").build();
        ClaimDto approved = adminService.approveClaim(101L, request);

        assertNotNull(approved);
        assertEquals(ClaimStatus.APPROVED, approved.getStatus());
        assertEquals(ItemStatus.RESOLVED, item.getStatus());
        assertEquals(ClaimStatus.REJECTED, claim2.getStatus());

        verify(itemRepository).save(item);
        verify(auditLogRepository).save(any());
        verify(notificationService, atLeastOnce()).createNotification(any(), anyString(), anyString(), any(), any());
    }

    @Test
    @DisplayName("Should prevent approving already resolved item")
    void shouldPreventApprovingAlreadyResolvedItem() {
        item.setStatus(ItemStatus.RESOLVED);
        when(authService.getCurrentUser()).thenReturn(admin);
        when(claimRepository.findById(101L)).thenReturn(Optional.of(claim1));

        ReviewClaimRequest request = ReviewClaimRequest.builder().comment("Approve").build();
        assertThrows(BadRequestException.class, () -> adminService.approveClaim(101L, request));
    }

    @Test
    @DisplayName("Should suspend user account and write audit log")
    void shouldSuspendUser() {
        when(authService.getCurrentUser()).thenReturn(admin);
        when(userRepository.findById(student1.getId())).thenReturn(Optional.of(student1));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDto suspended = adminService.suspendUser(student1.getId());

        assertNotNull(suspended);
        assertFalse(suspended.isActive());
        verify(auditLogRepository).save(any());
    }
}

