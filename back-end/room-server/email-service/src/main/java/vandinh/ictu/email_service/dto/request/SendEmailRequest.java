package vandinh.ictu.email_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class SendEmailRequest {
    @NotBlank @Email
    private String to;

    @NotBlank
    private String templateId; // SendGrid templateId

    private Map<String, Object> params; // dynamic variables
}

