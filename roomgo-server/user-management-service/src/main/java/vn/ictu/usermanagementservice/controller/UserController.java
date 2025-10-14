package vn.ictu.usermanagementservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.ictu.usermanagementservice.common.response.ApiResponse;
import vn.ictu.usermanagementservice.dto.request.UpdateProfileRequest;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.service.UserService;

@RestController
@RequestMapping("api/user")
@Tag(name = "User Controller")
@Slf4j(topic = "USER-CONTROLLER")
@RequiredArgsConstructor

public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordService;

    @Operation(summary = "Get user list", description = "API retrieve user from database")
    @GetMapping("/list")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ApiResponse getList(@RequestParam(required = false) String keyword,
                               @RequestParam(required = false) String sort,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        log.info("Get user list");

        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("users")
                .data(userService.getAllUser(keyword, sort, page, size))
                .build();
    }

    @Operation(summary = "Get user detail", description = "API retrieve user detail by ID from database")
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse getUserDetail(@PathVariable @Min(value = 1, message = "userId must be equals or greater than 1") Long userId) {
        log.info("Get user detail by ID: {}", userId);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("user")
                .data(userService.getUserById(userId))
                .build();
    }


    @Operation(summary = "Get user detail", description = "API retrieve user detail by ID from database")
    @GetMapping("/email")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse getUserDetailByEmail(@RequestParam String email) {
        log.info("Get user detail by email: {}", email);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("user")
                .data(userService.getUserByEmail(email))
                .build();
    }

    @Operation(summary = "Get profile", description = "API retrieve profile of user")
    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse getProfile(Authentication authentication) {
        String email = authentication.getName();
        log.info("Get profile of user: {}", email);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("user")
                .data(userService.getProfile(email))
                .build();
    }

    @Operation(summary = "Update User Status", description = "API update user status to database")
    @PatchMapping("/update-status/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')" )
    public ApiResponse updateStatus(@PathVariable @Min(value = 1, message = "userId must be equals or greater than 1") Long userId,
                                    @RequestParam String status) {
        log.info("Update user status by ID: {}", userId);
        userService.updateStatus(userId, status);
        return ApiResponse.builder()
                .status(HttpStatus.ACCEPTED.value())
                .message("User status updated successfully")
                .data("")
                .build();
    }


    @Operation(summary = "Update User", description = "API update user to database")
    @PutMapping("/update-profile")
    public ApiResponse updateProfile(@RequestBody @Valid UpdateProfileRequest request, Authentication authentication) {
        String email = authentication.getName();
        log.info("Update user profile: {}", email);
        userService.updateProfile(request, email);

        return ApiResponse.builder()
                .status(HttpStatus.ACCEPTED.value())
                .message("User updated successfully")
                .data("")
                .build();
    }

    @Operation(summary = "Delete User", description = "API delete user from database")
    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')" )
    public ApiResponse deleteUser(@PathVariable @Min(value = 1, message = "userId must be equals or greater than 1") Long userId) {
        userService.deleteUser(userId);
        return ApiResponse.builder()
                .status(HttpStatus.RESET_CONTENT.value())
                .message("User deleted successfully")
                .data("")
                .build();
    }


}
