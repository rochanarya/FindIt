package com.findit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClaimRequest {

    @NotNull(message = "Item ID is required")
    private UUID itemId;

    @NotBlank(message = "Please describe why you believe this item is yours")
    private String description;

    private String verificationAnswers;
}

