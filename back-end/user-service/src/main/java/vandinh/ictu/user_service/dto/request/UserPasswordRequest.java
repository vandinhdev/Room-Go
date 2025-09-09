package vandinh.ictu.user_service.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class UserPasswordRequest implements Serializable {

    private Long id;


    private String password;


    private String confirmPassword;
}
