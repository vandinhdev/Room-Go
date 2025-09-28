package vn.ictu.roommanagementservice.dto.request;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRoomRequest implements Serializable {
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
    private String status;
    private List<String> imageUrls;
}
