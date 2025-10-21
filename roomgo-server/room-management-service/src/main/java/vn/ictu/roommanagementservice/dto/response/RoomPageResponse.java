package vn.ictu.roommanagementservice.dto.response;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;


import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
public class RoomPageResponse implements Serializable {
    private int pageNumber;
    private int pageSize;
    private long totalPages;
    private long totalElements;
    private List<RoomResponse> rooms;

}
