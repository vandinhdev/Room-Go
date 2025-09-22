package vandinh.ictu.search_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;
import vandinh.ictu.search_service.dto.response.GeoLocation;
import vandinh.ictu.search_service.dto.response.SerpApiResponse;
import vandinh.ictu.search_service.exception.LocationNotFoundException;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "GEOCODING-CLIENT")
public class GeocodingClient {
    private final RestTemplate restTemplate;

    @Value("${serpapi.key}")
    private String apiKey;

    public GeoLocation getLocation(String address) {
        String encoded = UriUtils.encode(address, StandardCharsets.UTF_8);
        String url = "https://serpapi.com/search.json?engine=google_maps&q="
                + encoded + "&api_key=" + apiKey;

        log.info("Calling SerpAPI for address: {}", address);

        SerpApiResponse response = restTemplate.getForObject(url, SerpApiResponse.class);

        if (response == null || response.getLocalResults() == null || response.getLocalResults().isEmpty()) {
            log.warn("No results found for address: {}", address);
            throw new LocationNotFoundException("Không tìm thấy tọa độ cho địa chỉ: " + address);
        }

        SerpApiResponse.GpsCoordinates gps = response.getLocalResults().get(0).getGpsCoordinates();

        return new GeoLocation(gps.getLatitude(), gps.getLongitude());
    }


}
