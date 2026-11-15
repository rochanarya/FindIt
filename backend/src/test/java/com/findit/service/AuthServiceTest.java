package com.findit.service;

import com.findit.dto.request.LoginRequest;
import com.findit.dto.request.RegisterRequest;
import com.findit.dto.response.AuthResponse;
import com.findit.entity.User;
import com.findit.enums.UserRole;
import com.findit.exception.ConflictException;
import com.findit.exception.UnauthorizedException;
import com.findit.repository.UserRepository;
import com.findit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Alex Chen")
                .email("alex@campus.edu")
                .password("encoded_pass")
                .role(UserRole.STUDENT)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register student and hash password")
    void shouldRegisterStudentSuccessfully() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Alex Chen")
                .email("alex@campus.edu")
                .password("Password123!")
                .studentId("STU-101")
                .department("Computer Science")
                .yearOfStudy("3rd Year")
                .build();

        when(userRepository.existsByEmail("alex@campus.edu")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(anyMap(), any())).thenReturn("mock_access_token");
        when(jwtService.generateRefreshToken(any())).thenReturn("mock_refresh_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        assertEquals("mock_refresh_token", response.getRefreshToken());
        assertEquals("Alex Chen", response.getUser().getFullName());
        assertEquals(UserRole.STUDENT, response.getUser().getRole());
        verify(passwordEncoder).encode("Password123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when registering existing email")
    void shouldThrowConflictWhenEmailExists() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Duplicate User")
                .email("alex@campus.edu")
                .password("Password123!")
                .build();

        when(userRepository.existsByEmail("alex@campus.edu")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login active user")
    void shouldLoginActiveUser() {
        LoginRequest request = LoginRequest.builder()
                .email("alex@campus.edu")
                .password("Password123!")
                .build();

        when(userRepository.findByEmail("alex@campus.edu")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(anyMap(), any())).thenReturn("mock_access_token");
        when(jwtService.generateRefreshToken(any())).thenReturn("mock_refresh_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should reject login when user account is suspended")
    void shouldRejectSuspendedUser() {
        sampleUser.setActive(false);
        LoginRequest request = LoginRequest.builder()
                .email("alex@campus.edu")
                .password("Password123!")
                .build();

        when(userRepository.findByEmail("alex@campus.edu")).thenReturn(Optional.of(sampleUser));

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
        verify(authenticationManager, never()).authenticate(any());
    }
}

