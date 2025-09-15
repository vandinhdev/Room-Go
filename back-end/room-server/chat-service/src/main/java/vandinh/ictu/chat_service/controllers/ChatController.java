package vandinh.ictu.chat_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.chat_service.common.response.ApiResponse;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.services.ChatService;
import vandinh.ictu.chat_service.services.RoomClient;
import vandinh.ictu.chat_service.services.UserClient;

@RestController
@RequestMapping("/api/chats")
@Slf4j(topic = "CHAT_CONTROLLER")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final UserClient userClient;
    private final RoomClient roomClient;

    @Operation(summary = "Create a new conversation")
    @PostMapping("/add-conversations")
    public ApiResponse createConversation(
            @RequestBody @Valid CreateConversationRequest request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("Authorization") String authorizationHeader) {

        log.info("Received request to create conversation for room: {}", request.getRoomId());

        // ✅ Gọi user-service để lấy currentUserId từ email
        Long currentUserId = userClient.getUserIdByEmail(email, authorizationHeader);
        request.setCurrentUserId(currentUserId);

        // ✅ Gọi room-service để lấy ownerId từ roomId
        Long ownerId = roomClient.getOwnerIdByRoomId(request.getRoomId(), authorizationHeader);
        request.setOwnerId(ownerId);

        log.info("Creating conversation between currentUser {} and owner {} for room {}",
                currentUserId, ownerId, request.getRoomId());

        log.info("Request payload: {}", request);


        return ApiResponse.builder()
                .status(200)
                .message("Conversation created successfully")
                .data(chatService.CreateConversation(request, email, authorizationHeader))
                .build();
    }

}
