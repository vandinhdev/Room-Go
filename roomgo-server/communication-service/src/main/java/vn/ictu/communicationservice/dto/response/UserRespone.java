package vn.ictu.communicationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRespone {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " +
                (lastName != null ? lastName : "");
    }
}
