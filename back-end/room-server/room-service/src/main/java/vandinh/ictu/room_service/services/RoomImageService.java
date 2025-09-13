package vandinh.ictu.room_service.services;

import vandinh.ictu.room_service.dto.request.CreateRoomImageRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomImageRequest;
import vandinh.ictu.room_service.dto.response.RoomImageResponse;

public interface RoomImageService {
    RoomImageResponse getRoomImageById(Long id);
    Long createRoomImage(CreateRoomImageRequest req);
    void updateRoomImage(UpdateRoomImageRequest req);
    void deleteRoomImage(Long id);
}
