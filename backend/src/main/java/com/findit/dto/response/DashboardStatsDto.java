package com.findit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalUsers;
    private long totalReports;
    private long lostReports;
    private long foundReports;
    private long pendingClaims;
    private long resolvedItems;
    private long activeReports;

    // Student specific
    private long myLostReports;
    private long myFoundReports;
    private long myActiveClaims;
    private long myResolvedItems;

    // Charts data
    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> categoryDistribution;
}

