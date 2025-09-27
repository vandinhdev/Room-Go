package vn.ictu.roommanagementservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.ictu.roommanagementservice.models.FavoriteRoom;

import java.util.List;

@Repository
public interface FavoriteRoomRepository extends JpaRepository<FavoriteRoom, Long> {

    boolean existsByUserIdAndRoom_Id(Long userId, Long roomId);

    List<FavoriteRoom> findByUserId(Long userId);

    @Query("SELECT f.room.id FROM FavoriteRoom f WHERE f.userId = :userId")
    List<Long> findRoomIdsByUserId(@Param("userId") Long userId);
}

