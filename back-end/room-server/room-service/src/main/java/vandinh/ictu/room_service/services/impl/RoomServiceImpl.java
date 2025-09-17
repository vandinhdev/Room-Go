package vandinh.ictu.room_service.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vandinh.ictu.room_service.common.RoomStatus;
import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.GeoLocation;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;
import vandinh.ictu.room_service.exception.ResourceNotFoundException;
import vandinh.ictu.room_service.models.RoomEntity;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.GeocodingClient;
import vandinh.ictu.room_service.services.RoomService;
import vandinh.ictu.room_service.services.UserClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ROOM-SERVICE")
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final UserClient userClient;
    private final GeocodingClient geocodingClient;

    @Override
    public RoomPageResponse getAllRoom(String keyword, String province,
                                       String district,
                                       String ward,
                                       BigDecimal minPrice,
                                       BigDecimal maxPrice,
                                       BigDecimal minArea,
                                       BigDecimal maxArea,
                                       String sort,
                                       int page,
                                       int size) {

        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+?)(:)(.*)");
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if ("asc".equalsIgnoreCase(matcher.group(3))) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = (page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<RoomEntity> entityPage = roomRepository.searchRooms(
                keyword, province, district, ward, minPrice, maxPrice, minArea, maxArea, pageable
        );

        return getRoomPageResponse(page, size, entityPage);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        RoomEntity room = getRoomEntity(id);
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
                .province(room.getProvince())
                .district(room.getDistrict())
                .ward(room.getWard())
                .address(room.getAddress())
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .ownerId(room.getOwnerId())
                .build();
    }

    @Override
    public RoomPageResponse getRoomByUserEmail(String keyword, String sort, int page, int size, String email, String bearerToken) {
        Long ownerId = userClient.getUserIdByEmail(email, bearerToken);
        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+?)(:)(.*)");
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }
        int pageNo = 0;
        if (page > 0) {
            pageNo = page - 1;
        }

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));
        Page<RoomEntity> entityPage;

        if (StringUtils.hasLength(keyword)) {
            keyword = "%" + keyword + "%";
            entityPage = roomRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = roomRepository.findAllByOwnerId(ownerId, pageable);
        }

        return getRoomPageResponse(page, size, entityPage);
    }


    @Override
    public Long createRoom(CreateRoomRequest req, String email, String bearerToken) {
        Long ownerId = userClient.getUserIdByEmail(email, bearerToken);

        String fullAddress = String.format("%s, %s, %s, %s",
                req.getAddress(),
                req.getWard(),
                req.getDistrict(),
                req.getProvince());

        RoomEntity room = new RoomEntity();
        room.setTitle(req.getTitle());
        room.setDescription(req.getDescription());
        room.setPrice(req.getPrice());
        room.setArea(req.getArea());
        room.setProvince(req.getProvince());
        room.setDistrict(req.getDistrict());
        room.setWard(req.getWard());
        room.setAddress(req.getAddress());
        room.setOwnerId(ownerId);

        // Lấy toạ độ
        if (req.getLatitude() == null || req.getLongitude() == null) {
            try {
                GeoLocation location = geocodingClient.getLocation(fullAddress);
                room.setLatitude(location.getLat());
                room.setLongitude(location.getLon());
            } catch (Exception e) {
                log.warn("Không lấy được tọa độ cho địa chỉ: {}, sẽ lưu room mà không có lat/lon", fullAddress, e);
                room.setLatitude(null);
                room.setLongitude(null);
            }
        } else {
            room.setLatitude(req.getLatitude());
            room.setLongitude(req.getLongitude());
        }

        room.setStatus(RoomStatus.AVAILABLE);

        roomRepository.save(room);
        return room.getId();
    }


    @Override
    public void updateRoom(UpdateRoomRequest req) {
        String fullAddress = String.format("%s, %s, %s, %s",
                req.getAddress(),
                req.getWard(),
                req.getDistrict(),
                req.getProvince());
        RoomEntity room = getRoomEntity(req.getId());
        if (room == null) {
            log.error("Room not found with id: {}", req.getId());
            return;
        }
        room.setTitle(req.getTitle());
        room.setDescription(req.getDescription());
        room.setPrice(req.getPrice());
        room.setArea(req.getArea());
        room.setProvince(req.getProvince());
        room.setDistrict(req.getDistrict());
        room.setWard(req.getWard());
        room.setAddress(req.getAddress());
        // Lấy toạ độ
        if (req.getLatitude() == null || req.getLongitude() == null) {
            try {
                GeoLocation location = geocodingClient.getLocation(fullAddress);
                room.setLatitude(location.getLat());
                room.setLongitude(location.getLon());
            } catch (Exception e) {
                log.warn("Không lấy được tọa độ cho địa chỉ: {}, sẽ lưu room mà không có lat/lon", fullAddress, e);
                room.setLatitude(null);
                room.setLongitude(null);
            }
        } else {
            room.setLatitude(req.getLatitude());
            room.setLongitude(req.getLongitude());
        }

        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);
    }

    @Override
    public void deleteRoom(Long id) {
        RoomEntity room = getRoomEntity(id);
        if (room == null) {
            log.error("Room not found with id: {}", id);
            return;
        }
        roomRepository.delete(room);

    }

    private RoomEntity getRoomEntity(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static RoomPageResponse getRoomPageResponse(int page, int size, Page<RoomEntity> userEntities) {
        log.info("Convert User Entity Page");

        List<RoomResponse> roomList = userEntities.stream().map(entity -> RoomResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .area(entity.getArea())
                .province(entity.getProvince())
                .district(entity.getDistrict())
                .ward(entity.getWard())
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .ownerId(entity.getOwnerId())
                .status(entity.getStatus())
                .build()
        ).toList();

        RoomPageResponse response = new RoomPageResponse();
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(userEntities.getTotalElements());
        response.setTotalPages(userEntities.getTotalPages());
        response.setRooms(roomList);

        return response;
    }
}
