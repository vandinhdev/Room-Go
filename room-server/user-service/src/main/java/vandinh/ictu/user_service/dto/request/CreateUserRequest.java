package vandinh.ictu.user_service.dto.request;

import lombok.Getter;
import lombok.Setter;
import vandinh.ictu.user_service.common.enums.UserStatus;
import vandinh.ictu.user_service.models.Role;

import java.io.Serializable;

@Getter
@Setter
public class CreateUserRequest implements Serializable {
    private String firstname;
    private String lastname;
    private String username;
    private String password;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
}
