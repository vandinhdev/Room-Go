package vandinh.ictu.chat_service.services.impl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.dto.request.SendMessageRequest;
import vandinh.ictu.chat_service.dto.response.ConversationDetailResponse;
import vandinh.ictu.chat_service.dto.response.ConversationResponse;
import vandinh.ictu.chat_service.dto.response.MessageResponse;
import vandinh.ictu.chat_service.dto.response.UserRespone;
import vandinh.ictu.chat_service.models.Conversation;
import vandinh.ictu.chat_service.models.Message;
import vandinh.ictu.chat_service.repositories.ConversationRepository;
import vandinh.ictu.chat_service.repositories.MessageRepository;
import vandinh.ictu.chat_service.services.ChatService;
import vandinh.ictu.chat_service.services.RoomClient;
import vandinh.ictu.chat_service.services.UserClient;

import java.util.List;
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
    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findByCurrentUserIdOrOwnerId(userId, userId);
    }

    @Override
    public Conversation findConversationByName(String conversationName, String email, String bearerToken) {
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        log.info("Resolved current user id: {} for email: {}", currentUserId, email);
        return conversationRepository.findByConversationNameAndCurrentUserId(
                conversationName, currentUserId).orElseThrow(() -> new IllegalArgumentException(
                "No conversation found with name: " + conversationName));
    }


    @Override
    public Long CreateConversation(CreateConversationRequest  request, String email,String bearerToken) {
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        log.info("Resolved current user id: {} for email: {}", currentUserId, email);

        Long ownerId = roomClient.getOwnerIdByRoomId(request.getRoomId(), bearerToken);
        log.info("Resolved owner id: {} for room id: {}", ownerId, request.getRoomId());

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

        String conversationName = userClient.getFullNameByUserId(ownerId, bearerToken);

        Conversation conversation = new Conversation();
        conversation.setConversationName(conversationName);
        conversation.setRoomId(request.getRoomId());
        conversation.setCurrentUserId(currentUserId);
        conversation.setOwnerId(ownerId);

        Conversation saved = conversationRepository.save(conversation);

        log.info("Created new conversation with id {}", saved.getId());
        return saved.getId();
    }

    @Override
    public Long SendMessage(SendMessageRequest request, String emall, String bearerToken) {
        Long senderId = userClient.getUserIdByEmail(emall, bearerToken);
        log.info("Resolved sender id: {} for email: {}", senderId, emall);

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conversation.getCurrentUserId().equals(senderId) && !conversation.getOwnerId().equals(senderId)) {
            throw new IllegalArgumentException("User is not a participant in the conversation");
        }

        String senderName = userClient.getFullNameByUserId(senderId, bearerToken);
        log.info("Resolved sender name: {} for sender id: {}", senderName, senderId);

        Message  message = new Message();
        message.setConversation(conversation);
        message.setSenderId(senderId);
        message.setSenderName(senderName);
        message.setContent(request.getContent());
        message.setMessageType(request.getMessageType());

        return messageRepository.save(message).getId();
    }

    @Override
    public ConversationDetailResponse getConversationDetail(Long conversationId, String email, String bearerToken) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        if (!conversation.getCurrentUserId().equals(currentUserId)
                && !conversation.getOwnerId().equals(currentUserId)) {
            throw new IllegalArgumentException("User is not a participant in the conversation");
        }
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<MessageResponse> messageResponses = messages.stream().map(msg -> {
            String senderName = userClient.getFullNameByUserId(msg.getSenderId(), bearerToken);
            return MessageResponse.builder()
                    .id(msg.getId())
                    .senderId(msg.getSenderId())
                    .senderName(senderName)
                    .content(msg.getContent())
                    .messageType(msg.getMessageType())
                    .createdAt(msg.getCreatedAt())
                    .build();
        }).toList();

        return ConversationDetailResponse.builder()
                .conversationId(conversationId)
                .currentUserId(currentUserId)
                .ownerId(conversation.getOwnerId())
                .messages(messageResponses)
                .build();
    }



    @Override
    public void DeleteConversation(Long id) {
        Conversation conversation = getConversationId(id);
        if (conversation != null) {
            conversationRepository.delete(conversation);
            log.info("Deleted conversation with id: {}", id);
        }
    }

    private Conversation getConversationId(Long id) {
        return conversationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }

}
