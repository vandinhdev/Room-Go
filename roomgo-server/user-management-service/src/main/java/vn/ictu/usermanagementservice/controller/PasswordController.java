package vn.ictu.usermanagementservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.ictu.usermanagementservice.common.response.ApiResponse;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.service.PasswordService;

@RestController
@RequestMapping("api/user/password")
@RequiredArgsConstructor
@Slf4j(topic = "PASSWORD_CONTROLLER")
public class PasswordController {

    private final PasswordService passwordService;
    @Operation(summary = "Change Password", description = "API change password for user to database")
    @PatchMapping("/change-password")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_STUDENT','ROLE_OWNER')")
    public ApiResponse changePassword(@RequestBody @Valid UserPasswordRequest request, Authentication authentication) {
        String email = authentication.getName();
        log.info("Changing password for user: {}", request);

        passwordService.changePassword(request, email);

        return ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Password updated successfully")
                .data("")
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse forgotPassword(@RequestParam String email) {
        passwordService.sendResetOtp(email);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("OTP has been sent to your email")
                .data("")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse resetPassword(@RequestParam String email,
                                     @RequestParam String otp,
                                     @RequestParam String newPassword) {
        passwordService.resetPassword(email, otp, newPassword);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Password has been reset successfully")
                .data("")
                .build();
    }
}
