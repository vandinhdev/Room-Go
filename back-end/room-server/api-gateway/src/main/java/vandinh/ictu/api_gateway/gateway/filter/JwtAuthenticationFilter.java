package vandinh.ictu.api_gateway.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@Slf4j(topic = "JWT-FILTER")
public class JwtAuthenticationFilter implements GlobalFilter {

    @Value("${jwt.accessKey}")
    private String secretKey;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getPath().toString();
        // ✅ Bỏ qua xác thực cho các endpoint public
        if (path.startsWith("/api/auth/") || path.startsWith("/swagger-ui") || path.startsWith("/v3/")) {
            return chain.filter(exchange);
        }
        String token = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        log.info("Authorization header: {}", token);
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        token = token.substring(7);

        try {
            // ✅ Giải mã JWT và lấy thông tin email + roles
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            List<String> roles = claims.get("role", List.class);

            ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .header("X-User-Email", email)
                    .header("X-User-Roles", String.join(",", roles))
                    .build();
            log.info("Roles to forward: {}", roles);
            log.info("Email to forward: {}", email);

            return chain.filter(exchange.mutate().request(mutated).build());

        } catch (JwtException e) {
            log.error("JWT error: {}", e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}
