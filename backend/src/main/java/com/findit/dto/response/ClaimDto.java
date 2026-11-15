package com.findit.dto.response;

import com.findit.entity.Claim;
import com.findit.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDto {
    private Long id;
    private ItemDto item;
    private UserDto claimant;
    private String description;
    private String verificationAnswers;
    private String proofImageUrl;
    private ClaimStatus status;
    private String adminComment;
    private UserDto reviewedBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static ClaimDto from(Claim claim) {
        if (claim == null) return null;
        return ClaimDto.builder()
                .id(claim.getId())
                .item(ItemDto.from(claim.getItem()))
                .claimant(UserDto.from(claim.getClaimant()))
                .description(claim.getDescription())
                .verificationAnswers(claim.getVerificationAnswers())
                .proofImageUrl(claim.getProofImageUrl())
                .status(claim.getStatus())
                .adminComment(claim.getAdminComment())
                .reviewedBy(UserDto.from(claim.getReviewedBy()))
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }
}

