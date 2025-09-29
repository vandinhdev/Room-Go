package vn.ictu.communicationservice.services;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.ictu.communicationservice.models.EmailLog;
import vn.ictu.communicationservice.repositories.EmailLogRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j(topic = "EMAIL-SERVICE")
@RequiredArgsConstructor
public class EmailService {
    private final EmailLogRepository emailLogRepository;

    @Value("${sendgrid.api-key}")
    private String sendgridApiKey;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.verify-template-id}")
    private String verifyTemplateId;

    @Value("${app.email.reset-template-id}")
    private String resetTemplateId;

    private void send(String to, String templateId, Map<String, Object> params) {
        EmailLog log = EmailLog.builder()
                .recipient(to)
                .templateId(templateId)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        emailLogRepository.save(log);

        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);

        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setTemplateId(templateId);

        Personalization personalization = new Personalization();
        personalization.addTo(toEmail);
        if (params != null) {
            params.forEach(personalization::addDynamicTemplateData);
        }
        mail.addPersonalization(personalization);

        SendGrid sg = new SendGrid(sendgridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.setStatus("SEND");
                log.setSentAt(LocalDateTime.now());
            } else {
                log.setStatus("FAILED");
                log.setErrorMessage(response.getBody());
            }
        } catch (IOException e) {
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage());
        }
        emailLogRepository.save(log);
    }

    // 📩 Xác thực tài khoản (link)
    public void sendVerificationEmail(String to, String name, String verifyLink) {
        Map<String, Object> params = Map.of(
                "name", name,
                "verify_link", verifyLink
        );
        send(to, verifyTemplateId, params);
    }

    // 📩 Đổi mật khẩu (OTP)
    public void sendResetPasswordEmail(String to, String name, String otpCode) {
        Map<String, Object> params = Map.of(
                "name", name,
                "otp_code", otpCode
        );
        send(to, resetTemplateId, params);
    }
}