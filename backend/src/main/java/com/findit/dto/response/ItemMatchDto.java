package com.findit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemMatchDto {
    private ItemDto matchedItem;
    private int matchScore; // 0 to 100
    private Map<String, Integer> scoreBreakdown;
    private String matchSummary;
}

