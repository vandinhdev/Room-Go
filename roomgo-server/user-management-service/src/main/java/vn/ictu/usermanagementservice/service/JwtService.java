package vn.ictu.usermanagementservice.service;


import org.springframework.security.core.userdetails.UserDetails;
import vn.ictu.usermanagementservice.common.enums.TokenType;

import java.util.Date;
import java.util.List;

public interface JwtService {
    String generateAccessToken(String email, List<String> authorities);
    String generateRefreshToken(String email, List<String> authorities);
    String extractEmail(String token, TokenType type);
    boolean isTokenValid(String token, UserDetails userDetails);
    boolean isTokenExpired(String token, TokenType type);
    Date extractExpiration(String token, TokenType type);


}
