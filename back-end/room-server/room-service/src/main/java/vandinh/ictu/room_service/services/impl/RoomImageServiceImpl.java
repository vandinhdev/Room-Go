package vandinh.ictu.room_service.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vandinh.ictu.room_service.dto.request.CreateRoomImageRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomImageRequest;
import vandinh.ictu.room_service.dto.response.RoomImageResponse;
import vandinh.ictu.room_service.models.RoomImage;
import vandinh.ictu.room_service.repositories.RoomImageRepository;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.RoomImageService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RoomImageServiceImpl implements RoomImageService {
    private final RoomImageRepository roomImageRepository;
    @Override
    public RoomImageResponse getRoomImageById(Long id) {
        RoomImage roomImage = getRoomImageEntityById(id);
        return RoomImageResponse.builder()
                .id(roomImage.getId())
                .roomId(roomImage.getRoomId())
                .imageUrl(roomImage.getImageUrl())
                .build();
    }

    @Override
    public Long createRoomImage(CreateRoomImageRequest req) {
       // String publicUrl = fileStorageService.save(file);
        RoomImage roomImage = new RoomImage();
        roomImage.setRoomId(req.getRoomId());
        roomImage.setImageUrl(req.getImageUrl());

        RoomImage saved = roomImageRepository.save(roomImage);
        return saved.getId();
    }

    @Override
    public void updateRoomImage(UpdateRoomImageRequest req) {
        RoomImage roomImage = getRoomImageEntityById(req.getId());
        roomImage.setImageUrl(req.getImageUrl());
        roomImageRepository.save(roomImage);

    }

    @Override
    public void deleteRoomImage(Long id) {
        RoomImage roomImage = getRoomImageEntityById(id);
        roomImageRepository.delete(roomImage);
    }

    private RoomImage getRoomImageEntityById(Long id) {
        return roomImageRepository.findById(id).orElseThrow(() -> new RuntimeException("RoomImage not found"));
    }
}
