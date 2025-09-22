package vandinh.ictu.room_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vandinh.ictu.room_service.models.FavoriteRoom;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRoomRepository extends JpaRepository<FavoriteRoom, Long> {

    // kiểm tra user đã favorite room hay chưa
    boolean existsByUserIdAndRoom_Id(Long userId, Long roomId);

    // lấy danh sách FavoriteRoom của user
    List<FavoriteRoom> findByUserId(Long userId);

    // lấy danh sách roomId (Long) từ bảng favorite_rooms
    @Query("SELECT f.room.id FROM FavoriteRoom f WHERE f.userId = :userId")
    List<Long> findRoomIdsByUserId(@Param("userId") Long userId);
}

