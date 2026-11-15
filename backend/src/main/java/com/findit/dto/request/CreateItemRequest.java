package com.findit.dto.request;

import com.findit.enums.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateItemRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Item type is required (LOST or FOUND)")
    private ItemType itemType;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate itemDate;

    private String color;
    private String brand;
    private String identifyingFeatures;
}

