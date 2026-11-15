package com.findit.dto.response;

import com.findit.entity.ItemImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemImageDto {
    private Long id;
    private String imageUrl;
    private String publicId;
    private Instant createdAt;

    public static ItemImageDto from(ItemImage image) {
        if (image == null) return null;
        return ItemImageDto.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .publicId(image.getPublicId())
                .createdAt(image.getCreatedAt())
                .build();
    }
}

