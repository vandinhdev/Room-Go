package vandinh.ictu.room_service.services;

import vandinh.ictu.room_service.models.FavoriteRoom;
import vandinh.ictu.room_service.models.RoomEntity;

import java.util.List;

public interface FavoriteRoomService {
    Long addFavoriteRoom(Long roomId, String email, String bearerToken);
    void removeFavoriteRoom(Long roomId, String email, String bearerToken);
    List<Long> getFavoriteRoomsByUserId(Long userId);
    List<FavoriteRoom> getFavoriteRoomsByUserEmail(String email, String bearerToken);
}
