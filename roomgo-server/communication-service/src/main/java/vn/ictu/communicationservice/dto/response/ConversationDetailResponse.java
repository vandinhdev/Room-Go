package vn.ictu.communicationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConversationDetailResponse {
    private Long conversationId;
    private Long currentUserId;
    private Long ownerId;

    private List<MessageResponse> messages;
}
