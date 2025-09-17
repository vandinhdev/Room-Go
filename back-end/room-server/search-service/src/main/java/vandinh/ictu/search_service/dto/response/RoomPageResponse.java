package vandinh.ictu.search_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RoomPageResponse {
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private List<RoomResponse> rooms;
}