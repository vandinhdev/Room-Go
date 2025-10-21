package vn.ictu.usermanagementservice.dto.request;

import lombok.*;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateEmailRequest {
    private String newEmail;
}
