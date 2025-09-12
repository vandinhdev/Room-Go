package vandinh.ictu.room_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.room_service.common.response.ApiResponse;
import vandinh.ictu.room_service.dto.request.CreateRoomRequest;
import vandinh.ictu.room_service.services.RoomService;

@RestController
@RequestMapping("/api/room")
@Slf4j(topic = "ROOM-CONTROLLER")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @Operation(summary = "Create Room", description = "API add new room to database")
    @PostMapping("/add")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse createRoom(@RequestBody @Valid CreateRoomRequest request) {
        log.info("Create new room");
        Long roomId = roomService.createRoom(request);
        return ApiResponse.builder()
                .status(200)
                .message("Room created successfully")
                .data(roomId)
                .build();
    }
}
