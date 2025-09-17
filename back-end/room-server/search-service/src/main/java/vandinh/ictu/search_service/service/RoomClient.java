package vandinh.ictu.search_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vandinh.ictu.search_service.common.response.ApiResponse;
import vandinh.ictu.search_service.dto.response.RoomPageResponse;


import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ROOM-CLIENT")
public class RoomClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${room.service.url:http://localhost:8080}")
    private String roomServiceUrl;

    public RoomPageResponse getRooms(Map<String, Object> params, String bearerToken) {
        String url = roomServiceUrl + "/api/room/list";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String fullUrl = url + buildQueryString(params);
        log.info("Calling room-service API: {}", fullUrl);

        ResponseEntity<ApiResponse> response = restTemplate.exchange(
                fullUrl,
                HttpMethod.GET,
                entity,
                ApiResponse.class
        );

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new IllegalArgumentException("Không lấy được dữ liệu room từ room-service");
        }

        RoomPageResponse pageResponse = objectMapper.convertValue(
                response.getBody().getData(),
                RoomPageResponse.class
        );

        log.info("Fetched {} rooms from room-service",
                pageResponse.getRooms() != null ? pageResponse.getRooms().size() : 0);
        return pageResponse;
    }

    private String buildQueryString(Map<String, Object> params) {
        if (params == null || params.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("?");
        params.forEach((k, v) -> {
            if (v != null) {
                sb.append(k).append("=").append(v).append("&");
            }
        });
        return sb.substring(0, sb.length() - 1); // bỏ dấu & cuối
    }
}
