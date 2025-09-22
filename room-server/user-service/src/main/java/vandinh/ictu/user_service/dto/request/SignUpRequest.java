package vandinh.ictu.user_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vandinh.ictu.user_service.common.enums.UserStatus;

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
