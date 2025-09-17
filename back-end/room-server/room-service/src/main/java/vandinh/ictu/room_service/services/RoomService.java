package vandinh.ictu.room_service.services;

import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;

import java.math.BigDecimal;

public interface RoomService {
    RoomPageResponse getAllRoom(String keyword,
                                String province,
                                String district,
                                String ward,
                                BigDecimal minPrice,
                                BigDecimal maxPrice,
                                BigDecimal minArea,
                                BigDecimal maxArea,
                                String sort,
                                int page,
                                int size);
    RoomResponse getRoomById(Long id);
    RoomPageResponse getRoomByUserEmail(String keyword, String sort, int page, int size, String email, String bearerToken);
    Long createRoom(CreateRoomRequest req, String email, String bearerToken);
    void updateRoom(UpdateRoomRequest req);
    void deleteRoom(Long id);
}
