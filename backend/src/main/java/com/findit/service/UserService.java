package com.findit.service;

import com.findit.dto.request.UpdateProfileRequest;
import com.findit.dto.response.UserDto;
import com.findit.entity.User;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public UserDto getProfile() {
        User currentUser = authService.getCurrentUser();
        return UserDto.from(currentUser);
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User currentUser = authService.getCurrentUser();
        currentUser.setFullName(request.getFullName().trim());
        if (request.getStudentId() != null) {
            currentUser.setStudentId(request.getStudentId().trim());
        }
        if (request.getDepartment() != null) {
            currentUser.setDepartment(request.getDepartment().trim());
        }
        if (request.getYearOfStudy() != null) {
            currentUser.setYearOfStudy(request.getYearOfStudy().trim());
        }
        User updated = userRepository.save(currentUser);
        return UserDto.from(updated);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.from(user);
    }
}

