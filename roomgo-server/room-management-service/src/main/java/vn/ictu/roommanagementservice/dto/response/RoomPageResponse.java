package vn.ictu.roommanagementservice.dto.response;


import lombok.Getter;
import lombok.Setter;
import vn.ictu.roommanagementservice.common.response.PageResponseAbstract;


import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class RoomPageResponse extends PageResponseAbstract implements Serializable {
    private List<RoomResponse> rooms;

}
