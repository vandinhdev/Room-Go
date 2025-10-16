package vn.ictu.roommanagementservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.ictu.roommanagementservice.common.response.ApiResponse;
import vn.ictu.roommanagementservice.services.FavoriteRoomService;


@RestController
@RequestMapping("/api/favorite-rooms")
@Slf4j(topic = "FAVORITE_ROOM_CONTROLLER")
@RequiredArgsConstructor
public class FavoriteRoomController {
    private final FavoriteRoomService favoriteRoomService;

    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    @GetMapping("/me")
    public ApiResponse getFavoriteRoomsByUserEmail(@RequestHeader("X-User-Email") String email,
                                                   @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Favorite rooms retrieved successfully")
                .data(favoriteRoomService.getFavoriteRoomsByUserEmail(email, authorizationHeader))
                .build();
    }

    @PostMapping("/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ApiResponse addFavoriteRoom(@PathVariable Long roomId,
                                       @RequestHeader("X-User-Email")  String email,
                                       @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Favorite room added successfully")
                .data(favoriteRoomService.addFavoriteRoom(roomId, email, authorizationHeader))
                .build();
    }

    @DeleteMapping("/remove/{roomId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ApiResponse removeFavoriteRoom(@PathVariable Long roomId,
                                          @RequestHeader("X-User-Email") String email,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        favoriteRoomService.removeFavoriteRoom(roomId, email, authorizationHeader);
        return ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Favorite room removed successfully")
                .data(null)
                .build();
    }
}
