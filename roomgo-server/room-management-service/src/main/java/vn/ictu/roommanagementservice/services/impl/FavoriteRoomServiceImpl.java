package vn.ictu.roommanagementservice.services.impl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ictu.roommanagementservice.models.FavoriteRoom;
import vn.ictu.roommanagementservice.models.RoomEntity;
import vn.ictu.roommanagementservice.repositories.FavoriteRoomRepository;
import vn.ictu.roommanagementservice.repositories.RoomRepository;
import vn.ictu.roommanagementservice.services.FavoriteRoomService;
import vn.ictu.roommanagementservice.services.client.UserClient;


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

        RoomEntity room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

        if (favoriteRoomRepository.existsByUserIdAndRoom_Id(userId, roomId)) {
            throw new IllegalArgumentException("Favorite already exists for userId: " + userId + " and roomId: " + roomId);
        }

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
