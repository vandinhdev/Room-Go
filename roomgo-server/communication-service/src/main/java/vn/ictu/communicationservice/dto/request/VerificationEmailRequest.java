package vn.ictu.communicationservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationEmailRequest {
    @NotBlank @Email
    private String to;
    private String name;
    @NotBlank
    private String verifyLink;
}

