package vn.ictu.communicationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private String conversationName;
    private Long roomId;
    private Long currentUserId;
    private Long ownerId;
}
