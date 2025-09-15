package vandinh.ictu.chat_service.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateConversationRequest {
    @NotNull(message = "roomId must not be null")
    @JsonProperty("roomId")
    private Long roomId;

    private Long currentUserId;
    private Long ownerId;

}