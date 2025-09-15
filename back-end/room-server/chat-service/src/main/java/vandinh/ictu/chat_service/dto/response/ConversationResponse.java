package vandinh.ictu.chat_service.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private Long roomId;
    private Long currentUserId;
    private Long ownerId;
}
