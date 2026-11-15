package com.findit.service;

import com.findit.dto.request.CreateItemRequest;
import com.findit.dto.request.UpdateItemRequest;
import com.findit.dto.response.ItemDto;
import com.findit.dto.response.ItemMatchDto;
import com.findit.dto.response.PagedResponse;
import com.findit.entity.Category;
import com.findit.entity.Item;
import com.findit.entity.ItemImage;
import com.findit.entity.User;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.enums.NotificationType;
import com.findit.enums.UserRole;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.CategoryRepository;
import com.findit.repository.ItemImageRepository;
import com.findit.repository.ItemRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final FileStorageService fileStorageService;
    private final MatchingService matchingService;
    private final NotificationService notificationService;

    @Transactional
    public ItemDto createItem(CreateItemRequest request, List<MultipartFile> imageFiles) {
        User currentUser = authService.getCurrentUser();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Item item = Item.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .itemType(request.getItemType())
                .category(category)
                .reportedBy(currentUser)
                .location(request.getLocation().trim())
                .itemDate(request.getItemDate())
                .color(request.getColor() != null ? request.getColor().trim() : null)
                .brand(request.getBrand() != null ? request.getBrand().trim() : null)
                .identifyingFeatures(request.getIdentifyingFeatures() != null ? request.getIdentifyingFeatures().trim() : null)
                .status(ItemStatus.OPEN)
                .build();

        Item savedItem = itemRepository.save(item);

        // Upload images if provided (max 5)
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() > 5) {
                throw new BadRequestException("You can upload a maximum of 5 images");
            }
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    FileStorageService.UploadResult uploadResult = fileStorageService.uploadFile(file, "items");
                    ItemImage itemImage = ItemImage.builder()
                            .item(savedItem)
                            .imageUrl(uploadResult.getUrl())
                            .publicId(uploadResult.getPublicId())
                            .build();
                    savedItem.addImage(itemImage);
                }
            }
            savedItem = itemRepository.save(savedItem);
        }

        // Run matching engine asynchronously / notify potential matches
        try {
            List<ItemMatchDto> matches = matchingService.findMatchesForItem(savedItem);
            for (ItemMatchDto match : matches) {
                if (match.getMatchScore() >= 65) {
                    // Notify the owner of the existing item
                    Item matchedItem = itemRepository.findById(match.getMatchedItem().getId()).orElse(null);
                    if (matchedItem != null && !matchedItem.getReportedBy().getId().equals(currentUser.getId())) {
                        String matchTitle = "Potential match found for: " + matchedItem.getTitle();
                        String matchMsg = String.format("A new %s item '%s' was reported that matches your report (%d%% match score).",
                                savedItem.getItemType().name().toLowerCase(),
                                savedItem.getTitle(),
                                match.getMatchScore());
                        notificationService.createNotification(
                                matchedItem.getReportedBy(),
                                matchTitle,
                                matchMsg,
                                NotificationType.MATCH_FOUND,
                                savedItem.getId()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Matching check failed during item creation: {}", e.getMessage());
        }

        return ItemDto.from(savedItem);
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(UUID id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return ItemDto.from(item);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemDto> getItems(
            ItemType itemType,
            Long categoryId,
            ItemStatus status,
            String location,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable
    ) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (itemType != null) {
                predicates.add(cb.equal(root.get("itemType"), itemType));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("itemDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("itemDate"), endDate));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate colorMatch = cb.like(cb.lower(root.get("color")), searchPattern);
                Predicate featuresMatch = cb.like(cb.lower(root.get("identifyingFeatures")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch, brandMatch, colorMatch, featuresMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ItemDto> page = itemRepository.findAll(spec, pageable).map(ItemDto::from);
        return PagedResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemDto> getMyReports(ItemType itemType, ItemStatus status, Pageable pageable) {
        User currentUser = authService.getCurrentUser();

        Page<Item> page;
        if (itemType != null && status != null) {
            Specification<Item> spec = (root, query, cb) -> cb.and(
                    cb.equal(root.get("reportedBy").get("id"), currentUser.getId()),
                    cb.equal(root.get("itemType"), itemType),
                    cb.equal(root.get("status"), status)
            );
            page = itemRepository.findAll(spec, pageable);
        } else if (itemType != null) {
            page = itemRepository.findByReportedByIdAndItemType(currentUser.getId(), itemType, pageable);
        } else if (status != null) {
            page = itemRepository.findByReportedByIdAndStatus(currentUser.getId(), status, pageable);
        } else {
            page = itemRepository.findByReportedById(currentUser.getId(), pageable);
        }

        return PagedResponse.from(page.map(ItemDto::from));
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getFeaturedItems() {
        return itemRepository.findTop6ByOrderByCreatedAtDesc().stream()
                .map(ItemDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemDto> searchItems(String keyword, Pageable pageable) {
        return getItems(null, null, null, null, null, null, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public List<ItemMatchDto> getMatches(UUID itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        return matchingService.findMatchesForItem(item);
    }

    @Transactional
    public ItemDto updateItem(UUID id, UpdateItemRequest request) {
        User currentUser = authService.getCurrentUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // Only owner or admin can update
        if (!item.getReportedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("You do not have permission to update this report");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            item.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            item.setDescription(request.getDescription().trim());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            item.setCategory(category);
        }
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            item.setLocation(request.getLocation().trim());
        }
        if (request.getItemDate() != null) {
            item.setItemDate(request.getItemDate());
        }
        if (request.getColor() != null) {
            item.setColor(request.getColor().trim());
        }
        if (request.getBrand() != null) {
            item.setBrand(request.getBrand().trim());
        }
        if (request.getIdentifyingFeatures() != null) {
            item.setIdentifyingFeatures(request.getIdentifyingFeatures().trim());
        }
        if (request.getStatus() != null) {
            // Only admin can set status to RESOLVED or REJECTED unless user cancels their own
            if (currentUser.getRole() != UserRole.ADMIN && request.getStatus() == ItemStatus.RESOLVED) {
                throw new UnauthorizedException("Only campus administrators can mark items as successfully returned / resolved");
            }
            item.setStatus(request.getStatus());
        }

        return ItemDto.from(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID id) {
        User currentUser = authService.getCurrentUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        if (!item.getReportedBy().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("You do not have permission to delete this report");
        }

        // Delete images
        if (item.getImages() != null) {
            for (ItemImage image : item.getImages()) {
                fileStorageService.deleteFile(image.getPublicId());
            }
        }

        itemRepository.delete(item);
    }
}

