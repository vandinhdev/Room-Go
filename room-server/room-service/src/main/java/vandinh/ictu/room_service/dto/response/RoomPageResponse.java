package vandinh.ictu.room_service.dto.response;


import lombok.Getter;
import lombok.Setter;
import vandinh.ictu.room_service.common.response.PageResponseAbstract;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class RoomPageResponse extends PageResponseAbstract implements Serializable {
    private List<RoomResponse> rooms;

}
