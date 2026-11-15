package com.findit.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalInfoRequest {
    @NotBlank(message = "Additional information cannot be empty")
    private String additionalInformation;
}

