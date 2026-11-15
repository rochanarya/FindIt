package com.findit.service;

import com.findit.dto.request.CreateClaimRequest;
import com.findit.dto.response.ClaimDto;
import com.findit.entity.Claim;
import com.findit.entity.Item;
import com.findit.entity.User;
import com.findit.enums.ClaimStatus;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.enums.UserRole;
import com.findit.exception.BadRequestException;
import com.findit.exception.ConflictException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private AuthService authService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    private User finder;
    private User claimant;
    private Item foundItem;

    @BeforeEach
    void setUp() {
        finder = User.builder().id(UUID.randomUUID()).fullName("Finder Student").email("finder@campus.edu").role(UserRole.STUDENT).build();
        claimant = User.builder().id(UUID.randomUUID()).fullName("Claimant Student").email("claimant@campus.edu").role(UserRole.STUDENT).build();

        foundItem = Item.builder()
                .id(UUID.randomUUID())
                .title("AirPods Pro in White Case")
                .description("Found on bench outside student union")
                .itemType(ItemType.FOUND)
                .reportedBy(finder)
                .status(ItemStatus.OPEN)
                .build();
    }

    @Test
    @DisplayName("Should submit claim and transition item status to PENDING_CLAIM")
    void shouldSubmitClaimSuccessfully() {
        CreateClaimRequest request = CreateClaimRequest.builder()
                .itemId(foundItem.getId())
                .description("These are my AirPods Pro, serial number ends with 4821")
                .verificationAnswers("Has a small blue sticker on bottom of case")
                .build();

        Claim savedClaim = Claim.builder()
                .id(1L)
                .item(foundItem)
                .claimant(claimant)
                .description(request.getDescription())
                .verificationAnswers(request.getVerificationAnswers())
                .status(ClaimStatus.PENDING)
                .build();

        when(authService.getCurrentUser()).thenReturn(claimant);
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));
        when(claimRepository.existsByItemIdAndClaimantId(foundItem.getId(), claimant.getId())).thenReturn(false);
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDto result = claimService.createClaim(request, null);

        assertNotNull(result);
        assertEquals(ClaimStatus.PENDING, result.getStatus());
        assertEquals(ItemStatus.PENDING_CLAIM, foundItem.getStatus());
        verify(itemRepository).save(foundItem);
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    @DisplayName("Should reject claim if student attempts to claim their own item")
    void shouldRejectClaimOnOwnReportedItem() {
        CreateClaimRequest request = CreateClaimRequest.builder()
                .itemId(foundItem.getId())
                .description("Trying to claim own item")
                .build();

        when(authService.getCurrentUser()).thenReturn(finder); // same as reportedBy
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));

        assertThrows(BadRequestException.class, () -> claimService.createClaim(request, null));
        verify(claimRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate claim by same claimant")
    void shouldRejectDuplicateClaim() {
        CreateClaimRequest request = CreateClaimRequest.builder()
                .itemId(foundItem.getId())
                .description("Duplicate claim")
                .build();

        when(authService.getCurrentUser()).thenReturn(claimant);
        when(itemRepository.findById(foundItem.getId())).thenReturn(Optional.of(foundItem));
        when(claimRepository.existsByItemIdAndClaimantId(foundItem.getId(), claimant.getId())).thenReturn(true);

        assertThrows(ConflictException.class, () -> claimService.createClaim(request, null));
    }
}

