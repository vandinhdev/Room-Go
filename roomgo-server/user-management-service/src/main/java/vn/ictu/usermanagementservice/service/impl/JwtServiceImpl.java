package vn.ictu.usermanagementservice.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.ictu.usermanagementservice.common.enums.TokenType;
import vn.ictu.usermanagementservice.exception.InvalidDataException;
import vn.ictu.usermanagementservice.service.JwtService;


import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static vn.ictu.usermanagementservice.common.enums.TokenType.ACCESS_TOKEN;
import static vn.ictu.usermanagementservice.common.enums.TokenType.REFRESH_TOKEN;

@Service
public class JwtServiceImpl implements JwtService {
    @Value("${jwt.expiryMinutes:60}")
    private long expiryMinutes;

    @Value("${jwt.expiryDay:14}")
    private long expiryDay;

    @Value("${jwt.accessKey:dummy-access-key}")
    private String accessKey;

    @Value("${jwt.refreshKey:dummy-refresh-key}")
    private String refreshKey;

    @Override
    public String generateAccessToken(String email, List<String> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", authorities);
        return createAccessToken(claims, email);
    }


    @Override
    public String generateRefreshToken(String email, List<String> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", authorities);

        return createRefreshToken(claims, email);
    }

    @Override
    public String extractEmail(String token, TokenType type) {
        return extractClaim(token, type, Claims::getSubject);
    }

    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String email = extractEmail(token, ACCESS_TOKEN);
            return (email.equals(userDetails.getUsername())) && !isTokenExpired(token, ACCESS_TOKEN);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token, TokenType type) {
        return extractExpiration(token, type).before(new Date());
    }

    public Date extractExpiration(String token, TokenType type) {
        return extractClaim(token, type, Claims::getExpiration);
    }


    private String createAccessToken(Map<String, Object> claims, String email) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * expiryMinutes))
                .signWith(getKey(ACCESS_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String createRefreshToken(Map<String, Object> claims, String email) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * expiryDay))
                .signWith(getKey(REFRESH_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey(TokenType type) {
        switch (type) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(accessKey));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(refreshKey));
            }
            default -> throw new InvalidDataException("Invalid token type");
        }
    }

    private <T> T extractClaim(String token, TokenType type, Function<Claims, T> claimResolver) {
        final Claims claims = extraAllClaim(token, type);
        return claimResolver.apply(claims);
    }

    private Claims extraAllClaim(String token, TokenType type) {
        try {
            return Jwts.parserBuilder().setSigningKey(getKey(type)).build().parseClaimsJws(token).getBody();
        } catch (SignatureException | ExpiredJwtException e) { // Invalid signature or expired token
            throw new AccessDeniedException("Access denied: " + e.getMessage());
        }
    }


}
