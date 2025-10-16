package vn.ictu.roommanagementservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.ictu.roommanagementservice.models.SearchHistory;


import java.util.List;
import java.util.Optional;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    Optional<SearchHistory> findTopByUserIdOrderBySearchedAtDesc(Long userId);
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long userId);
}
