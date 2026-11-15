package com.findit.service;

import com.findit.dto.response.DashboardStatsDto;
import com.findit.dto.response.ItemDto;
import com.findit.entity.User;
import com.findit.enums.ClaimStatus;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsDto getPublicStats() {
        long totalReports = itemRepository.count();
        long resolvedItems = itemRepository.countByStatus(ItemStatus.RESOLVED);
        long activeReports = itemRepository.countByStatus(ItemStatus.OPEN) +
                             itemRepository.countByStatus(ItemStatus.PENDING_CLAIM);

        return DashboardStatsDto.builder()
                .totalReports(totalReports)
                .resolvedItems(resolvedItems)
                .activeReports(activeReports)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStudentStats() {
        User user = authService.getCurrentUser();

        long myLost = itemRepository.countByReportedByIdAndItemType(user.getId(), ItemType.LOST);
        long myFound = itemRepository.countByReportedByIdAndItemType(user.getId(), ItemType.FOUND);
        long myActiveClaims = claimRepository.countByClaimantIdAndStatus(user.getId(), ClaimStatus.PENDING) +
                              claimRepository.countByClaimantIdAndStatus(user.getId(), ClaimStatus.UNDER_REVIEW);
        long myResolved = itemRepository.countByReportedByIdAndStatus(user.getId(), ItemStatus.RESOLVED);

        long platformTotalReports = itemRepository.count();
        long platformResolved = itemRepository.countByStatus(ItemStatus.RESOLVED);
        long platformActive = itemRepository.countByStatus(ItemStatus.OPEN) +
                              itemRepository.countByStatus(ItemStatus.PENDING_CLAIM);

        return DashboardStatsDto.builder()
                .totalReports(platformTotalReports)
                .resolvedItems(platformResolved)
                .activeReports(platformActive)
                .myLostReports(myLost)
                .myFoundReports(myFound)
                .myActiveClaims(myActiveClaims)
                .myResolvedItems(myResolved)
                .build();
    }
}

