package com.findit.controller;

import com.findit.dto.request.AdditionalInfoRequest;
import com.findit.dto.request.CreateClaimRequest;
import com.findit.dto.response.ApiResponse;
import com.findit.dto.response.ClaimDto;
import com.findit.dto.response.PagedResponse;
import com.findit.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Ownership claims submission and tracking")
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit an ownership claim for a found item")
    public ResponseEntity<ApiResponse<ClaimDto>> createClaim(
            @Valid @ModelAttribute CreateClaimRequest request,
            @RequestParam(value = "proofImage", required = false) MultipartFile proofImage
    ) {
        ClaimDto created = claimService.createClaim(request, proofImage);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Claim submitted successfully", created));
    }

    @GetMapping("/my-claims")
    @Operation(summary = "Get list of claims submitted by current student")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimDto>>> getMyClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(claimService.getMyClaims(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get claim details by ID")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(claimService.getClaimById(id)));
    }

    @PutMapping("/{id}/additional-information")
    @Operation(summary = "Provide additional verification details requested by admin")
    public ResponseEntity<ApiResponse<ClaimDto>> provideAdditionalInfo(
            @PathVariable Long id,
            @Valid @RequestBody AdditionalInfoRequest request
    ) {
        ClaimDto updated = claimService.provideAdditionalInformation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Additional information submitted", updated));
    }
}

