package vn.ictu.communicationservice.services.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.ictu.communicationservice.common.response.ApiResponse;
import vn.ictu.communicationservice.dto.response.UserRespone;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-CLIENT")   // ✅ thêm log
public class UserClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${services.esb.url}")
    private String esbUrl;

    public Long getUserIdByEmail(String email, String bearerToken) {
        log.info("Preparing to request user id for email: {}", email);      // log email
        log.info("Using bearer token: {}", bearerToken);                    // log token (cẩn thận khi log ở môi trường prod)

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = esbUrl  + "/user/email?email=" + email;
        log.info("Request URL: {}", url);                                   // log URL
        ResponseEntity<ApiResponse> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, ApiResponse.class);

        ApiResponse apiResp = response.getBody();
        UserRespone user = objectMapper.convertValue(apiResp.getData(), UserRespone.class);
        log.info("Raw JSON from user-service: {}", response.getBody());

        if (response.getBody() == null) {
            log.warn("No user found for email: {}", email);
            throw new IllegalArgumentException("User not found for email: " + email);
        }

        Long id = user.getId();
        log.info("User id resolved for email {}: {}", email, id);
        return id;
    }

    public String getFullNameByUserId(Long userId, String bearerToken) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId must not be null");
        }
        String url = esbUrl +  "/user/" + userId;
        log.info("Requesting user details from URL: {}", url);
        log.info("Using bearer token: {}", bearerToken);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ApiResponse> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, ApiResponse.class);

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        ApiResponse apiResponse = response.getBody();
        log.info("Raw JSON from user-service: {}", apiResponse);
        UserRespone userResponse = objectMapper.convertValue(apiResponse.getData(), UserRespone.class);

        log.info("Full name for user {} is {}", userId, userResponse.getFullName());
        return userResponse.getFullName();
    }

    public String getAvatarByUserId(Long userId, String bearerToken) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId must not be null");
        }
        String url = esbUrl +  "/user/" + userId;
        log.info("Requesting user details from URL: {}", url);
        log.info("Using bearer token: {}", bearerToken);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ApiResponse> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, ApiResponse.class);

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        ApiResponse apiResponse = response.getBody();
        log.info("Raw JSON from user-service: {}", apiResponse);
        UserRespone userResponse = objectMapper.convertValue(apiResponse.getData(), UserRespone.class);

        log.info("Avatar URL for user {} is {}", userId, userResponse.getAvatar());
        return userResponse.getAvatar();
    }
}
