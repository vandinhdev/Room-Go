package vandinh.ictu.search_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vandinh.ictu.search_service.models.SearchHistory;

import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long userId);
}
