package vandinh.ictu.room_service.dto.response;

import lombok.*;
import vandinh.ictu.room_service.common.RoomStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse implements Serializable {
    private Long id;
    private Long ownerId;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal area;
    private String province;
    private String district;
    private String ward;
    private String address;
    private RoomStatus status;
    private Double latitude;
    private Double longitude;
    private List<String> imageUrls;
}
