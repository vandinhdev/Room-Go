package vn.ictu.roommanagementservice.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import vn.ictu.roommanagementservice.common.enums.RoomStatus;


import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class RoomEntity implements Serializable {
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
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

