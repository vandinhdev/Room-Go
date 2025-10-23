package vn.ictu.communicationservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestHeader;
import vn.ictu.communicationservice.common.response.ApiResponse;
import vn.ictu.communicationservice.dto.request.SendMessageRequest;
import vn.ictu.communicationservice.services.ChatService;


@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

//    private final ChatService chatService;
//
//    @MessageMapping("/chat.send")
//    public void sendMessage(@Payload SendMessageRequest request) {
//        log.info("Received WebSocket message: {}", request);
//        chatService.sendMessageViaWebSocket(request, request.getSenderEmail(), request.getBearerToken());
//    }
}

