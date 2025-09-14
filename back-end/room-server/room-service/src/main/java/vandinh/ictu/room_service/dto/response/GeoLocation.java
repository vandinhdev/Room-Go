package vandinh.ictu.room_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GeoLocation {
    private double lat;
    private double lon;
}
