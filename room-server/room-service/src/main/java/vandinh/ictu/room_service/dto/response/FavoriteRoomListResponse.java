package vandinh.ictu.room_service.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import vandinh.ictu.room_service.models.FavoriteRoom;

import java.util.List;

@Data
@Getter
@Setter
@Builder
public class FavoriteRoomListResponse {
    List<FavoriteRoom> favoriteRooms;
}
