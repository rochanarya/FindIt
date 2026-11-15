package com.findit.service;

import com.findit.dto.request.LoginRequest;
import com.findit.dto.request.RefreshTokenRequest;
import com.findit.dto.request.RegisterRequest;
import com.findit.dto.response.AuthResponse;
import com.findit.dto.response.UserDto;
import com.findit.entity.User;
import com.findit.enums.UserRole;
import com.findit.exception.BadRequestException;
import com.findit.exception.ConflictException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.UserRepository;
import com.findit.security.CustomUserDetails;
import com.findit.security.JwtService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.admin.email:admin@findit.campus.edu}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@FindIt2026}")
    private String adminPassword;

    @Value("${app.admin.name:Campus Security & Admin}")
    private String adminName;

    @PostConstruct
    @Transactional
    public void initAdmin() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .department("Campus Safety & Security")
                    .role(UserRole.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Initialized default administrator account: {}", adminEmail);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .studentId(request.getStudentId())
                .department(request.getDepartment())
                .yearOfStudy(request.getYearOfStudy())
                .role(UserRole.STUDENT)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", savedUser.getRole().name());
        claims.put("userId", savedUser.getId().toString());

        String accessToken = jwtService.generateToken(claims, userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserDto.from(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been suspended. Please contact campus security.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateToken(claims, userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserDto.from(user))
                .build();
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String userEmail;

        try {
            userEmail = jwtService.extractUsername(token);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId().toString());

        String newAccessToken = jwtService.generateToken(claims, userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(token)
                .user(UserDto.from(user))
                .build();
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}

