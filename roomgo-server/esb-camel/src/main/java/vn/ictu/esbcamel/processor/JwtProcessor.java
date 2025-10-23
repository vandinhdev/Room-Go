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
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            List<String> roles = claims.get("role", List.class);

            exchange.getIn().setHeader("X-User-Email", email);
            if (roles != null) {
                exchange.getIn().setHeader("X-User-Roles", String.join(",", roles));
            }
            exchange.getIn().setHeader("Authorization", authHeader);


        } catch (ExpiredJwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        } catch (MalformedJwtException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed token");
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "JWT processing failed");
        }
    }
}
