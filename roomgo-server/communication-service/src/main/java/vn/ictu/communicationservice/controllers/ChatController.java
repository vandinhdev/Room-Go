package vn.ictu.communicationservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.ictu.communicationservice.common.response.ApiResponse;
import vn.ictu.communicationservice.dto.request.CreateConversationRequest;
import vn.ictu.communicationservice.dto.request.SendMessageRequest;
import vn.ictu.communicationservice.dto.response.ConversationDetailResponse;
import vn.ictu.communicationservice.models.Conversation;
import vn.ictu.communicationservice.services.ChatService;
import vn.ictu.communicationservice.services.client.RoomClient;
import vn.ictu.communicationservice.services.client.UserClient;


@RestController
@RequestMapping("/api/chat")
@Slf4j(topic = "CHAT_CONTROLLER")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final UserClient userClient;
    private final RoomClient roomClient;

    @GetMapping("/get-all-user-conversations")
    public ApiResponse getUserConversations(@RequestHeader("X-User-Email") String email,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = userClient.getUserIdByEmail(email, authorizationHeader);
        log.info("Fetching conversations for userId: {}", userId);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("User conversations retrieved successfully")
                .data(chatService.getUserConversations(userId, authorizationHeader))
                .build();
    }

    @GetMapping("/conversation/{conversationId}")
    public ApiResponse getConversationDetail(@PathVariable Long conversationId,
                                             @RequestHeader("X-User-Email") String email,
                                             @RequestHeader("Authorization") String authorizationHeader) {

        ConversationDetailResponse detail = chatService.getConversationDetail(conversationId, email, authorizationHeader);
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Conversation fetched successfully")
                .data(detail)
                .build();
    }

//    @GetMapping("/search-by-conversation-name")
//    public ApiResponse searchConversationByConversationName(
//            @RequestParam("name") String conversationName,
//            @RequestHeader("X-User-Email") String email,
//            @RequestHeader("Authorization") String authorizationHeader) {
//
//        Conversation conversation = chatService.findConversationByName(conversationName, email, authorizationHeader);
//        return ApiResponse.builder()
//                .status(200)
//                .message("Conversation found successfully")
//                .data(conversation)
//                .build();
//    }

    @PostMapping("/add-conversations/{roomId}")
    public ApiResponse createConversation(@PathVariable Long roomId,
                                          @RequestHeader("X-User-Email") String email,
                                          @RequestHeader("Authorization") String authorizationHeader) {

        log.info("Received request to create conversation for room: {}", roomId);

        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Conversation created successfully")
                .data(chatService.createConversation(roomId, email, authorizationHeader))
                .build();
    }

    @PostMapping("/send-message")
    public ApiResponse  SendMessage(@RequestBody @Valid SendMessageRequest request,
                                    @RequestHeader("X-User-Email") String email,
                                    @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Received request to send message: {}", request);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Message sent successfully")
                .data(chatService.sendMessage(request, email, authorizationHeader))
                .build();

    }


    @DeleteMapping("/delete-conversation/{conversationId}")
    public ApiResponse deleteConversation(@PathVariable Long conversationId,
                                          @RequestHeader("X-User-Email") String email,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = userClient.getUserIdByEmail(email, authorizationHeader);
        chatService.deleteConversation(conversationId, userId);
        return ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Conversation deleted successfully")
                .data(null)
                .build();
    }

}
