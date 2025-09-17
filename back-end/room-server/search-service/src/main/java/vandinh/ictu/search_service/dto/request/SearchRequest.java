package vandinh.ictu.search_service.dto.request;

import lombok.Data;

@Data
public class SearchRequest {
    private String province;
    private String district;
    private String ward;

    private Double minPrice;
    private Double maxPrice;

    private Double minArea;
    private Double maxArea;

    private String keyword;
}

