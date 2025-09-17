package vandinh.ictu.search_service.service;

import vandinh.ictu.search_service.dto.request.SearchRequest;
import vandinh.ictu.search_service.models.SearchHistory;

import java.util.List;
import java.util.Map;

public interface SearchHistoryService {
    void saveSearchHistory(String userEmail, String bearerToken, Map<String, Object> params);
    List<SearchHistory> getSearchHistoryByUserEmail(String userEmail, String bearerToken);
}
