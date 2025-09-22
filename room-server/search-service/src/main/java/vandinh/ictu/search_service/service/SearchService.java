package vandinh.ictu.search_service.service;

import vandinh.ictu.search_service.dto.response.RoomPageResponse;

public interface SearchService {
    RoomPageResponse searchRooms(String keyword, String province, String district, String ward,
                                 Double minPrice, Double maxPrice,
                                 Double minArea, Double maxArea,
                                 String sort,
                                 int page, int size, String email,  String bearerToken);

}
