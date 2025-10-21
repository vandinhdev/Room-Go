package vn.ictu.roommanagementservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.ictu.roommanagementservice.common.response.ApiResponse;
import vn.ictu.roommanagementservice.dto.request.CreateRoomRequest;
import vn.ictu.roommanagementservice.dto.request.UpdateRoomRequest;
import vn.ictu.roommanagementservice.dto.response.RoomPageResponse;
import vn.ictu.roommanagementservice.services.RoomService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/room")
@Slf4j(topic = "ROOM-CONTROLLER")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping("/list")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER', 'ROLE_GUEST')")
    public ApiResponse getAllRoom(@RequestParam(required = false) String keyword,
                                  @RequestParam(required = false) String province,
                                  @RequestParam(required = false) String district,
                                  @RequestParam(required = false) String ward,
                                  @RequestParam(required = false) BigDecimal minPrice,
                                  @RequestParam(required = false) BigDecimal maxPrice,
                                  @RequestParam(required = false) BigDecimal minArea,
                                  @RequestParam(required = false) BigDecimal maxArea,
                                  @RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "20") int size,
                                  @RequestParam(required = false) String sort,
                                  @RequestHeader("X-User-Email") String email,
                                  @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Get room list");
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("rooms")
                .data(roomService.getAllRoom(keyword, province, district, ward, minPrice, maxPrice, minArea, maxArea, sort, page, size, email, authorizationHeader))
                .build();
    }

    @RequestMapping("/search-history")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse getSearchHistoryByUserEmail(@RequestHeader("X-User-Email")  String email,
                                                   @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("search history")
                .data(roomService.getSearchHistoryByUserEmail(email, authorizationHeader))
                .build();

    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse getRoomMe(@RequestParam(required = false) String keyword,
                                 @RequestParam(required = false) String sort,
                                 @RequestParam(defaultValue = "1") int page,
                                 @RequestParam(defaultValue = "20") int size,
                                 @RequestHeader("X-User-Email") String email,
                                 @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Get room list of user: {}", email);
        RoomPageResponse room = roomService.getRoomByUserEmail(keyword, sort, page, size,email, authorizationHeader);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("room")
                .data(room)
                .build();
    }

    @GetMapping("/detail/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER','ROLE_GUEST')")
    public ApiResponse getRoomById(@PathVariable Long roomId) {
        log.info("Get room detail by ID: {}", roomId);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("room")
                .data(roomService.getRoomById(roomId))
                .build();
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse createRoom(@RequestBody @Valid CreateRoomRequest request,
                                  @RequestHeader("X-User-Email")  String email,
                                  @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Create new room");
        Long roomId = roomService.createRoom(request, email, authorizationHeader);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Room created successfully")
                .data(roomId)
                .build();
    }

    @PutMapping("/update")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse updateRoom(@RequestBody @Valid UpdateRoomRequest request) {
        log.info("Update room");
        roomService.updateRoom(request);

        return ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Room updated successfully")
                .data("")
                .build();
    }

    @DeleteMapping("/delete/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_USER')")
    public ApiResponse deleteRoom(@PathVariable Long roomId) {
        log.info("Delete room with id: {}", roomId);
        roomService.deleteRoom(roomId);

        return ApiResponse.builder()
                .status(HttpStatus.RESET_CONTENT.value())
                .message("Room deleted successfully")
                .data("")
                .build();
    }

    @PutMapping("/approve/{roomId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse approveRoom(@PathVariable Long roomId,
                                   @RequestParam boolean approved) {
        log.info("Approve room with id: {}, approved: {}", roomId, approved);
        roomService.approveRoom(roomId, approved);
        return ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Room approval status updated successfully")
                .data("")
                .build();
    }
}