package vn.ictu.communicationservice.dto.response;

import lombok.Builder;
import lombok.Data;
import vn.ictu.communicationservice.common.enums.MessageType;


import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private MessageType messageType;
    private Boolean isRead;
    private LocalDateTime createdAt;

}