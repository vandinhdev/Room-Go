package vandinh.ictu.search_service.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vandinh.ictu.search_service.common.response.SearchQueryBuilder;
import vandinh.ictu.search_service.dto.request.SearchRequest;
import vandinh.ictu.search_service.models.SearchHistory;
import vandinh.ictu.search_service.repositories.SearchHistoryRepository;
import vandinh.ictu.search_service.service.SearchHistoryService;
import vandinh.ictu.search_service.service.UserClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchHistoryServiceImpl implements SearchHistoryService {
    private final  SearchHistoryRepository searchHistoryRepository;
    private final UserClient userClient;

    @Override
    public void saveSearchHistory(String userEmail, String bearerToken, Map<String, Object> params) {
        Long userId = userClient.getUserIdByEmail(userEmail, bearerToken);
        String searchQuery = SearchQueryBuilder.buildQuery(params);

        SearchHistory history = SearchHistory.builder()
                .userId(userId)
                .searchQuery(searchQuery)
                .keyword((String) params.get("keyword"))
                .province((String) params.get("province"))
                .district((String) params.get("district"))
                .ward((String) params.get("ward"))
                .minPrice(params.get("minPrice") != null ? new BigDecimal(params.get("minPrice").toString()) : null)
                .maxPrice(params.get("maxPrice") != null ? new BigDecimal(params.get("maxPrice").toString()) : null)
                .minArea(params.get("minArea") != null ? new BigDecimal(params.get("minArea").toString()) : null)
                .maxArea(params.get("maxArea") != null ? new BigDecimal(params.get("maxArea").toString()) : null)
                .searchedAt(LocalDateTime.now())
                .build();
        searchHistoryRepository.save(history);
    }

    @Override
    public List<SearchHistory> getSearchHistoryByUserEmail(String userEmail, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(userEmail, bearerToken);
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }


}
