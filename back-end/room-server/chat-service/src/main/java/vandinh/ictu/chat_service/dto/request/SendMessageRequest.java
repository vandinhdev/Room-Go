package vandinh.ictu.chat_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vandinh.ictu.chat_service.common.enums.MessageType;
import vandinh.ictu.chat_service.models.Message;

@Data
public class SendMessageRequest {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private MessageType messageType = MessageType.TEXT;
}
