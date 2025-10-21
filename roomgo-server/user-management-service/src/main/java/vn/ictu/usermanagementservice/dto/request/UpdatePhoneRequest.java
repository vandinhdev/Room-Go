package vn.ictu.usermanagementservice.dto.request;

import lombok.*;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePhoneRequest {
    private String newPhone;
}
