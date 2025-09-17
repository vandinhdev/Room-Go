package vandinh.ictu.search_service.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // bỏ qua field thừa
public class SerpApiResponse {

    @JsonProperty("local_results")
    private List<LocalResult> localResults = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocalResult {
        @JsonProperty("title")
        private String title;

        @JsonProperty("address")
        private String address;

        @JsonProperty("gps_coordinates")
        private GpsCoordinates gpsCoordinates;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GpsCoordinates {
        private Double latitude;
        private Double longitude;
    }
}