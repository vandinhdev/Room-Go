package vandinh.ictu.room_service.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "favorite_rooms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"}))
public class FavoriteRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
