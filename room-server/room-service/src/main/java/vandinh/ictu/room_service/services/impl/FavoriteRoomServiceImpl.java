package vandinh.ictu.room_service.services.impl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vandinh.ictu.room_service.models.FavoriteRoom;
import vandinh.ictu.room_service.models.RoomEntity;
import vandinh.ictu.room_service.repositories.FavoriteRoomRepository;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.FavoriteRoomService;
import vandinh.ictu.room_service.services.UserClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteRoomServiceImpl implements FavoriteRoomService {

    private final FavoriteRoomRepository favoriteRoomRepository;
    private final RoomRepository roomRepository;
    private final UserClient userClient; // client gọi user-service

    @Override
    @Transactional
    public Long addFavoriteRoom(Long roomId, String email, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(email, bearerToken);
        if (userId == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }

        // Kiểm tra phòng tồn tại
        RoomEntity room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

        // Kiểm tra trùng
        if (favoriteRoomRepository.existsByUserIdAndRoom_Id(userId, roomId)) {
            throw new IllegalArgumentException("Favorite already exists for userId: " + userId + " and roomId: " + roomId);
        }

        // Lưu mới
        FavoriteRoom favorite = FavoriteRoom.builder()
                .userId(userId)
                .room(room)
                .build();

        FavoriteRoom saved = favoriteRoomRepository.save(favorite);
        log.info("User {} đã thêm phòng {} vào danh sách yêu thích", userId, roomId);
        return saved.getId();
    }

    @Override
    @Transactional
    public void removeFavoriteRoom(Long roomId, String email, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(email, bearerToken);
        if (userId == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }

        FavoriteRoom favorite = favoriteRoomRepository.findByUserId(userId).stream()
                .filter(f -> f.getRoom().getId().equals(roomId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Favorite not found for userId: " + userId + " and roomId: " + roomId));

        favoriteRoomRepository.delete(favorite);
        log.info("User {} đã xoá phòng {} khỏi danh sách yêu thích", userId, roomId);
    }

    @Override
    public List<Long> getFavoriteRoomsByUserId(Long userId) {
        return favoriteRoomRepository.findRoomIdsByUserId(userId);
    }

    @Override
    public List<FavoriteRoom> getFavoriteRoomsByUserEmail(String email, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(email, bearerToken);
        if (userId == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }
        return favoriteRoomRepository.findByUserId(userId);
    }
}
