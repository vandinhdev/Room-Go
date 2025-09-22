package vandinh.ictu.search_service.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal area;
    private String province;
    private String district;
    private String ward;
    private String address;
    private Double latitude;
    private Double longitude;

}
