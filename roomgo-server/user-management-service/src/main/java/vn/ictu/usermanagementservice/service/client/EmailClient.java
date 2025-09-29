package vn.ictu.usermanagementservice.service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailClient {
    private final RestTemplate restTemplate;

    @Value("${services.email.base-url}")
    private String emailServiceUrl;

    public void sendVerificationEmail(String to, String name, String verifyLink) {
        Map<String, Object> body = Map.of(
                "to", to,
                "name", name,
                "verifyLink", verifyLink
        );
        restTemplate.postForEntity(emailServiceUrl + "/send-verification", body, String.class);
    }

    public void sendResetPasswordEmail(String to, String name, String otpCode) {
        Map<String, Object> body = Map.of(
                "to", to,
                "name", name,
                "otpCode", otpCode
        );
        restTemplate.postForEntity(emailServiceUrl + "/send-reset-password", body, String.class);
    }
}

