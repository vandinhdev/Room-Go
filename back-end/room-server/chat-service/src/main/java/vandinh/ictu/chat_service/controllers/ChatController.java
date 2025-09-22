package vandinh.ictu.chat_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.chat_service.common.response.ApiResponse;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.dto.request.SendMessageRequest;
import vandinh.ictu.chat_service.dto.response.ConversationDetailResponse;
import vandinh.ictu.chat_service.models.Conversation;
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

    @Operation(summary = "Get all conversations for a user")
    @GetMapping("/get-user-conversations")
    public ApiResponse getUserConversations(@RequestHeader("X-User-Email") String email,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = userClient.getUserIdByEmail(email, authorizationHeader);
        log.info("Fetching conversations for userId: {}", userId);
        return ApiResponse.builder()
                .status(200)
                .message("User conversations retrieved successfully")
                .data(chatService.getUserConversations(userId))
                .build();
    }

    @Operation(summary = "Search for a conversation by its name")
    @GetMapping("/search-by-conversation-name")
    public ApiResponse searchConversationByConversationName(
            @RequestParam("name") String conversationName,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("Authorization") String authorizationHeader) {

        Conversation conversation = chatService.findConversationByName(
                conversationName, email, authorizationHeader);

        return ApiResponse.builder()
                .status(200)
                .message("Conversation found successfully")
                .data(conversation)
                .build();
    }


    @Operation(summary = "Create a new conversation")
    @PostMapping("/add-conversations")
    public ApiResponse createConversation(
            @RequestBody @Valid CreateConversationRequest request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("Authorization") String authorizationHeader) {

        log.info("Received request to create conversation for room: {}", request.getRoomId());

        Long currentUserId = userClient.getUserIdByEmail(email, authorizationHeader);
        request.setCurrentUserId(currentUserId);

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

    @Operation(summary = "Send a message in a conversation")
    @PostMapping("/send-message")
    public ApiResponse  SendMessage(@RequestBody @Valid SendMessageRequest request,
                                    @RequestHeader("X-User-Email") String email,
                                    @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Received request to send message: {}", request);
        return ApiResponse.builder()
                .status(200)
                .message("Message sent successfully")
                .data(chatService.SendMessage(request, email, authorizationHeader))
                .build();

    }

    @GetMapping("/conversations/{conversationId}")
    public ApiResponse getConversationDetail(
            @PathVariable Long conversationId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("Authorization") String authorizationHeader) {


        ConversationDetailResponse detail =
                chatService.getConversationDetail(conversationId, email, authorizationHeader);

        return ApiResponse.builder()
                .status(200)
                .message("Conversation fetched successfully")
                .data(detail)
                .build();
    }


    @Operation(summary = "Delete a conversation by ID")
    @DeleteMapping("/delete-conversation/{id}")
    public ApiResponse deleteConversation(@PathVariable Long id) {
        chatService.DeleteConversation(id);
        return ApiResponse.builder()
                .status(200)
                .message("Conversation deleted successfully")
                .data(null)
                .build();
    }

}
