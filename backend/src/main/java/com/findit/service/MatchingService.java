package com.findit.service;

import com.findit.dto.response.ItemDto;
import com.findit.dto.response.ItemMatchDto;
import com.findit.entity.Item;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<ItemMatchDto> findMatchesForItem(Item targetItem) {
        ItemType oppositeType = targetItem.getItemType() == ItemType.LOST ? ItemType.FOUND : ItemType.LOST;

        List<Item> candidates = itemRepository.findCandidatesForMatching(
                oppositeType,
                ItemStatus.OPEN,
                targetItem.getId()
        );

        List<ItemMatchDto> matches = new ArrayList<>();

        for (Item candidate : candidates) {
            Map<String, Integer> breakdown = new LinkedHashMap<>();
            int totalScore = calculateMatchScore(targetItem, candidate, breakdown);

            if (totalScore >= 50) {
                matches.add(ItemMatchDto.builder()
                        .matchedItem(ItemDto.from(candidate))
                        .matchScore(totalScore)
                        .scoreBreakdown(breakdown)
                        .matchSummary(generateMatchSummary(totalScore, breakdown))
                        .build());
            }
        }

        // Sort descending by score
        matches.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return matches;
    }

    public int calculateMatchScore(Item item1, Item item2, Map<String, Integer> breakdown) {
        int categoryScore = 0;
        int titleScore = 0;
        int descriptionScore = 0;
        int colorScore = 0;
        int brandScore = 0;
        int locationScore = 0;

        // 1. Category match (25 pts)
        if (item1.getCategory() != null && item2.getCategory() != null &&
            Objects.equals(item1.getCategory().getId(), item2.getCategory().getId())) {
            categoryScore = 25;
        }

        // 2. Title similarity (25 pts max)
        double titleSim = computeJaccardSimilarity(item1.getTitle(), item2.getTitle());
        titleScore = (int) Math.round(titleSim * 25.0);

        // 3. Description similarity (20 pts max)
        double descSim = computeJaccardSimilarity(item1.getDescription(), item2.getDescription());
        descriptionScore = (int) Math.round(descSim * 20.0);

        // 4. Color match (10 pts)
        if (isTextSimilar(item1.getColor(), item2.getColor())) {
            colorScore = 10;
        }

        // 5. Brand match (10 pts)
        if (isTextSimilar(item1.getBrand(), item2.getBrand())) {
            brandScore = 10;
        }

        // 6. Location similarity (10 pts max)
        double locSim = computeJaccardSimilarity(item1.getLocation(), item2.getLocation());
        locationScore = (int) Math.round(locSim * 10.0);

        // Optional date bonus: if within 7 days, add a small 5-point proximity boost if location or category matches
        if (item1.getItemDate() != null && item2.getItemDate() != null) {
            long daysDiff = Math.abs(ChronoUnit.DAYS.between(item1.getItemDate(), item2.getItemDate()));
            if (daysDiff <= 7 && (locationScore > 0 || categoryScore > 0)) {
                locationScore = Math.min(10, locationScore + 2);
            }
        }

        int total = categoryScore + titleScore + descriptionScore + colorScore + brandScore + locationScore;
        total = Math.min(100, Math.max(0, total));

        if (breakdown != null) {
            breakdown.put("Category Match", categoryScore);
            breakdown.put("Title Similarity", titleScore);
            breakdown.put("Description Similarity", descriptionScore);
            breakdown.put("Color Match", colorScore);
            breakdown.put("Brand Match", brandScore);
            breakdown.put("Location Match", locationScore);
        }

        return total;
    }

    private double computeJaccardSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) {
            return 0.0;
        }
        Set<String> words1 = tokenize(text1);
        Set<String> words2 = tokenize(text2);

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        if (union.isEmpty()) {
            return 0.0;
        }

        return (double) intersection.size() / (double) union.size();
    }

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        // Remove punctuation, lowercase, split on whitespace
        String clean = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = clean.split("\\s+");
        Set<String> stopWords = Set.of("the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "is", "my", "lost", "found");
        return Arrays.stream(tokens)
                .map(String::trim)
                .filter(t -> t.length() > 1 && !stopWords.contains(t))
                .collect(Collectors.toSet());
    }

    private boolean isTextSimilar(String s1, String s2) {
        if (s1 == null || s2 == null) return false;
        String c1 = s1.trim().toLowerCase();
        String c2 = s2.trim().toLowerCase();
        if (c1.isEmpty() || c2.isEmpty()) return false;
        return c1.equals(c2) || c1.contains(c2) || c2.contains(c1);
    }

    private String generateMatchSummary(int totalScore, Map<String, Integer> breakdown) {
        if (totalScore >= 80) {
            return "High confidence match based on matching category, description keywords, and location.";
        } else if (totalScore >= 65) {
            return "Strong potential match with shared category and item characteristics.";
        } else {
            return "Moderate potential match. Review the item details to verify ownership.";
        }
    }
}

