package vandinh.ictu.room_service.services;

import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;

public interface RoomService {
    RoomPageResponse getAllRoom(String keyword, String sort, int page, int size);
    RoomResponse getRoomById(Long id);
    Long createRoom(CreateRoomRequest req, String email, String bearerToken);
    void updateRoom(UpdateRoomRequest req);
    void deleteRoom(Long id);
}
