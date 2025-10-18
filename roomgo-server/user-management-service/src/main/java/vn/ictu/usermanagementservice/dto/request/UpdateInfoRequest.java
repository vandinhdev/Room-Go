package vn.ictu.usermanagementservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateInfoRequest implements Serializable {
    @NotBlank
    private String fullName;

    @NotBlank
    private Date dateOfBirth;

    @NotBlank
    private String address;

    @NotBlank
    private String bio;
}
