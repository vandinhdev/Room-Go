package vandinh.ictu.chat_service.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vandinh.ictu.chat_service.common.response.ApiResponse;
import vandinh.ictu.chat_service.dto.response.RoomResponse;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ROOM-CLIENT")
public class RoomClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public Long getOwnerIdByRoomId(Long roomId, String bearerToken) {
        if (roomId == null) {
            throw new IllegalArgumentException("RoomId must not be null");
        }
        String url = "http://localhost:8080/api/room/detail/" + roomId;
        log.info("Requesting room details from URL: {}", url);
        log.info("Using bearer token: {}", bearerToken);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ApiResponse> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, ApiResponse.class);

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new IllegalArgumentException("Room not found with id: " + roomId);
        }

        ApiResponse apiResponse = response.getBody();
        log.info("Raw JSON from room-service: {}", apiResponse);
        RoomResponse roomResponse = objectMapper.convertValue(apiResponse.getData(), RoomResponse.class);

        log.info("Owner id for room {} is {}", roomId, roomResponse.getOwnerId());
        return roomResponse.getOwnerId();
    }
}

