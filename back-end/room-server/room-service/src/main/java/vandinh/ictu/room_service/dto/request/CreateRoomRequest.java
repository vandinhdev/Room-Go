package vandinh.ictu.room_service.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateRoomRequest implements Serializable {
    private Long ownerId;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal area;
    private String address;
    private Double latitude;
    private Double longitude;
}
