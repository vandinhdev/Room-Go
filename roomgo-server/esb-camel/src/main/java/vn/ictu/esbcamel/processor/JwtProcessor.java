package vn.ictu.esbcamel.processor;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.util.List;

@Slf4j(topic = "JWT-PROCESSOR")
@Component
public class JwtProcessor implements Processor {

    @Value("${jwt.accessKey}")
    private String jwtSecret;

    @Override
    public void process(Exchange exchange) {
        try {
            String authHeader = exchange.getIn().getHeader("Authorization", String.class);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Authorization header missing or invalid");
            }

            String token = authHeader.substring(7);

            // Decode Base64 secret key (phù hợp với JwtServiceImpl ở user-management-service)
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
            log.info("🔑 JWT secret (Base64) decoded length = {}", key.getEncoded().length);

            // Parse token
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            List<String> roles = claims.get("role", List.class); // JwtServiceImpl lưu "role"

            // Set headers cho downstream services
            exchange.getIn().setHeader("X-User-Email", email);
            if (roles != null) {
                exchange.getIn().setHeader("X-User-Roles", String.join(",", roles));
            }

            // Forward lại Authorization header gốc để room-service sử dụng
            exchange.getIn().setHeader("Authorization", authHeader);

            log.info("✅ JWT verified: email={}, roles={}", email, roles);

        } catch (ExpiredJwtException e) {
            log.warn("⚠️ Token expired: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        } catch (MalformedJwtException e) {
            log.error("❌ Invalid token format: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed token");
        } catch (JwtException e) {
            log.error("❌ Invalid signature or token: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
        } catch (Exception e) {
            log.error("❌ Unexpected error parsing JWT: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "JWT processing failed");
        }
    }
}
