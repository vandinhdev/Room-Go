package vandinh.ictu.room_service.dto.request;

import lombok.Data;

@Data
public class UpdateRoomImageRequest {
    private Long id;
    private String imageUrl;
}
