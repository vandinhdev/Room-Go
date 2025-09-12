package vandinh.ictu.room_service.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;
import vandinh.ictu.room_service.models.RoomEntity;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.RoomService;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ROOM-SERVICE")
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    @Override
    public RoomPageResponse getAllRoom(String keyword, String sort, int page, int size) {
        return null;
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        RoomEntity room = roomRepository.findByOwnerId(id);
        if (room == null) {
            log.error("Room not found with id: {}", id);
            return null;
        }
        return RoomResponse.builder()
                .id(room.getId())
                .title(room.getTitle())
                .description(room.getDescription())
                .price(room.getPrice())
                .area(room.getArea())
                .address(room.getAddress())
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .ownerId(room.getOwnerId())
                .build();

    }

    @Override
    public Long createRoom(CreateRoomRequest req) {
        RoomEntity room = new RoomEntity();
        room.setTitle(req.getTitle());
        room.setDescription(req.getDescription());
        room.setPrice(req.getPrice());
        room.setArea(req.getArea());
        room.setAddress(req.getAddress());
        room.setLatitude(req.getLatitude());
        room.setLongitude(req.getLongitude());
        room.setOwnerId(req.getOwnerId());
        roomRepository.save(room);
        return room.getId();
    }

    @Override
    public void updateRoom(UpdateRoomRequest req) {

    }

    @Override
    public void deleteRoom(Long id) {

    }
}
