package vandinh.ictu.room_service.dto.response;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

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
    private String address;
    private Double latitude;
    private Double longitude;
}
