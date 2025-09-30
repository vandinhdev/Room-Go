package vn.ictu.roommanagementservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.ictu.roommanagementservice.models.SearchHistory;


import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long userId);
}
