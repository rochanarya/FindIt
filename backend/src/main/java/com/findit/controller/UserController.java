package com.findit.controller;

import com.findit.dto.request.UpdateProfileRequest;
import com.findit.dto.response.ApiResponse;
import com.findit.dto.response.UserDto;
import com.findit.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userService.updateProfile(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public user profile by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }
}

