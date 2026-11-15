package com.findit.controller;

import com.findit.dto.request.CreateItemRequest;
import com.findit.dto.request.UpdateItemRequest;
import com.findit.dto.response.ApiResponse;
import com.findit.dto.response.ItemDto;
import com.findit.dto.response.ItemMatchDto;
import com.findit.dto.response.PagedResponse;
import com.findit.enums.ItemStatus;
import com.findit.enums.ItemType;
import com.findit.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Tag(name = "Items", description = "Lost and Found item reporting and discovery")
public class ItemController {

    private final ItemService itemService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Report a new lost or found item with optional images")
    public ResponseEntity<ApiResponse<ItemDto>> createItem(
            @Valid @ModelAttribute CreateItemRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        ItemDto created = itemService.createItem(request, images);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item report created successfully", created));
    }

    @GetMapping
    @Operation(summary = "Browse items with search, filters, sorting and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ItemDto>>> getItems(
            @RequestParam(required = false) ItemType itemType,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ItemDto> result = itemService.getItems(itemType, categoryId, status, location, startDate, endDate, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured recent items for landing page")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getFeaturedItems() {
        return ResponseEntity.ok(ApiResponse.success(itemService.getFeaturedItems()));
    }

    @GetMapping("/search")
    @Operation(summary = "Quick keyword search")
    public ResponseEntity<ApiResponse<PagedResponse<ItemDto>>> searchItems(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(itemService.searchItems(q, pageable)));
    }

    @GetMapping("/my-reports")
    @Operation(summary = "Get current student's reported items")
    public ResponseEntity<ApiResponse<PagedResponse<ItemDto>>> getMyReports(
            @RequestParam(required = false) ItemType itemType,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(itemService.getMyReports(itemType, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item details by ID")
    public ResponseEntity<ApiResponse<ItemDto>> getItemById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItemById(id)));
    }

    @GetMapping("/matches/{id}")
    @Operation(summary = "Get matching recommendations for an item")
    public ResponseEntity<ApiResponse<List<ItemMatchDto>>> getMatches(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getMatches(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an item report (Owner or Admin)")
    public ResponseEntity<ApiResponse<ItemDto>> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Item updated successfully", itemService.updateItem(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an item report (Owner or Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable UUID id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted successfully", null));
    }
}

