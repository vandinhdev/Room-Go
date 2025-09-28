package vn.ictu.roommanagementservice.services;

import vn.ictu.roommanagementservice.models.FavoriteRoom;

import java.util.List;

public interface FavoriteRoomService {
    Long addFavoriteRoom(Long roomId, String email, String bearerToken);
    void removeFavoriteRoom(Long roomId, String email, String bearerToken);
    List<FavoriteRoom> getFavoriteRoomsByUserEmail(String email, String bearerToken);
}
