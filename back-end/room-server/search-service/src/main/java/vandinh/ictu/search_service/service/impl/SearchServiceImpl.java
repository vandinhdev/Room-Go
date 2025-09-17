package vandinh.ictu.search_service.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vandinh.ictu.search_service.dto.response.RoomPageResponse;
import vandinh.ictu.search_service.repositories.SearchHistoryRepository;
import vandinh.ictu.search_service.service.RoomClient;
import vandinh.ictu.search_service.service.SearchHistoryService;
import vandinh.ictu.search_service.service.SearchService;

import java.util.HashMap;
import java.util.Map;
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    private final SearchHistoryService searchHistoryService;
    private final RoomClient roomClient;

    @Override
    public RoomPageResponse searchRooms(String keyword, String province, String district, String ward, Double minPrice, Double maxPrice, Double minArea, Double maxArea, String sort, int page, int size, String email,  String bearerToken) {

        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("province", province);
        params.put("district", district);
        params.put("ward", ward);
        params.put("minPrice", minPrice);
        params.put("maxPrice", maxPrice);
        params.put("minArea", minArea);
        params.put("maxArea", maxArea);
        params.put("sort", sort);
        params.put("page", page);
        params.put("size", size);

        searchHistoryService.saveSearchHistory(email, bearerToken, params);

        return roomClient.getRooms(params, bearerToken);
    }



}
