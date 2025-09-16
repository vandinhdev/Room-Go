package vandinh.ictu.chat_service.services;

import org.springframework.data.domain.Page;
import vandinh.ictu.chat_service.dto.request.CreateConversationRequest;
import vandinh.ictu.chat_service.dto.request.SendMessageRequest;
import vandinh.ictu.chat_service.dto.response.ConversationDetailResponse;
import vandinh.ictu.chat_service.dto.response.ConversationResponse;
import vandinh.ictu.chat_service.dto.response.MessageResponse;
import vandinh.ictu.chat_service.models.Conversation;

import java.util.List;

public interface ChatService {
    List<Conversation> getUserConversations(Long userId);
    Conversation findConversationByName(String conversationName, String email, String bearerToken);
    Long CreateConversation(CreateConversationRequest request, String email, String bearerToken);
    Long SendMessage(SendMessageRequest request, String emall, String bearerToken);
    ConversationDetailResponse getConversationDetail(Long conversationId, String email, String bearerToken);
    void DeleteConversation(Long id);
}
