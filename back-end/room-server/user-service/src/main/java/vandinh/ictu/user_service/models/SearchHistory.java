package vandinh.ictu.user_service.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "search_query", nullable = false, columnDefinition = "TEXT")
    private String searchQuery;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}