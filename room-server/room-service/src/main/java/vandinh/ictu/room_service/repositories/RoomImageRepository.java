package vandinh.ictu.room_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vandinh.ictu.room_service.models.RoomImage;

import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoomId(Long roomId);
    void deleteByRoom_Id(Long roomId);
    List<RoomImage> findByRoom_Id(Long roomId);

}
