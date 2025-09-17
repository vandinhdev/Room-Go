package vandinh.ictu.room_service.models;

import jakarta.persistence.*;
import lombok.*;
import vandinh.ictu.room_service.common.RoomStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rooms",
        indexes = {
                @Index(name = "idx_rooms_price", columnList = "price"),
                @Index(name = "idx_rooms_area", columnList = "area"),
                @Index(name = "idx_rooms_status", columnList = "status")
        })
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 6, scale = 2)
    private BigDecimal area;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(columnDefinition = "TEXT")
    private String address;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}

