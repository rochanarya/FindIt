package com.findit.dto.response;

import com.findit.entity.User;
import com.findit.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String fullName;
    private String email;
    private String studentId;
    private String department;
    private String yearOfStudy;
    private UserRole role;
    private boolean active;
    private Instant createdAt;

    public static UserDto from(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .yearOfStudy(user.getYearOfStudy())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

