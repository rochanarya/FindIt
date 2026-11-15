package com.findit.service;

import com.findit.dto.request.CreateItemRequest;
import com.findit.dto.response.ItemDto;
import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.entity.User;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.enums.UserRole;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ItemImageRepository;
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
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ItemImageRepository itemImageRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private MatchingService matchingService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ItemService itemService;

    private User student1;
    private User student2;
    private Category category;

    @BeforeEach
    void setUp() {
        student1 = User.builder().id(UUID.randomUUID()).fullName("Student One").email("s1@campus.edu").role(UserRole.STUDENT).build();
        student2 = User.builder().id(UUID.randomUUID()).fullName("Student Two").email("s2@campus.edu").role(UserRole.STUDENT).build();
        category = Category.builder().id(1L).name("Electronics").build();
    }

    @Test
    @DisplayName("Should create item report successfully")
    void shouldCreateItemReport() {
        CreateItemRequest request = CreateItemRequest.builder()
                .title("Calculus Textbook")
                .description("Stewart Calculus 9th edition with green cover")
                .itemType(ItemType.LOST)
                .categoryId(1L)
                .location("Math Building 302")
                .itemDate(LocalDate.now())
                .color("Green")
                .brand("Cengage")
                .build();

        Item savedItem = Item.builder()
                .id(UUID.randomUUID())
                .title(request.getTitle())
                .description(request.getDescription())
                .itemType(request.getItemType())
                .category(category)
                .reportedBy(student1)
                .location(request.getLocation())
                .itemDate(request.getItemDate())
                .color(request.getColor())
                .brand(request.getBrand())
                .status(ItemStatus.OPEN)
                .build();

        when(authService.getCurrentUser()).thenReturn(student1);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(itemRepository.save(any(Item.class))).thenReturn(savedItem);
        when(matchingService.findMatchesForItem(any())).thenReturn(Collections.emptyList());

        ItemDto result = itemService.createItem(request, null);

        assertNotNull(result);
        assertEquals("Calculus Textbook", result.getTitle());
        assertEquals(ItemStatus.OPEN, result.getStatus());
        verify(itemRepository).save(any(Item.class));
    }

    @Test
    @DisplayName("Should forbid other user from deleting item report")
    void shouldPreventOtherUserFromDeletingItem() {
        UUID itemId = UUID.randomUUID();
        Item item = Item.builder()
                .id(itemId)
                .title("My Wallet")
                .reportedBy(student1)
                .build();

        when(authService.getCurrentUser()).thenReturn(student2);
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));

        assertThrows(UnauthorizedException.class, () -> itemService.deleteItem(itemId));
        verify(itemRepository, never()).delete(any(Item.class));
    }
}

