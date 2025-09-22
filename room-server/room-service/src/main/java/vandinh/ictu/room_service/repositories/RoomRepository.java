package vandinh.ictu.room_service.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vandinh.ictu.room_service.common.RoomStatus;
import vandinh.ictu.room_service.models.RoomEntity;
import vandinh.ictu.room_service.models.RoomImage;

import java.math.BigDecimal;
import java.util.List;

public interface RoomRepository extends JpaRepository<RoomEntity, Long> {

    @Query("SELECT r FROM RoomEntity r " +
            "WHERE lower(r.title) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(r.address) LIKE lower(concat('%', :keyword, '%'))")
    Page<RoomEntity> searchByKeyword(String keyword, Pageable pageable);

    @Query("SELECT r FROM RoomEntity r " +
            "WHERE (:keyword IS NULL OR r.title LIKE %:keyword% OR r.description LIKE %:keyword%) " +
            "AND (:province IS NULL OR r.province = :province) " +
            "AND (:district IS NULL OR r.district = :district) " +
            "AND (:ward IS NULL OR r.ward = :ward) " +
            "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
            "AND (:minArea IS NULL OR r.area >= :minArea) " +
            "AND (:maxArea IS NULL OR r.area <= :maxArea)")
    Page<RoomEntity> searchRooms(@Param("keyword") String keyword,
                                 @Param("province") String province,
                                 @Param("district") String district,
                                 @Param("ward") String ward,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("minArea") BigDecimal minArea,
                                 @Param("maxArea") BigDecimal maxArea,
                                 Pageable pageable);


    Page<RoomEntity> findAllByOwnerId(Long ownerId, Pageable pageable);


}

