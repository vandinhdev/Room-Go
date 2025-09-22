package vandinh.ictu.email_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordEmailRequest {
    @NotBlank @Email
    private String to;
    private String name;
    @NotBlank
    private String otpCode;
}