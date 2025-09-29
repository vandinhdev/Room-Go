package vn.ictu.communicationservice.services;



import vn.ictu.communicationservice.dto.request.CreateConversationRequest;
import vn.ictu.communicationservice.dto.request.SendMessageRequest;
import vn.ictu.communicationservice.dto.response.ConversationDetailResponse;
import vn.ictu.communicationservice.models.Conversation;

import java.util.List;

public interface ChatService {
    List<Conversation> getUserConversations(Long userId);
    Conversation findConversationByName(String conversationName, String email, String bearerToken);
    Long CreateConversation(CreateConversationRequest request, String email, String bearerToken);
    Long SendMessage(SendMessageRequest request, String emall, String bearerToken);
    ConversationDetailResponse getConversationDetail(Long conversationId, String email, String bearerToken);
    void DeleteConversation(Long id);
}
