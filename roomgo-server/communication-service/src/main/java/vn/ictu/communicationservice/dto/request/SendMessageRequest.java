package vn.ictu.communicationservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vn.ictu.communicationservice.common.enums.MessageType;

import java.io.Serializable;


@Data
public class SendMessageRequest implements Serializable {
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private MessageType messageType = MessageType.TEXT;
}
