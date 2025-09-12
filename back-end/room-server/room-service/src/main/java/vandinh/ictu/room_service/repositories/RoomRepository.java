package vandinh.ictu.room_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vandinh.ictu.room_service.models.RoomEntity;

import java.util.List;

public interface RoomRepository extends JpaRepository<RoomEntity, Long> {

    @Query("SELECT r FROM RoomEntity r " +
            "WHERE lower(r.title) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(r.address) LIKE lower(concat('%', :keyword, '%'))")
    List<RoomEntity> searchByKeyword(@Param("keyword") String keyword);
    RoomEntity findByOwnerId(Long ownerId);
}

