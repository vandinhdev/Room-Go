package vandinh.ictu.chat_service.services.impl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.dto.response.ConversationResponse;
import vandinh.ictu.chat_service.dto.response.MessageResponse;
import vandinh.ictu.chat_service.models.Conversation;
import vandinh.ictu.chat_service.repositories.ConversationRepository;
import vandinh.ictu.chat_service.repositories.MessageRepository;
import vandinh.ictu.chat_service.services.ChatService;
import vandinh.ictu.chat_service.services.RoomClient;
import vandinh.ictu.chat_service.services.UserClient;

import java.util.Optional;


@Service
@Slf4j(topic = "CHAT_SERVICE")
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserClient userClient;
    private final RoomClient roomClient;

    @Override
    public ConversationResponse GetConversation(Long userId, Long roomId) {
        return null;
    }

    @Override
    public Long CreateConversation(CreateConversationRequest  request, String email,String bearerToken) {
        // 1. Lấy currentUserId từ email
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        log.info("Resolved current user id: {} for email: {}", currentUserId, email);

        // 2. Lấy ownerId từ room-service
        Long ownerId = roomClient.getOwnerIdByRoomId(request.getRoomId(), bearerToken);
        log.info("Resolved owner id: {} for room id: {}", ownerId, request.getRoomId());

        // 3. Kiểm tra conversation đã tồn tại chưa
        Optional<Conversation> existing = conversationRepository
                .findByRoomIdAndCurrentUserIdAndOwnerId(
                        request.getRoomId(),
                        currentUserId,
                        ownerId
                );

        if (existing.isPresent()) {
            log.info("Conversation already exists with id {}", existing.get().getId());
            return existing.get().getId();
        }

        // 4. Tạo mới nếu chưa có
        Conversation conversation = new Conversation();
        conversation.setRoomId(request.getRoomId());
        conversation.setCurrentUserId(currentUserId);
        conversation.setOwnerId(ownerId);

        Conversation saved = conversationRepository.save(conversation);

        log.info("Created new conversation with id {}", saved.getId());
        return saved.getId();
    }

    @Override
    public ConversationResponse findConversationBetweenUsers(Long userId1, Long userId2) {
        return null;
    }

    @Override
    public MessageResponse SendMessage(Long userId, Long roomId, String content, String messageType) {
        return null;
    }

    @Override
    public MessageResponse MarkMessageAsRead(Long userId, Long messageId) {
        return null;
    }

    @Override
    public Long CountUnreadMessages(Long userId, Long roomId) {
        return 0L;
    }

    @Override
    public Page<MessageResponse> GetMessages(Long userId, Long roomId, int page, int size) {
        return null;
    }

    @Override
    public Page<ConversationResponse> GetConversations(Long userId, int page, int size) {
        return null;
    }

    private ConversationResponse mapToConversationResponse(Conversation conversation) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getRoomId(),
                conversation.getCurrentUserId(),
                conversation.getOwnerId()
        );
    }

//    // Helper methods
//    private ConversationResponse mapToConversationResponse(Conversation conversation) {
//        ConversationResponse response = new ConversationResponse();
//        response.setId(conversation.getId());
//        response.setRoomId(conversation.getRoomId());
//
//        if (conversation.getParticipants() != null) {
//            List<Long> participantIds = conversation.getParticipants().stream()
//                    .map(ConversationParticipant::getUserId)
//                    .collect(Collectors.toList());
//            response.setParticipantIds(participantIds);
//        }
//
//        // Lấy tin nhắn mới nhất
//        Message latestMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
//        if (latestMessage != null) {
//            response.setLatestMessage(mapToMessageResponse(latestMessage));
//        }
//
//        return response;
//    }
//
//    private MessageResponse mapToMessageResponse(Message message) {
//        MessageResponse response = new MessageResponse();
//        response.setId(message.getId());
//        response.setConversationId(message.getConversation().getId());
//        response.setSenderId(message.getSenderId());
//        response.setContent(message.getContent());
//        response.setMessageType(message.getMessageType());
//        response.setIsRead(message.getIsRead());
//        return response;
//    }
}
