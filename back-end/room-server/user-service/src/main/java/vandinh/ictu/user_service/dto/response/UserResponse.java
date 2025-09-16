package vandinh.ictu.user_service.dto.response;

import lombok.*;
import vandinh.ictu.user_service.common.enums.Gender;
import vandinh.ictu.user_service.models.Role;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse implements Serializable {
    private long id;
    private String firstName;
    private String lastName;
    private String userName;
    private String email;
    private String phone;
    private Gender gender;
    private Date dateOfBirth;
    private Role role;
}
