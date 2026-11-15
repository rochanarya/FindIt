package com.findit.controller;

import com.findit.dto.request.ReviewClaimRequest;
import com.findit.dto.response.*;
import com.findit.enums.ClaimStatus;
import com.findit.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administration and moderation operations")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview metrics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get detailed analytics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/items")
    @Operation(summary = "Get all items for moderation")
    public ResponseEntity<ApiResponse<PagedResponse<ItemDto>>> getItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllItems(pageable)));
    }

    @GetMapping("/claims")
    @Operation(summary = "Get all claims for moderation")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimDto>>> getClaims(
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllClaims(status, pageable)));
    }

    @GetMapping("/claims/{id}")
    @Operation(summary = "Get specific claim for review")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getClaimById(id)));
    }

    @PatchMapping("/claims/{id}/approve")
    @Operation(summary = "Approve an ownership claim")
    public ResponseEntity<ApiResponse<ClaimDto>> approveClaim(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Claim approved successfully", adminService.approveClaim(id, request)));
    }

    @PatchMapping("/claims/{id}/reject")
    @Operation(summary = "Reject an ownership claim")
    public ResponseEntity<ApiResponse<ClaimDto>> rejectClaim(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Claim rejected", adminService.rejectClaim(id, request)));
    }

    @PatchMapping("/claims/{id}/request-information")
    @Operation(summary = "Request additional verification information from claimant")
    public ResponseEntity<ApiResponse<ClaimDto>> requestInformation(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Information requested from claimant", adminService.requestInformation(id, request)));
    }

    @PatchMapping("/items/{id}/resolve")
    @Operation(summary = "Mark an item report as resolved/returned")
    public ResponseEntity<ApiResponse<ItemDto>> resolveItem(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Item marked as resolved", adminService.resolveItem(id)));
    }

    @PatchMapping("/items/{id}/remove")
    @Operation(summary = "Remove a fraudulent or inappropriate listing")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable UUID id) {
        adminService.removeItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item removed successfully", null));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(pageable)));
    }

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend user account")
    public ResponseEntity<ApiResponse<UserDto>> suspendUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("User account suspended", adminService.suspendUser(id)));
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Reactivate suspended user account")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("User account activated", adminService.activateUser(id)));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get admin audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditLogs(pageable)));
    }
}
