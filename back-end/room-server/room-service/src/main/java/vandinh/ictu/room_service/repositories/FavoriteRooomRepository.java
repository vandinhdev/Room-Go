package vandinh.ictu.room_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vandinh.ictu.room_service.models.FavoriteRoom;

import java.util.List;

public interface FavoriteRooomRepository extends JpaRepository<FavoriteRoom, Long> {
    List<FavoriteRoom> findByUserId(Long userId);
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
    void deleteByUserIdAndRoomId(Long userId, Long roomId);
    @Query("SELECT f.roomId FROM FavoriteRoom f WHERE f.userId = :userId")
    List<Long> findRoomIdsByUserId(@Param("userId") Long userId);
}
