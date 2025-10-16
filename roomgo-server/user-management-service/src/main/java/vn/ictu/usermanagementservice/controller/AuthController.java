package vn.ictu.usermanagementservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.ictu.usermanagementservice.common.response.ApiResponse;
import vn.ictu.usermanagementservice.common.response.TokenResponse;
import vn.ictu.usermanagementservice.dto.request.SignInRequest;
import vn.ictu.usermanagementservice.dto.request.SignUpRequest;
import vn.ictu.usermanagementservice.service.AuthService;

import java.util.Map;


@RestController
@RequestMapping("/api/user/auth")
@Tag(name = "Authentication Controller")
@Slf4j(topic = "AUTHENTICATION-CONTROLLER")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Access token", description = "Get access token and refresh token by email and password")
    @PostMapping("/login")
    public TokenResponse accessToken(@RequestBody SignInRequest request) {
        log.info("Access token request");
        log.info("Access token request with payload: {}", request);
        return authService.login(request);
    }

    @Operation(summary = "Refresh token", description = "Get access token by refresh token")
    @PostMapping("/refresh-token")
    public TokenResponse refreshToken(@RequestBody Map<String, String> request) {
        log.info("Refresh token request - Raw request: {}", request);
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            refreshToken = request.get("refresh_token");
        }

        // Trim whitespace and remove any surrounding quotes
        if (refreshToken != null) {
            refreshToken = refreshToken.trim();
            if (refreshToken.startsWith("\"") && refreshToken.endsWith("\"")) {
                refreshToken = refreshToken.substring(1, refreshToken.length() - 1);
            }
        }

        log.info("Refresh token after cleanup - Length: {}, First 20 chars: {}",
                refreshToken != null ? refreshToken.length() : 0,
                refreshToken != null && refreshToken.length() > 20 ? refreshToken.substring(0, 20) + "..." : refreshToken);

        return authService.getRefreshToken(refreshToken);
    }

    @Operation(summary = "Register", description = "Create new account")
    @PostMapping("/register")
    public ApiResponse register(@RequestBody @Valid SignUpRequest request) {
        log.info("Register request: {}", request.getEmail());
        authService.register(request);
        return ApiResponse.builder()
                .status(200)
                .message("User registered successfully. Please verify your email.")
                .data(null)
                .build();
    }

    @PostMapping("/guest-token")
    @Operation(summary = "Guest token", description = "Create token for guest user")
    public TokenResponse createTokenGuest() {
        log.info("Create token for guest user");
        return authService.createTokenGuest();
    }

    @Operation(summary = "Verify email", description = "Verify email after register")
    @GetMapping("/verify-email")
    public ApiResponse verifyEmail(@RequestParam String email) {
        log.info("Verify email request: {}", email);
        authService.verifyEmail(email);
        return ApiResponse.builder()
                .status(200)
                .message("Email verified successfully.")
                .data(null)
                .build();
    }


}
