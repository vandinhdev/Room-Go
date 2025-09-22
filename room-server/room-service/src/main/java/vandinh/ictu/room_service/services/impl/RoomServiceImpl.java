package vandinh.ictu.room_service.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vandinh.ictu.room_service.common.RoomStatus;
import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.RoomImageRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.GeoLocation;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;
import vandinh.ictu.room_service.exception.ResourceNotFoundException;
import vandinh.ictu.room_service.models.RoomEntity;
import vandinh.ictu.room_service.models.RoomImage;
import vandinh.ictu.room_service.repositories.RoomImageRepository;
import vandinh.ictu.room_service.repositories.RoomRepository;
import vandinh.ictu.room_service.services.GeocodingClient;
import vandinh.ictu.room_service.services.RoomService;
import vandinh.ictu.room_service.services.UserClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ROOM-SERVICE")
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
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
        List<String> imageUrls = roomImageRepository.findByRoom_Id(id)
                .stream()
                .map(RoomImage::getImageUrl)
                .toList();
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
                .imageUrls(imageUrls)
                .status(room.getStatus())
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
        RoomEntity saveRoom = roomRepository.save(room);
        log.info("Room to save: {}", room);

        if (saveRoom != null) {
            log.info("Lưu phòng thành công với id: {}", saveRoom.getId());

            if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
                List<RoomImage> roomImages = new ArrayList<>();
                req.getImageUrls().forEach(imageUrl -> {
                    RoomImage roomImage = new RoomImage();
                    roomImage.setRoom(saveRoom);
                    roomImage.setImageUrl(imageUrl);
                    roomImages.add(roomImage);
                });
                roomImageRepository.saveAll(roomImages);
                log.info("Lưu hình ảnh phòng thành công, số lượng: {}", roomImages.size());
            }
        } else {
            log.error("Lưu phòng thất bại");
        }

        return saveRoom.getId();
    }


    @Override
    @Transactional
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

        room.setStatus(RoomStatus.valueOf(req.getStatus()));
        roomRepository.save(room);
        log.info("Cập nhật phòng thành công với id: {}", room.getId());
        // Xoá và lưu lại hình ảnh
        roomImageRepository.deleteByRoom_Id(room.getId());
        log.info("Xoá hình ảnh cũ của phòng với id: {}", room.getId());

        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
            List<RoomImage> roomImages = new ArrayList<>();
            req.getImageUrls().forEach(url -> {
                RoomImage roomImage = new RoomImage();
                roomImage.setRoom(room);
                roomImage.setImageUrl(url);  // nếu là List<String>
                roomImage.setUploadedAt(LocalDateTime.now());
                roomImages.add(roomImage);
            });
            roomImageRepository.saveAll(roomImages);
            log.info("Lưu {} hình ảnh phòng thành công", roomImages.size());
        }
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

    private RoomPageResponse getRoomPageResponse(int page, int size, Page<RoomEntity> roomEntities) {
        log.info("Convert Room Entity Page");

        List<RoomResponse> roomList = roomEntities.stream().map(entity -> {
            List<String> imageUrls = roomImageRepository.findByRoom_Id(entity.getId())
                    .stream()
                    .map(RoomImage::getImageUrl)
                    .toList();

            return RoomResponse.builder()
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
                    .imageUrls(imageUrls) // ✅ thêm ảnh vào response
                    .build();
        }).toList();

        RoomPageResponse response = new RoomPageResponse();
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(roomEntities.getTotalElements());
        response.setTotalPages(roomEntities.getTotalPages());
        response.setRooms(roomList);

        return response;
    }

}
