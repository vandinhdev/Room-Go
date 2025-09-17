package vandinh.ictu.search_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SearchResponse {
    private String title;
    private String description;
    private Double price;
    private Double area;
    private String province;
    private String district;
    private String ward;
    private String address;
    private Double latitude;
    private Double longitude;
}
