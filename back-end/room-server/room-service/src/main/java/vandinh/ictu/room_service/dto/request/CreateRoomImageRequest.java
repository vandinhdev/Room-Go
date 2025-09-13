package vandinh.ictu.room_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoomImageRequest {
    private Long roomId;
    private String imageUrl;
}
