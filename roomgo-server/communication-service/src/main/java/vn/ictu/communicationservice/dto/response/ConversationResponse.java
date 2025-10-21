package vn.ictu.communicationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private Long roomId;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserAvatar;
}
