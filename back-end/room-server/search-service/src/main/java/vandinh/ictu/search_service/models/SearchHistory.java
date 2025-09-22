package vandinh.ictu.search_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // ai đã search
    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    private String province;
    private String district;
    private String ward;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minArea;
    private BigDecimal maxArea;

    private String keyword;

    private LocalDateTime searchedAt;
}