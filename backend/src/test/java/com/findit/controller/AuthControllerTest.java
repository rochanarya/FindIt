package com.findit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findit.dto.request.LoginRequest;
import com.findit.dto.request.RegisterRequest;
import com.findit.dto.response.AuthResponse;
import com.findit.dto.response.UserDto;
import com.findit.enums.UserRole;
import com.findit.security.CustomUserDetailsService;
import com.findit.security.JwtAuthenticationFilter;
import com.findit.security.JwtService;
import com.findit.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/auth/register should return 201 on success")
    void shouldRegisterUser() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Jordan Bell")
                .email("jordan@campus.edu")
                .password("Password123!")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("dummy-token")
                .refreshToken("dummy-refresh")
                .user(UserDto.builder()
                        .id(UUID.randomUUID())
                        .fullName("Jordan Bell")
                        .email("jordan@campus.edu")
                        .role(UserRole.STUDENT)
                        .active(true)
                        .build())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("dummy-token"))
                .andExpect(jsonPath("$.data.user.email").value("jordan@campus.edu"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 on success")
    void shouldLoginUser() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("jordan@campus.edu")
                .password("Password123!")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("dummy-token")
                .refreshToken("dummy-refresh")
                .user(UserDto.builder()
                        .id(UUID.randomUUID())
                        .fullName("Jordan Bell")
                        .email("jordan@campus.edu")
                        .role(UserRole.STUDENT)
                        .active(true)
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("dummy-token"));
    }
}

