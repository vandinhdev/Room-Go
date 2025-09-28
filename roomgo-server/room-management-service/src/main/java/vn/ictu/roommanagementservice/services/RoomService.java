package vn.ictu.roommanagementservice.services;



import vn.ictu.roommanagementservice.dto.request.CreateRoomRequest;
import vn.ictu.roommanagementservice.dto.request.UpdateRoomRequest;
import vn.ictu.roommanagementservice.dto.response.RoomPageResponse;
import vn.ictu.roommanagementservice.dto.response.RoomResponse;
import vn.ictu.roommanagementservice.models.SearchHistory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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
                                int size,
                                String email,
                                String bearerToken);
    List<SearchHistory> getSearchHistoryByUserEmail(String userEmail, String bearerToken);
    RoomResponse getRoomById(Long id);
    RoomPageResponse getRoomByUserEmail(String keyword, String sort, int page, int size, String email, String bearerToken);
    Long createRoom(CreateRoomRequest req, String email, String bearerToken);
    void updateRoom(UpdateRoomRequest req);
    void deleteRoom(Long id);
}
