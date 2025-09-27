package vn.ictu.usermanagementservice.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
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
@Slf4j(topic = "CUSTOMIZE-FILTER")
public class CustomizeRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserServiceDetail serviceDetail;

    @Override

    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getServletPath();
        String method = request.getMethod();

        log.info("[USER-SERVICE] Incoming request: {} {}", method, path);

        if (path.startsWith("/api/user/auth/") ||
                path.startsWith("/user/auth/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/") ||
                "OPTIONS".equalsIgnoreCase(method)) {
            log.info("[USER-SERVICE] Bypassing JWT filter for path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }


        log.info("{} {}", request.getMethod(), request.getRequestURI());

        final String authHeader = request.getHeader(AUTHORIZATION);
        if (StringUtils.hasLength(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("token: {}...", token.substring(0, 15));
            String email = "";
            try {
                email = jwtService.extractEmail(token, TokenType.ACCESS_TOKEN);
                log.info("email: {}", email);
            } catch (AccessDeniedException e) {
                log.info(e.getMessage());
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(errorResponse(request.getRequestURI(), e.getMessage()));
                return;
            }

            UserDetails user = serviceDetail.loadUserByUsername(email);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            context.setAuthentication(authToken);
            SecurityContextHolder.setContext(context);

            filterChain.doFilter(request, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private String errorResponse(String url, String message) {
        try {
            ErrorResponse error = new ErrorResponse();
            error.setTimestamp(new Date());
            error.setStatus(HttpServletResponse.SC_FORBIDDEN);
            error.setPath(url);
            error.setError("Forbidden");
            error.setMessage(message);

            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            return gson.toJson(error);
        } catch (Exception e) {
            return "";
        }
    }
}
