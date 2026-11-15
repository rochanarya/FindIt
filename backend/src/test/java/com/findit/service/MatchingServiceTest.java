package com.findit.service;

import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private MatchingService matchingService;

    private Category electronicsCategory;
    private Category booksCategory;

    @BeforeEach
    void setUp() {
        electronicsCategory = Category.builder().id(1L).name("Electronics").build();
        booksCategory = Category.builder().id(2L).name("Books").build();
    }

    @Test
    @DisplayName("Should award high score when category, title, color, brand, and location match")
    void shouldCalculateHighScoreForMatchingItems() {
        Item lostItem = Item.builder()
                .id(UUID.randomUUID())
                .title("Black Dell XPS 15 Laptop")
                .description("Lost my black Dell XPS 15 with Intel Core i7 inside campus library 2nd floor")
                .itemType(ItemType.LOST)
                .category(electronicsCategory)
                .color("Black")
                .brand("Dell")
                .location("Central Library Floor 2")
                .itemDate(LocalDate.now())
                .status(ItemStatus.OPEN)
                .build();

        Item foundItem = Item.builder()
                .id(UUID.randomUUID())
                .title("Dell XPS Laptop Black")
                .description("Found a Dell XPS 15 laptop on study table in central library floor 2")
                .itemType(ItemType.FOUND)
                .category(electronicsCategory)
                .color("Black")
                .brand("Dell")
                .location("Central Library Floor 2")
                .itemDate(LocalDate.now())
                .status(ItemStatus.OPEN)
                .build();

        Map<String, Integer> breakdown = new HashMap<>();
        int score = matchingService.calculateMatchScore(lostItem, foundItem, breakdown);

        assertTrue(score >= 70, "Score should be >= 70, got: " + score);
        assertEquals(25, breakdown.get("Category Match"));
        assertEquals(10, breakdown.get("Color Match"));
        assertEquals(10, breakdown.get("Brand Match"));
        assertTrue(breakdown.get("Title Similarity") > 10);
        assertTrue(breakdown.get("Description Similarity") > 5);
    }

    @Test
    @DisplayName("Should return low score for completely different items")
    void shouldCalculateLowScoreForDifferentItems() {
        Item lostItem = Item.builder()
                .id(UUID.randomUUID())
                .title("Blue Umbrella")
                .description("Left my navy umbrella in lecture hall 101")
                .itemType(ItemType.LOST)
                .category(booksCategory)
                .color("Blue")
                .brand("Repel")
                .location("Lecture Hall 101")
                .itemDate(LocalDate.now().minusDays(20))
                .build();

        Item foundItem = Item.builder()
                .id(UUID.randomUUID())
                .title("Gold Wrist Watch")
                .description("Found expensive gold analog watch near cafeteria")
                .itemType(ItemType.FOUND)
                .category(electronicsCategory)
                .color("Gold")
                .brand("Titan")
                .location("Student Cafeteria")
                .itemDate(LocalDate.now())
                .build();

        Map<String, Integer> breakdown = new HashMap<>();
        int score = matchingService.calculateMatchScore(lostItem, foundItem, breakdown);

        assertTrue(score < 50, "Score should be < 50 for unrelated items, got: " + score);
    }
}

