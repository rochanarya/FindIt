package com.findit.controller;

import com.findit.dto.response.ApiResponse;
import com.findit.dto.response.DashboardStatsDto;
import com.findit.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Public and student dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide summary statistics (Public)")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getPublicStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getPublicStats()));
    }

    @GetMapping("/student")
    @Operation(summary = "Get personal statistics for logged-in student")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStudentStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStudentStats()));
    }
}

