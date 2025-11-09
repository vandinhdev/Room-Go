package vn.ictu.communicationservice.services;



import vn.ictu.communicationservice.dto.request.CreateConversationRequest;
import vn.ictu.communicationservice.dto.request.SendMessageRequest;
import vn.ictu.communicationservice.dto.response.ConversationDetailResponse;
import vn.ictu.communicationservice.dto.response.ConversationResponse;
import vn.ictu.communicationservice.models.Conversation;

import java.util.List;

public interface ChatService {
    List<ConversationResponse> getUserConversations(Long userId, String bearerToken);
    //Conversation findConversationByName(String conversationName, String email, String bearerToken);
    Long createConversation(Long roomId, String email, String bearerToken);
    Long sendMessage(SendMessageRequest request, String emall, String bearerToken);
    void sendMessageViaWebSocket(SendMessageRequest request, String emall, String bearerToken);
    ConversationDetailResponse getConversationDetail(Long conversationId, String email, String bearerToken);
    void deleteConversation(Long conversationId, Long userId);
}
