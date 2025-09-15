package vandinh.ictu.chat_service.services;

import org.springframework.data.domain.Page;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.dto.response.ConversationResponse;
import vandinh.ictu.chat_service.dto.response.MessageResponse;

public interface ChatService {
    ConversationResponse GetConversation(Long userId, Long roomId);
    Long CreateConversation(CreateConversationRequest request, String email, String bearerToken);
    ConversationResponse findConversationBetweenUsers(Long userId1, Long userId2);
    MessageResponse SendMessage(Long userId, Long roomId, String content, String messageType);
    MessageResponse MarkMessageAsRead(Long userId, Long messageId);
    Long CountUnreadMessages(Long userId, Long roomId);
    Page<MessageResponse> GetMessages(Long userId, Long roomId, int page, int size);
    Page<ConversationResponse> GetConversations(Long userId, int page, int size);

}
