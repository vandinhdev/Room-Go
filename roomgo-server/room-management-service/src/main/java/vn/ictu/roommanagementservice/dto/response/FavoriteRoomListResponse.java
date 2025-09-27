package vn.ictu.roommanagementservice.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import vn.ictu.roommanagementservice.models.FavoriteRoom;


import java.util.List;

@Data
@Getter
@Setter
@Builder
public class FavoriteRoomListResponse {
    List<FavoriteRoom> favoriteRooms;
}
