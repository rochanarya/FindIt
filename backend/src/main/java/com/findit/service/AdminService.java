package com.findit.service;

import com.findit.dto.request.ReviewClaimRequest;
import com.findit.dto.response.*;
import com.findit.entity.AuditLog;
import com.findit.entity.Claim;
import com.findit.entity.Item;
import com.findit.entity.User;
import com.findit.enums.ClaimStatus;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.enums.NotificationType;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.AuditLogRepository;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalReports = itemRepository.count();
        long lostReports = itemRepository.countByItemType(ItemType.LOST);
        long foundReports = itemRepository.countByItemType(ItemType.FOUND);
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.PENDING) +
                             claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW);
        long resolvedItems = itemRepository.countByStatus(ItemStatus.RESOLVED);
        long activeReports = itemRepository.countByStatus(ItemStatus.OPEN) +
                             itemRepository.countByStatus(ItemStatus.PENDING_CLAIM);

        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        try {
            List<Object[]> rows = itemRepository.getMonthlyItemStats();
            for (Object[] row : rows) {
                if (row.length >= 2 && row[0] != null) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("month", row[0].toString());
                    point.put("count", ((Number) row[1]).longValue());
                    monthlyTrends.add(point);
                }
            }
        } catch (Exception e) {
            log.debug("Error computing monthly trends: {}", e.getMessage());
        }

        if (monthlyTrends.isEmpty()) {
            // Provide sensible recent months data point
            String currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Map<String, Object> point = new HashMap<>();
            point.put("month", currentMonth);
            point.put("count", totalReports);
            monthlyTrends.add(point);
        }

        List<Map<String, Object>> categoryDistribution = new ArrayList<>();
        try {
            List<Object[]> catRows = itemRepository.getCategoryItemStats();
            for (Object[] row : catRows) {
                if (row.length >= 2 && row[0] != null) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("name", row[0].toString());
                    point.put("count", ((Number) row[1]).longValue());
                    categoryDistribution.add(point);
                }
            }
        } catch (Exception e) {
            log.debug("Error computing category stats: {}", e.getMessage());
        }

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalReports(totalReports)
                .lostReports(lostReports)
                .foundReports(foundReports)
                .pendingClaims(pendingClaims)
                .resolvedItems(resolvedItems)
                .activeReports(activeReports)
                .monthlyTrends(monthlyTrends)
                .categoryDistribution(categoryDistribution)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemDto> getAllItems(Pageable pageable) {
        Page<ItemDto> page = itemRepository.findAll(pageable).map(ItemDto::from);
        return PagedResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimDto> getAllClaims(ClaimStatus status, Pageable pageable) {
        Page<Claim> page;
        if (status != null) {
            page = claimRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), status), pageable);
        } else {
            page = claimRepository.findAll(pageable);
        }
        return PagedResponse.from(page.map(ClaimDto::from));
    }

    @Transactional(readOnly = true)
    public ClaimDto getClaimById(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
        return ClaimDto.from(claim);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ClaimDto approveClaim(Long id, ReviewClaimRequest request) {
        User admin = authService.getCurrentUser();

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        Item item = claim.getItem();

        // Enforce concurrency safety: prevent multiple claims from being approved
        if (item.getStatus() == ItemStatus.RESOLVED || item.getStatus() == ItemStatus.CLAIMED) {
            throw new BadRequestException("This item has already been marked as resolved or awarded to another claimant");
        }

        claim.setStatus(ClaimStatus.APPROVED);
        claim.setAdminComment(request != null && request.getComment() != null ? request.getComment().trim() : "Approved by administrator");
        claim.setReviewedBy(admin);
        Claim savedClaim = claimRepository.save(claim);

        // Mark item as RESOLVED / returned to owner
        item.setStatus(ItemStatus.RESOLVED);
        itemRepository.save(item);

        // Reject other pending claims for this item
        List<Claim> otherClaims = claimRepository.findPendingClaimsByItemId(item.getId());
        for (Claim other : otherClaims) {
            if (!other.getId().equals(claim.getId())) {
                other.setStatus(ClaimStatus.REJECTED);
                other.setAdminComment("Item was successfully verified and awarded to another claimant");
                other.setReviewedBy(admin);
                claimRepository.save(other);

                notificationService.createNotification(
                        other.getClaimant(),
                        "Claim Status Update: Item Awarded",
                        "Your claim for '" + item.getTitle() + "' was closed as ownership was verified with another claimant.",
                        NotificationType.CLAIM_UPDATE,
                        item.getId()
                );
            }
        }

        // Notify winning claimant
        notificationService.createNotification(
                claim.getClaimant(),
                "Claim Approved! Item Ready for Collection",
                "Your ownership claim for '" + item.getTitle() + "' has been APPROVED. You can collect your item at Campus Security Office. Admin note: " + claim.getAdminComment(),
                NotificationType.CLAIM_UPDATE,
                item.getId()
        );

        // Notify reporter
        notificationService.createNotification(
                item.getReportedBy(),
                "Found Item Successfully Returned",
                "Great news! The item you reported ('" + item.getTitle() + "') has been verified and returned to its rightful owner.",
                NotificationType.ITEM_RESOLVED,
                item.getId()
        );

        // Log audit entry
        recordAudit(admin, "APPROVE_CLAIM", "CLAIM", claim.getId().toString(),
                "Approved claim for item: " + item.getTitle() + ", claimant: " + claim.getClaimant().getEmail());

        return ClaimDto.from(savedClaim);
    }

    @Transactional
    public ClaimDto rejectClaim(Long id, ReviewClaimRequest request) {
        User admin = authService.getCurrentUser();

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        claim.setStatus(ClaimStatus.REJECTED);
        claim.setAdminComment(request != null && request.getComment() != null ? request.getComment().trim() : "Claim rejected due to insufficient verification");
        claim.setReviewedBy(admin);
        Claim saved = claimRepository.save(claim);

        // Check if there are other pending claims; if none, revert item to OPEN
        Item item = claim.getItem();
        List<Claim> remaining = claimRepository.findPendingClaimsByItemId(item.getId());
        if (remaining.isEmpty() && item.getStatus() == ItemStatus.PENDING_CLAIM) {
            item.setStatus(ItemStatus.OPEN);
            itemRepository.save(item);
        }

        notificationService.createNotification(
                claim.getClaimant(),
                "Claim Rejected",
                "Your ownership claim for '" + item.getTitle() + "' was rejected. Reason: " + claim.getAdminComment(),
                NotificationType.CLAIM_UPDATE,
                item.getId()
        );

        recordAudit(admin, "REJECT_CLAIM", "CLAIM", claim.getId().toString(),
                "Rejected claim for item: " + item.getTitle() + ", reason: " + claim.getAdminComment());

        return ClaimDto.from(saved);
    }

    @Transactional
    public ClaimDto requestInformation(Long id, ReviewClaimRequest request) {
        User admin = authService.getCurrentUser();

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        String comment = (request != null && request.getComment() != null) ?
                request.getComment().trim() : "Please provide additional identifying details or serial numbers to verify ownership.";

        claim.setStatus(ClaimStatus.ADDITIONAL_INFORMATION_REQUIRED);
        claim.setAdminComment(comment);
        claim.setReviewedBy(admin);
        Claim saved = claimRepository.save(claim);

        notificationService.createNotification(
                claim.getClaimant(),
                "Additional Verification Required for Claim",
                "Campus security requires more details for '" + claim.getItem().getTitle() + "': " + comment,
                NotificationType.CLAIM_UPDATE,
                claim.getItem().getId()
        );

        recordAudit(admin, "REQUEST_INFO", "CLAIM", claim.getId().toString(),
                "Requested additional information for claim: " + claim.getId());

        return ClaimDto.from(saved);
    }

    @Transactional
    public ItemDto resolveItem(UUID id) {
        User admin = authService.getCurrentUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        item.setStatus(ItemStatus.RESOLVED);
        Item saved = itemRepository.save(item);

        notificationService.createNotification(
                item.getReportedBy(),
                "Report Marked as Resolved",
                "Your report for '" + item.getTitle() + "' has been marked as resolved by campus administration.",
                NotificationType.ITEM_RESOLVED,
                item.getId()
        );

        recordAudit(admin, "RESOLVE_ITEM", "ITEM", item.getId().toString(),
                "Marked item as resolved: " + item.getTitle());

        return ItemDto.from(saved);
    }

    @Transactional
    public void removeItem(UUID id) {
        User admin = authService.getCurrentUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        recordAudit(admin, "REMOVE_ITEM", "ITEM", item.getId().toString(),
                "Removed inappropriate/fraudulent item: " + item.getTitle());

        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllUsers(Pageable pageable) {
        Page<UserDto> page = userRepository.findAll(pageable).map(UserDto::from);
        return PagedResponse.from(page);
    }

    @Transactional
    public UserDto suspendUser(UUID id) {
        User admin = authService.getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(false);
        User saved = userRepository.save(user);

        recordAudit(admin, "SUSPEND_USER", "USER", user.getId().toString(),
                "Suspended user: " + user.getEmail());

        return UserDto.from(saved);
    }

    @Transactional
    public UserDto activateUser(UUID id) {
        User admin = authService.getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(true);
        User saved = userRepository.save(user);

        recordAudit(admin, "ACTIVATE_USER", "USER", user.getId().toString(),
                "Activated user: " + user.getEmail());

        return UserDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> getAuditLogs(Pageable pageable) {
        Page<AuditLogDto> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(AuditLogDto::from);
        return PagedResponse.from(page);
    }

    private void recordAudit(User admin, String action, String entityType, String entityId, String details) {
        try {
            AuditLog log = AuditLog.builder()
                    .admin(admin)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage());
        }
    }
}

