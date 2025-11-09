package vn.ictu.communicationservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.ictu.communicationservice.common.enums.DeliveryMethod;
import vn.ictu.communicationservice.common.enums.NotificationType;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateNotificationSettingRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Notification type is required")
    private NotificationType notificationType;

    @NotNull(message = "Delivery method is required")
    private DeliveryMethod deliveryMethod;

    @NotNull(message = "Enabled status is required")
    private Boolean isEnabled;
}
