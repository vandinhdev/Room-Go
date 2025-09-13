package vandinh.ictu.room_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vandinh.ictu.room_service.common.response.ApiResponse;
import vandinh.ictu.room_service.dto.request.CreateRoomImageRequest;
import vandinh.ictu.room_service.dto.request.UpdateRoomImageRequest;
import vandinh.ictu.room_service.services.RoomImageService;

@RestController
@RequestMapping("/api/room-images")
@Slf4j(topic = "ROOM-IMAGE-CONTROLLER")
@RequiredArgsConstructor
public class RoomImageController {
    private final RoomImageService roomImageService;

    @Operation(summary = "Get Room Image detail", description = "API retrieve room image detail by ID from database")
    @RequestMapping("/detail/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_OWNER','ROLE_STUDENT')")
    public ApiResponse getRoomImageById(@PathVariable Long id) {
        log.info("Get room image detail by ID: {}", id);
        return ApiResponse.builder()
                .status(200)
                .message("room image")
                .data(roomImageService.getRoomImageById(id))
                .build();
    }

    @Operation(summary = "Create Room Image", description = "API add new room image to database")
    @RequestMapping("/add")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    public ApiResponse createRoomImage(@RequestBody @Valid CreateRoomImageRequest request) {
        log.info("Create new room image");
        Long roomImageId = roomImageService.createRoomImage(request);
        return ApiResponse.builder()
                .status(200)
                .message("Create room image successfully")
                .data(roomImageId)
                .build();

    }

    @Operation(summary = "Update Room Image", description = "API update room image in database")
    @RequestMapping("/update")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    public ApiResponse updateRoomImage(@RequestBody @Valid UpdateRoomImageRequest request) {
        log.info("Update room image with ID: {}", request.getId());
        roomImageService.updateRoomImage(request);
        return ApiResponse.builder()
                .status(200)
                .message("Update room image successfully")
                .build();
    }

    @Operation(summary = "Delete Room Image", description = "API delete room image in database")
    @RequestMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_ADMIN')")
    public ApiResponse deleteRoomImage(Long id) {
        log.info("Delete room image with ID: {}", id);
        roomImageService.deleteRoomImage(id);
        return ApiResponse.builder()
                .status(200)
                .message("Delete room image successfully")
                .build();
    }

}
