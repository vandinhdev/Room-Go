package vn.ictu.roommanagementservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SerpApiResponse {

    @JsonProperty("local_results")
    private List<LocalResult> localResults = new ArrayList<>();

    @Data
    public static class LocalResult {
        @JsonProperty("title")
        private String title;

        @JsonProperty("gps_coordinates")
        private GpsCoordinates gpsCoordinates;
    }

    @Data
    public static class GpsCoordinates {
        private double latitude;
        private double longitude;
    }
}