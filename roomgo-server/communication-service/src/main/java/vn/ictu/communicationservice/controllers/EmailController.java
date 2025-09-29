package vn.ictu.communicationservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.ictu.communicationservice.common.response.ApiResponse;
import vn.ictu.communicationservice.dto.request.ResetPasswordEmailRequest;
import vn.ictu.communicationservice.dto.request.VerificationEmailRequest;
import vn.ictu.communicationservice.services.EmailService;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/send-verification")
    public ApiResponse sendVerification(@Valid @RequestBody VerificationEmailRequest req) {
        emailService.sendVerificationEmail(req.getTo(), req.getName(), req.getVerifyLink());
        return ApiResponse.builder()
                .status(200)
                .message("Verification email queued")
                .build();
    }

    //send-reset
    @PostMapping("/send-reset-password")
    public ApiResponse sendReset(@Valid @RequestBody ResetPasswordEmailRequest req) {
        emailService.sendResetPasswordEmail(req.getTo(), req.getName(), req.getOtpCode());
        return ApiResponse.builder()
                .status(200)
                .message("Reset password email queued")
                .build();
    }
}

