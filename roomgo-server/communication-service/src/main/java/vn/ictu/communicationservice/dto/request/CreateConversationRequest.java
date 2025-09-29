package vn.ictu.communicationservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class CreateConversationRequest implements Serializable {
    private String conversationName;
    @NotNull(message = "roomId must not be null")
    @JsonProperty("roomId")
    private Long roomId;
    private Long currentUserId;
    private Long ownerId;

}