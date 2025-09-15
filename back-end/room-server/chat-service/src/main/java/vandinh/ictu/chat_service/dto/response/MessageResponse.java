package vandinh.ictu.chat_service.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import vandinh.ictu.chat_service.common.enums.MessageType;
import vandinh.ictu.chat_service.models.Message;

import java.time.LocalDateTime;

@Data
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String content;
    private MessageType messageType;
    private Boolean isRead;

}