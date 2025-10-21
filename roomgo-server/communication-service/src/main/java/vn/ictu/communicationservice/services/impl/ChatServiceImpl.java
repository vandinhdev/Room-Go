package vn.ictu.communicationservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vn.ictu.communicationservice.dto.request.CreateConversationRequest;
import vn.ictu.communicationservice.dto.request.SendMessageRequest;
import vn.ictu.communicationservice.dto.response.ConversationDetailResponse;
import vn.ictu.communicationservice.dto.response.ConversationResponse;
import vn.ictu.communicationservice.dto.response.MessageResponse;
import vn.ictu.communicationservice.models.Conversation;
import vn.ictu.communicationservice.models.Message;
import vn.ictu.communicationservice.repositories.ConversationRepository;
import vn.ictu.communicationservice.repositories.MessageRepository;
import vn.ictu.communicationservice.services.ChatService;
import vn.ictu.communicationservice.services.client.RoomClient;
import vn.ictu.communicationservice.services.client.UserClient;

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
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<ConversationResponse> getUserConversations(Long userId, String bearerToken) {

        List<Conversation> list = conversationRepository.findByUser1IdOrUser2IdAndNotDeleted(userId);


        return list.stream().map(conv -> {
            Long otherUserId = conv.getUser1Id().equals(userId)
                    ? conv.getUser2Id()
                    : conv.getUser1Id();

            String otherUserName = userClient.getFullNameByUserId(otherUserId, bearerToken);
            String otherUserAvatar = userClient.getAvatarByUserId(otherUserId, bearerToken);

            return new ConversationResponse(
                    conv.getId(),
                    conv.getRoomId(),
                    otherUserId,
                    otherUserName,
                    otherUserAvatar
            );
        }).toList();
    }




//    @Override
//    public Conversation findConversationByName(String conversationName, String email, String bearerToken) {
//        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
//        log.info("Resolved current user id: {} for email: {}", currentUserId, email);
//        return conversationRepository.findByConversationNameAndCurrentUserId(
//                conversationName, currentUserId).orElseThrow(() -> new IllegalArgumentException(
//                "No conversation found with name: " + conversationName));
//    }


    @Override
    public Long createConversation(Long roomId, String email, String bearerToken) {
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        Long ownerId = roomClient.getOwnerIdByRoomId(roomId, bearerToken);

        log.info("Creating conversation for roomId: {}, currentUserId: {}, ownerId: {}",
                roomId, currentUserId, ownerId);

        Long user1Id = Math.min(currentUserId, ownerId);
        Long user2Id = Math.max(currentUserId, ownerId);

        Optional<Conversation> existing = conversationRepository
                .findByUser1IdAndUser2Id(user1Id, user2Id);

        if (existing.isPresent()) {
            Conversation conv = existing.get();
            log.info("Conversation already exists with id {}", existing.get().getId());
            // Nếu trước đó 1 trong 2 user xoá, thì khôi phục
            if (Boolean.TRUE.equals(conv.getDeletedByUser1()) && conv.getUser1Id().equals(currentUserId)) {
                conv.setDeletedByUser1(false);
                conversationRepository.save(conv);
            }
            if (Boolean.TRUE.equals(conv.getDeletedByUser2()) && conv.getUser2Id().equals(currentUserId)) {
                conv.setDeletedByUser2(false);
                conversationRepository.save(conv);
            }

            return conv.getId();

        }

        Conversation conversation = Conversation.builder()
                .roomId(roomId)
                .user1Id(user1Id)
                .user2Id(user2Id)
                .deletedByUser1(false)
                .deletedByUser2(false)
                .build();

        Conversation saved = conversationRepository.save(conversation);
        log.info("Created new conversation id {} between users {} and {}", saved.getId(), user1Id, user2Id);

        return saved.getId();
    }

    @Override
    public Long sendMessage(SendMessageRequest request, String emall, String bearerToken) {
        Long senderId = userClient.getUserIdByEmail(emall, bearerToken);
        log.info("Resolved sender id: {} for email: {}", senderId, emall);

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conversation.getUser1Id().equals(senderId) && !conversation.getUser2Id().equals(senderId)) {
            throw new IllegalArgumentException("User is not a participant in the conversation");
        }

        String senderName = userClient.getFullNameByUserId(senderId, bearerToken);
        log.info("Resolved sender name: {} for sender id: {}", senderName, senderId);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSenderId(senderId);
        message.setSenderName(senderName);
        message.setContent(request.getContent());
        message.setMessageType(request.getMessageType());

        return messageRepository.save(message).getId();
    }

    @Override
    public void sendMessageViaWebSocket(SendMessageRequest request, String email, String bearerToken) {
        Long senderId = userClient.getUserIdByEmail(email, bearerToken);
        String senderName = userClient.getFullNameByUserId(senderId, bearerToken);
        log.info("Resolved sender id: {} for email: {}", senderId, email);


        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conversation.getUser1Id().equals(senderId) && !conversation.getUser2Id().equals(senderId)) {
            throw new IllegalArgumentException("User is not a participant in the conversation");
        }

        log.info("Received WebSocket message: {}", request);

        Long messageId = this.sendMessage(request, email, bearerToken);

        MessageResponse msgResponse = MessageResponse.builder()
                .id(messageId)
                .conversationId(request.getConversationId())
                .senderId(senderId)
                .senderName(senderName)
                .content(request.getContent())
                .messageType(request.getMessageType())
                .build();

        // 3️⃣ Phát (broadcast) tin nhắn đến topic tương ứng
        messagingTemplate.convertAndSend(
                "/topic/conversation." + request.getConversationId(),
                msgResponse
        );

        log.info("Message broadcasted to topic: /topic/conversation.{}", request.getConversationId());

    }

    @Override
    public ConversationDetailResponse getConversationDetail(Long conversationId, String email, String bearerToken) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        Long currentUserId = userClient.getUserIdByEmail(email, bearerToken);
        if (!conversation.getUser1Id().equals(currentUserId)
                && !conversation.getUser2Id().equals(currentUserId)) {
            throw new IllegalArgumentException("User is not a participant in the conversation");
        }
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<MessageResponse> messageResponses = messages.stream().map(msg -> {
            String senderName = userClient.getFullNameByUserId(msg.getSenderId(), bearerToken);
            return MessageResponse.builder()
                    .id(msg.getId())
                    .conversationId(msg.getConversation().getId())
                    .senderId(msg.getSenderId())
                    .senderName(senderName)
                    .content(msg.getContent())
                    .messageType(msg.getMessageType())
                    .isRead(msg.getIsRead())
                    .createdAt(msg.getCreatedAt())
                    .build();
        }).toList();

        return ConversationDetailResponse.builder()
                .conversationId(conversationId)
                .currentUserId(currentUserId)
                .ownerId(conversation.getUser1Id().equals(currentUserId)
                        ? conversation.getUser2Id() : conversation.getUser1Id())
                .messages(messageResponses)
                .build();
    }



    @Override
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (conversation.getUser1Id().equals(userId)) {
            conversation.setDeletedByUser1(true);
        } else if (conversation.getUser2Id().equals(userId)) {
            conversation.setDeletedByUser2(true);
        } else {
            throw new IllegalArgumentException("User is not in conversation");
        }

        if (conversation.getDeletedByUser1() && conversation.getDeletedByUser2()) {
            conversationRepository.delete(conversation);
            log.info("Conversation {} permanently deleted (both users deleted)", conversationId);
        } else {
            conversationRepository.save(conversation);
            log.info("Conversation {} hidden for user {}", conversationId, userId);
        }
    }


    private Conversation getConversationId(Long id) {
        return conversationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }

}
