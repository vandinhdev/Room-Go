package vandinh.ictu.user_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String fullName;
    private String role;
    private String status;
}
