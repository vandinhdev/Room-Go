package vandinh.ictu.room_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vandinh.ictu.room_service.dto.response.GeoLocation;
import vandinh.ictu.room_service.dto.response.SerpApiResponse;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeocodingClient {
    private final RestTemplate restTemplate;

    @Value("${serpapi.key}")
    private String apiKey;

    public GeoLocation getLocation(String address) {
        String url = "https://serpapi.com/search.json?engine=google_maps&q={address}&api_key={apiKey}";
        Map<String, String> params = Map.of("address", address, "apiKey", apiKey);

        SerpApiResponse response = restTemplate.getForObject(url, SerpApiResponse.class, params);

        if (response == null || response.getLocalResults() == null || response.getLocalResults().isEmpty()) {
            throw new RuntimeException("Không tìm thấy tọa độ cho địa chỉ: " + address);
        }

        SerpApiResponse.GpsCoordinates gps =
                response.getLocalResults().get(0).getGpsCoordinates();

        return new GeoLocation(gps.getLatitude(), gps.getLongitude());
    }


}
