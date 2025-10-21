package vn.ictu.usermanagementservice.dto.response;

import lombok.*;
import vn.ictu.usermanagementservice.common.enums.Gender;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse implements Serializable {
    private long id;
    private String avatarUrl;
    private String firstName;
    private String lastName;
    private String userName;
    private String email;
    private String phone;
    private Gender gender;
    private Date dateOfBirth;
    private String address;
    private String bio;
    private String role;
    private String status;
    private Date createdAt;
}
