package vandinh.ictu.room_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.room_service.common.response.ApiResponse;
import vandinh.ictu.room_service.services.FavoriteRoomService;

import java.util.List;

@RestController
@RequestMapping("/api/favorite-rooms")
@Slf4j(topic = "FAVORITE_ROOM_CONTROLLER")
@RequiredArgsConstructor
public class FavoriteRoomController {
    private final FavoriteRoomService favoriteRoomService;

    @Operation(summary = "Get Favorite Rooms by User Email", description = "API retrieve favorite rooms by user email")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_STUDENT','ROLE_ADMIN')")
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse getFavoriteRoomsByUserId(@PathVariable Long userId) {
        return ApiResponse.builder()
                .status(200)
                .message("Favorite rooms retrieved successfully")
                .data(favoriteRoomService.getFavoriteRoomsByUserId(userId))
                .build();
    }

    @Operation(summary = "Get Favorite Rooms by User Email", description = "API retrieve favorite rooms by user email")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_STUDENT','ROLE_ADMIN')")
    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse getFavoriteRoomsByUserEmail(@RequestHeader("X-User-Email") String email,
                                                   @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(200)
                .message("Favorite rooms retrieved successfully")
                .data(favoriteRoomService.getFavoriteRoomsByUserEmail(email, authorizationHeader))
                .build();
    }

    @Operation(summary = "Add Favorite Room", description = "API add a room to user's favorite list")
    @PostMapping("/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_STUDENT','ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse addFavoriteRoom(@PathVariable Long roomId,
                                       @RequestHeader("X-User-Email")  String email,
                                       @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(200)
                .message("Favorite room added successfully")
                .data(favoriteRoomService.addFavoriteRoom(roomId, email, authorizationHeader))
                .build();
    }


    @Operation(summary = "Remove Favorite Room", description = "API remove a room from user's favorite list")
    @DeleteMapping("/remove/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_OWNER','ROLE_STUDENT','ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse removeFavoriteRoom(@PathVariable Long roomId,
                                          @RequestHeader("X-User-Email") String email,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        favoriteRoomService.removeFavoriteRoom(roomId, email, authorizationHeader);
        return ApiResponse.builder()
                .status(200)
                .message("Favorite room removed successfully")
                .build();
    }


}
