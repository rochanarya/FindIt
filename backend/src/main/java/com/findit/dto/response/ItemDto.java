package com.findit.dto.response;

import com.findit.entity.Item;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private UUID id;
    private String title;
    private String description;
    private ItemType itemType;
    private CategoryDto category;
    private UserDto reportedBy;
    private String location;
    private LocalDate itemDate;
    private String color;
    private String brand;
    private String identifyingFeatures;
    private ItemStatus status;
    private List<ItemImageDto> images;
    private Instant createdAt;
    private Instant updatedAt;

    public static ItemDto from(Item item) {
        if (item == null) return null;
        return ItemDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .itemType(item.getItemType())
                .category(CategoryDto.from(item.getCategory()))
                .reportedBy(UserDto.from(item.getReportedBy()))
                .location(item.getLocation())
                .itemDate(item.getItemDate())
                .color(item.getColor())
                .brand(item.getBrand())
                .identifyingFeatures(item.getIdentifyingFeatures())
                .status(item.getStatus())
                .images(item.getImages() != null ?
                        item.getImages().stream().map(ItemImageDto::from).collect(Collectors.toList()) :
                        Collections.emptyList())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}

