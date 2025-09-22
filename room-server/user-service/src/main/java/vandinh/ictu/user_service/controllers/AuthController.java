package vandinh.ictu.user_service.controllers;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.user_service.common.response.TokenResponse;
import vandinh.ictu.user_service.dto.request.SignInRequest;
import vandinh.ictu.user_service.dto.request.SignUpRequest;
import vandinh.ictu.user_service.services.AuthService;

@RestController
@RequestMapping("/api/auth")
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
    public TokenResponse refreshToken(@RequestBody String refreshToken) {
        log.info("Refresh token request");

        return authService.getRefreshToken(refreshToken);
    }

    @Operation(summary = "Register", description = "Create new account")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid SignUpRequest request) {
        log.info("Register request: {}", request.getEmail());
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @Operation(summary = "Verify email", description = "Verify email after register")
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String email) {
        log.info("Verify email request: {}", email);
        authService.verifyEmail(email);
        return ResponseEntity.ok("Email verified successfully");
    }
}
