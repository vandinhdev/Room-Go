package vn.ictu.usermanagementservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.ictu.usermanagementservice.common.enums.Gender;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest implements Serializable {
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private Gender gender;
    private Date dateOfBirth;
}
