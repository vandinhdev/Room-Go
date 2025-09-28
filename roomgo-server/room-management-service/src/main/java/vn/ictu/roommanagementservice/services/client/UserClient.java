package vn.ictu.roommanagementservice.services.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.ictu.roommanagementservice.common.response.ApiResponse;
import vn.ictu.roommanagementservice.dto.response.UserRespone;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-CLIENT")   // ✅ thêm log
public class UserClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public Long getUserIdByEmail(String email, String bearerToken) {
        log.info("Preparing to request user id for email: {}", email);      // log email
        log.info("Using bearer token: {}", bearerToken);                    // log token (cẩn thận khi log ở môi trường prod)

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = "http://esb-camel:8080/api/esb/user/by-email?email=" + email;
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
        log.info("User id resolved for email {}: {}", email, id);           // log id nhận được
        return id;
    }
}
