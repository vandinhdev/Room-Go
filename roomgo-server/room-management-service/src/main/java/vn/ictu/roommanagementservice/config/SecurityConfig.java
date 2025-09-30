package vn.ictu.roommanagementservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final GatewayRoleFilter gatewayRoleFilter;

    public SecurityConfig(GatewayRoleFilter gatewayRoleFilter) {
        this.gatewayRoleFilter = gatewayRoleFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .addFilterBefore(gatewayRoleFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
