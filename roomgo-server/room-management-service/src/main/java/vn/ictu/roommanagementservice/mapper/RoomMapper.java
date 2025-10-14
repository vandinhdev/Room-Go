package vn.ictu.roommanagementservice.mapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import vn.ictu.roommanagementservice.common.enums.RoomStatus;
import vn.ictu.roommanagementservice.dto.response.RoomPageResponse;
import vn.ictu.roommanagementservice.dto.response.RoomResponse;
import vn.ictu.roommanagementservice.models.RoomEntity;
import vn.ictu.roommanagementservice.models.RoomImage;
import vn.ictu.roommanagementservice.repositories.RoomImageRepository;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j(topic = "ROOM-MAPPER")
@Component
@RequiredArgsConstructor
public class RoomMapper {

    private final RoomImageRepository roomImageRepository;

    public RoomResponse toRoomResponse(RoomEntity entity) {
        if (entity == null) {
            log.warn("⚠️ Null RoomEntity encountered in mapper!");
            return null;
        }

        List<String> imageUrls = Collections.emptyList();
        try {
            if (entity.getId() != null) {
                List<RoomImage> images = roomImageRepository.findByRoom_Id(entity.getId());
                if (images != null) {
                    imageUrls = images.stream()
                            .map(RoomImage::getImageUrl)
                            .filter(url -> url != null && !url.isBlank())
                            .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.error("❌ Error loading images for room id {}: {}", entity.getId(), e.getMessage());
        }

        return RoomResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice() != null ? entity.getPrice() : BigDecimal.ZERO)
                .area(entity.getArea() != null ? entity.getArea() : BigDecimal.ZERO)
                .province(entity.getProvince())
                .district(entity.getDistrict())
                .ward(entity.getWard())
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .ownerId(entity.getOwnerId())
                .status(entity.getStatus() != null ? entity.getStatus() : RoomStatus.AVAILABLE)
                .imageUrls(imageUrls)
                .build();
    }

    public RoomPageResponse toRoomPageResponse(Page<RoomEntity> entityPage, int page, int size) {
        log.info("🧭 Mapping {} room entities to DTOs", entityPage.getTotalElements());
        List<RoomResponse> rooms = entityPage.getContent().stream()
                .map(this::toRoomResponse)
                .filter(r -> r != null)
                .toList();

        return RoomPageResponse.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .rooms(rooms)
                .build();
    }
}
