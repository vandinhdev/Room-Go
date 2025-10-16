package vn.ictu.roommanagementservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.ictu.roommanagementservice.common.enums.RoomStatus;
import vn.ictu.roommanagementservice.dto.request.CreateRoomRequest;
import vn.ictu.roommanagementservice.dto.request.UpdateRoomRequest;
import vn.ictu.roommanagementservice.dto.response.GeoLocation;
import vn.ictu.roommanagementservice.dto.response.RoomPageResponse;
import vn.ictu.roommanagementservice.dto.response.RoomResponse;
import vn.ictu.roommanagementservice.exception.ResourceNotFoundException;
import vn.ictu.roommanagementservice.mapper.RoomMapper;
import vn.ictu.roommanagementservice.models.RoomEntity;
import vn.ictu.roommanagementservice.models.RoomImage;
import vn.ictu.roommanagementservice.models.SearchHistory;
import vn.ictu.roommanagementservice.repositories.RoomImageRepository;
import vn.ictu.roommanagementservice.repositories.RoomRepository;
import vn.ictu.roommanagementservice.repositories.SearchHistoryRepository;
import vn.ictu.roommanagementservice.services.RoomService;
import vn.ictu.roommanagementservice.services.client.GeocodingClient;
import vn.ictu.roommanagementservice.services.client.UserClient;
import vn.ictu.roommanagementservice.utils.AppUtils;
import vn.ictu.roommanagementservice.utils.SearchQueryBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
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
    private final SearchHistoryRepository searchHistoryRepository;
    private final RoomMapper roomMapper;

    @Override
    public RoomPageResponse getAllRoom(
            String keyword, String province, String district, String ward,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minArea, BigDecimal maxArea,
            String sort, int page, int size,
            String email, String bearerToken) {

        Sort.Order order = AppUtils.parseSort(sort);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(order));

        Page<RoomEntity> entityPage = roomRepository.searchRooms(
                keyword, province, district, ward,
                minPrice, maxPrice, minArea, maxArea, pageable
        );

        // ✅ Chỉ lưu lịch sử khi có tìm kiếm thực sự (không phải refresh)
        boolean isMeaningfulSearch =
                StringUtils.hasText(keyword) ||
                        StringUtils.hasText(province) ||
                        StringUtils.hasText(district) ||
                        StringUtils.hasText(ward) ||
                        minPrice != null || maxPrice != null ||
                        minArea != null || maxArea != null;

        if (isMeaningfulSearch && StringUtils.hasText(email) && StringUtils.hasText(bearerToken)) {
            try {
                Long userId = userClient.getUserIdByEmail(email, bearerToken);
                if (userId != null) {
                    saveSearchHistory(keyword, province, district, ward,
                            minPrice, maxPrice, minArea, maxArea,
                            sort, page, size, userId);
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to save search history for email: {}", email, e);
            }
        }

        return roomMapper.toRoomPageResponse(entityPage, page, size);
    }


    @Override
    public List<SearchHistory> getSearchHistoryByUserEmail(String userEmail, String bearerToken) {
        Long userId = userClient.getUserIdByEmail(userEmail, bearerToken);
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        RoomEntity room = getRoomEntity(id);
        return roomMapper.toRoomResponse(room);
    }

    @Override
    public RoomPageResponse getRoomByUserEmail(String keyword, String sort, int page, int size, String email, String bearerToken) {
        Long ownerId = userClient.getUserIdByEmail(email, bearerToken);
        Sort.Order order = AppUtils.parseSort(sort);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(order));

        Page<RoomEntity> entityPage;
        if (keyword != null && !keyword.isEmpty()) {
            entityPage = roomRepository.searchByKeyword("%" + keyword + "%", pageable);
        } else {
            entityPage = roomRepository.findAllByOwnerId(ownerId, pageable);
        }

        return roomMapper.toRoomPageResponse(entityPage, page, size);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createRoom(CreateRoomRequest req, String email, String bearerToken) {
        Long ownerId = userClient.getUserIdByEmail(email, bearerToken);
        String fullAddress = AppUtils.buildAddress(req.getAddress(), req.getWard(), req.getDistrict(), req.getProvince());

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
        room.setStatus(RoomStatus.AVAILABLE);

        setGeoLocation(req, room, fullAddress);
        RoomEntity savedRoom = roomRepository.save(room);
        log.info("Room entity saved with ID: {}", savedRoom.getId());
        saveRoomImages(savedRoom, req.getImageUrls());
        log.info("📸 Received image URLs: {}", req.getImageUrls());
        log.info("Saved images for room ID: {}", savedRoom.getId());

        log.info("Created room id: {}", savedRoom.getId());
        return savedRoom.getId();
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRoom(UpdateRoomRequest req) {
        RoomEntity room = getRoomEntity(req.getId());
        String fullAddress = AppUtils.buildAddress(req.getAddress(), req.getWard(), req.getDistrict(), req.getProvince());

        room.setTitle(req.getTitle());
        room.setDescription(req.getDescription());
        room.setPrice(req.getPrice());
        room.setArea(req.getArea());
        room.setProvince(req.getProvince());
        room.setDistrict(req.getDistrict());
        room.setWard(req.getWard());
        room.setAddress(req.getAddress());
        room.setStatus(RoomStatus.valueOf(req.getStatus()));

        setGeoLocation(req, room, fullAddress);
        roomRepository.save(room);

        roomImageRepository.deleteByRoom_Id(room.getId());
        saveRoomImages(room, req.getImageUrls());

        log.info("Updated room id: {}", room.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRoom(Long id) {
        RoomEntity room = getRoomEntity(id);
        roomRepository.delete(room);
        log.info("Deleted room id: {}", id);

    }

    private RoomEntity getRoomEntity(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    private void saveSearchHistory(String keyword, String province, String district, String ward,
                                   BigDecimal minPrice, BigDecimal maxPrice,
                                   BigDecimal minArea, BigDecimal maxArea,
                                   String sort, int page, int size, Long userId) {

        // ✅ Dùng HashMap để chấp nhận null
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("province", province);
        params.put("district", district);
        params.put("ward", ward);
        params.put("minPrice", minPrice);
        params.put("maxPrice", maxPrice);
        params.put("minArea", minArea);
        params.put("maxArea", maxArea);
        params.put("sort", sort);
        params.put("page", page);
        params.put("size", size);

        String query = SearchQueryBuilder.buildQuery(params);

        // ✅ Kiểm tra bản ghi gần nhất xem có trùng không
        Optional<SearchHistory> lastHistoryOpt =
                searchHistoryRepository.findTopByUserIdOrderBySearchedAtDesc(userId);

        if (lastHistoryOpt.isPresent() &&
                query.equals(lastHistoryOpt.get().getSearchQuery())) {
            log.debug("🔁 Skip saving duplicate search query for user {}", userId);
            return;
        }

        SearchHistory history = SearchHistory.builder()
                .keyword(keyword)
                .userId(userId)
                .searchQuery(query)
                .province(province)
                .district(district)
                .ward(ward)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minArea(minArea)
                .maxArea(maxArea)
                .searchedAt(LocalDateTime.now())
                .build();

        searchHistoryRepository.save(history);

        // ✅ Giới hạn số lượng lịch sử (VD: giữ tối đa 50 bản gần nhất)
        List<SearchHistory> allHistories = searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
        if (allHistories.size() > 50) {
            List<SearchHistory> toDelete = allHistories.subList(50, allHistories.size());
            searchHistoryRepository.deleteAll(toDelete);
        }

        log.info("✅ Saved search history for user {} | query={}", userId, query);
    }


    private void saveRoomImages(RoomEntity room, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;

        List<RoomImage> images = imageUrls.stream()
                .map(url -> RoomImage.builder()
                        .room(room)
                        .imageUrl(url)
                        .uploadedAt(LocalDateTime.now())
                        .build())
                .toList();



        roomImageRepository.saveAll(images);
        log.info("💾 Saving {} images for room {}", imageUrls == null ? 0 : imageUrls.size(), room.getId());

        log.info("Saved {} images for room {}", images.size(), room.getId());
    }

    private void setGeoLocation(Object req, RoomEntity room, String fullAddress) {
        try {
            if (req instanceof CreateRoomRequest cReq && (cReq.getLatitude() == null || cReq.getLongitude() == null)) {
                GeoLocation loc = geocodingClient.getLocation(fullAddress);
                room.setLatitude(loc.getLat());
                room.setLongitude(loc.getLon());
            } else if (req instanceof UpdateRoomRequest uReq && (uReq.getLatitude() == null || uReq.getLongitude() == null)) {
                GeoLocation loc = geocodingClient.getLocation(fullAddress);
                room.setLatitude(loc.getLat());
                room.setLongitude(loc.getLon());
            }
        } catch (Exception e) {
            log.warn("Không lấy được toạ độ cho địa chỉ: {}", fullAddress, e);
            room.setLatitude(null);
            room.setLongitude(null);
        }
    }


}
