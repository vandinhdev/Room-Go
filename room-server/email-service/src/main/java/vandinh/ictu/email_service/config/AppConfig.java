package vandinh.ictu.email_service.config;

import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public SendGrid sendGrid(@Value("${spring.sendGrid.apiKey}") String apiKey) {
        return new SendGrid(apiKey);
    }
}
