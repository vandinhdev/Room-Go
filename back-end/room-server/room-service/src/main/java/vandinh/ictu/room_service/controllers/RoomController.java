package vandinh.ictu.room_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.room_service.common.response.ApiResponse;
import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomRequest;
import vandinh.ictu.room_service.dto.response.RoomPageResponse;
import vandinh.ictu.room_service.dto.response.RoomResponse;
import vandinh.ictu.room_service.services.RoomService;

@RestController
@RequestMapping("/api/room")
@Slf4j(topic = "ROOM-CONTROLLER")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @Operation(summary = "Get Room list", description = "API retrieve room from database")
    @GetMapping("/list")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OWNER','ROLE_STUDENT')")
    public ApiResponse getAllRoom(@RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) String sort,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        log.info("Get room list");
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("rooms")
                .data(roomService.getAllRoom(keyword, sort, page, size))
                .build();
    }

    @Operation(summary = "Get Room detail", description = "API retrieve room detail by ID from database")
    @GetMapping("/detail/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OWNER','ROLE_STUDENT')")
    public ApiResponse getRoomById(@PathVariable Long id) {
        log.info("Get room detail by ID: {}", id);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("room")
                .data(roomService.getRoomById(id))
                .build();
    }

    @Operation(summary = "Create Room", description = "API add new room to database")
    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse createRoom(@RequestBody @Valid CreateRoomRequest request,
                                  @RequestHeader("X-User-Email")  String email,
                                  @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Create new room");
        Long roomId = roomService.createRoom(request, email, authorizationHeader);
        return ApiResponse.builder()
                .status(200)
                .message("Room created successfully")
                .data(roomId)
                .build();
    }

    @Operation(summary = "Update Room", description = "API update room in database")
    @PutMapping("/update")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse updateRoom(@RequestBody @Valid UpdateRoomRequest request) {
        log.info("Update room");
        roomService.updateRoom(request);

        return ApiResponse.builder()
                .status(200)
                .message("Room updated successfully")
                .data("")
                .build();
    }

    @Operation(summary = "Delete Room", description = "API delete room from database")
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse deleteRoom(@PathVariable Long id) {
        log.info("Delete room with id: {}", id);
        roomService.deleteRoom(id);

        return ApiResponse.builder()
                .status(200)
                .message("Room deleted successfully")
                .data("")
                .build();
    }
}