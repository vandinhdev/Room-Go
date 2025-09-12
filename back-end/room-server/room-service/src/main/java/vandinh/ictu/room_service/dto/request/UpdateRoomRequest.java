package vandinh.ictu.room_service.dto.request;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRoomRequest implements Serializable {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal area;
    private String address;
    private Double latitude;
    private Double longitude;
}
