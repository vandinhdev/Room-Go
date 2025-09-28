package vn.ictu.usermanagementservice.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.ictu.usermanagementservice.common.enums.TokenType;
import vn.ictu.usermanagementservice.common.response.ErrorResponse;
import vn.ictu.usermanagementservice.service.JwtService;
import vn.ictu.usermanagementservice.service.UserServiceDetail;

import java.io.IOException;
import java.util.Date;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "JWT_AUTH_FILTER")
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserServiceDetail serviceDetail;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // Whitelist: bypass filter
    private static final String[] AUTH_WHITELIST = {
            "/api/user/auth/**",
            "/api/esb/auth/**",
            "/user/auth/**",
            "/swagger-ui/**",
            "/v3/**",
            "/webjars/**",
            "/favicon.ico"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        log.info("[USER-SERVICE] Incoming request: {} {}", method, path);

        // Nếu path nằm trong whitelist → bỏ qua luôn
        for (String pattern : AUTH_WHITELIST) {
            if (pathMatcher.match(pattern, path)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        final String authHeader = request.getHeader(AUTHORIZATION);

        if (!StringUtils.hasLength(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtService.extractEmail(token, TokenType.ACCESS_TOKEN);

            if (StringUtils.hasLength(email) && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = serviceDetail.loadUserByUsername(email);

                if (jwtService.isTokenValid(token, user)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authToken);
                    SecurityContextHolder.setContext(context);
                }
            }
        } catch (Exception e) {
            log.error("JWT filter error: {}", e.getMessage());
            writeErrorResponse(response, request.getRequestURI(), e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeErrorResponse(HttpServletResponse response, String path, String message) throws IOException {
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(new Date());
        error.setStatus(HttpServletResponse.SC_FORBIDDEN);
        error.setPath(path);
        error.setError("Forbidden");
        error.setMessage(message);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(gson.toJson(error));
    }
}
