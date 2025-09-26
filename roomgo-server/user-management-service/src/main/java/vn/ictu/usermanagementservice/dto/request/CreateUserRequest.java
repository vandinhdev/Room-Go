package vn.ictu.usermanagementservice.dto.request;

import lombok.Getter;
import lombok.Setter;
import vn.ictu.usermanagementservice.common.enums.UserStatus;
import vn.ictu.usermanagementservice.model.Role;
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
