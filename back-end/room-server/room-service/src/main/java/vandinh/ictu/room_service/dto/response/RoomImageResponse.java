package vandinh.ictu.room_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomImageResponse {
    private Long id;
    private Long roomId;
    private String imageUrl;

}
