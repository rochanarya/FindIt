package com.findit.dto.request;

import com.findit.enums.ItemStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateItemRequest {
    @Size(min = 3, max = 200)
    private String title;

    private String description;
    private Long categoryId;
    private String location;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate itemDate;

    private String color;
    private String brand;
    private String identifyingFeatures;
    private ItemStatus status;
}

