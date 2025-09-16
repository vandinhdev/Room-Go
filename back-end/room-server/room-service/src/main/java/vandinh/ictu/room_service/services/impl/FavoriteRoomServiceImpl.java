package vandinh.ictu.room_service.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vandinh.ictu.room_service.models.FavoriteRoom;
import vandinh.ictu.room_service.repositories.FavoriteRooomRepository;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.FavoriteRoomService;
import vandinh.ictu.room_service.services.UserClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteRoomServiceImpl implements FavoriteRoomService {
    private final FavoriteRooomRepository favoriteRooomRepository;
    private final RoomRepository roomRepository;
    private final UserClient userClient;

    @Override
    public Long addFavoriteRoom(Long roomId, String email, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(email, bearerToken);
        if (userId == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }
        // Check if room exists
        if (!roomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Room not found with id: " + roomId);
        }
        // Check if favorite already exists
        if (favoriteRooomRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new IllegalArgumentException("Favorite already exists for userId: " + userId + " and roomId: " + roomId);
        }

        // Add favorite
        FavoriteRoom favoriteRoom = new FavoriteRoom();
        favoriteRoom.setUserId(userId);
        favoriteRoom.setRoomId(roomId);
        FavoriteRoom savedFavorite = favoriteRooomRepository.save(favoriteRoom);
        return savedFavorite.getId();

    }

    @Override
    @Transactional
    public void removeFavoriteRoom(Long roomId, String email, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(email, bearerToken);
        if (userId == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }
        // Check if room exists
        if (!roomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Room not found with id: " + roomId);
        }
        // Check if favorite exists before deleting
        if (!favoriteRooomRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new IllegalArgumentException("Favorite not found for userId: " + userId + " and roomId: " + roomId);
        }
        favoriteRooomRepository.deleteByUserIdAndRoomId(userId, roomId);
    }


    @Override
    public List<Long> getFavoriteRoomsByUserId(Long userId) {
        return favoriteRooomRepository.findRoomIdsByUserId(userId);
    }
}
