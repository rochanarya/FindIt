package com.findit.service;

import com.findit.dto.request.AdditionalInfoRequest;
import com.findit.dto.request.CreateClaimRequest;
import com.findit.dto.response.ClaimDto;
import com.findit.dto.response.PagedResponse;
import com.findit.entity.Claim;
import com.findit.entity.Item;
import com.findit.entity.User;
import com.findit.enums.ClaimStatus;
import com.findit.enums.ItemStatus;
import com.findit.enums.NotificationType;
import com.findit.enums.UserRole;
import com.findit.exception.BadRequestException;
import com.findit.exception.ConflictException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final AuthService authService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional
    public ClaimDto createClaim(CreateClaimRequest request, MultipartFile proofImage) {
        User currentUser = authService.getCurrentUser();

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + request.getItemId()));

        if (item.getStatus() == ItemStatus.RESOLVED || item.getStatus() == ItemStatus.CLAIMED) {
            throw new BadRequestException("This item has already been claimed or resolved");
        }

        if (item.getReportedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot claim an item you reported yourself");
        }

        if (claimRepository.existsByItemIdAndClaimantId(item.getId(), currentUser.getId())) {
            throw new ConflictException("You have already submitted an ownership claim for this item");
        }

        String proofUrl = null;
        if (proofImage != null && !proofImage.isEmpty()) {
            FileStorageService.UploadResult result = fileStorageService.uploadFile(proofImage, "proofs");
            proofUrl = result.getUrl();
        }

        Claim claim = Claim.builder()
                .item(item)
                .claimant(currentUser)
                .description(request.getDescription().trim())
                .verificationAnswers(request.getVerificationAnswers() != null ? request.getVerificationAnswers().trim() : null)
                .proofImageUrl(proofUrl)
                .status(ClaimStatus.PENDING)
                .build();

        Claim savedClaim = claimRepository.save(claim);

        // Update item status to PENDING_CLAIM if it was OPEN
        if (item.getStatus() == ItemStatus.OPEN) {
            item.setStatus(ItemStatus.PENDING_CLAIM);
            itemRepository.save(item);
        }

        // Notify claimant
        notificationService.createNotification(
                currentUser,
                "Claim Submitted Successfully",
                "Your ownership claim for '" + item.getTitle() + "' has been submitted and is currently pending review by campus security.",
                NotificationType.CLAIM_UPDATE,
                item.getId()
        );

        // Notify reporter
        notificationService.createNotification(
                item.getReportedBy(),
                "New Claim Submitted for Found Item",
                "A claimant has submitted an ownership claim for '" + item.getTitle() + "'. Our admin team is reviewing their verification answers.",
                NotificationType.CLAIM_UPDATE,
                item.getId()
        );

        return ClaimDto.from(savedClaim);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimDto> getMyClaims(Pageable pageable) {
        User currentUser = authService.getCurrentUser();
        Page<ClaimDto> page = claimRepository.findByClaimantId(currentUser.getId(), pageable)
                .map(ClaimDto::from);
        return PagedResponse.from(page);
    }

    @Transactional(readOnly = true)
    public ClaimDto getClaimById(Long id) {
        User currentUser = authService.getCurrentUser();
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        // Only claimant or admin can view details
        if (!claim.getClaimant().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("You do not have permission to view this claim");
        }

        return ClaimDto.from(claim);
    }

    @Transactional
    public ClaimDto provideAdditionalInformation(Long id, AdditionalInfoRequest request) {
        User currentUser = authService.getCurrentUser();
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (!claim.getClaimant().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own claims");
        }

        String existingAnswers = claim.getVerificationAnswers() != null ? claim.getVerificationAnswers() : "";
        String updated = existingAnswers + "\n\n[Additional Info Provided]: " + request.getAdditionalInformation().trim();

        claim.setVerificationAnswers(updated);
        claim.setStatus(ClaimStatus.UNDER_REVIEW);
        Claim saved = claimRepository.save(claim);

        notificationService.createNotification(
                currentUser,
                "Additional Verification Details Received",
                "Your additional information for '" + claim.getItem().getTitle() + "' was recorded. Admin status updated to Under Review.",
                NotificationType.CLAIM_UPDATE,
                claim.getItem().getId()
        );

        return ClaimDto.from(saved);
    }
}

