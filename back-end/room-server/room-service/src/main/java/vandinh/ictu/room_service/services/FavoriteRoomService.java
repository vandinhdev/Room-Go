package vandinh.ictu.room_service.services;

import vandinh.ictu.room_service.models.RoomEntity;

import java.util.List;

public interface FavoriteRoomService {
    Long addFavoriteRoom(Long roomId, String email, String bearerToken);
    void removeFavoriteRoom(Long roomId, String email, String bearerToken);
    boolean isFavoriteRoom(Long userId, Long roomId);
    List<Long> getFavoriteRoomsByUserId(Long userId);
}
