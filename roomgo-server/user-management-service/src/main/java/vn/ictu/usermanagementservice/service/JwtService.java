package vn.ictu.usermanagementservice.service;


import vn.ictu.usermanagementservice.common.enums.TokenType;
import java.util.List;

public interface JwtService {
    String generateAccessToken(String email, List<String> authorities);
    String generateRefreshToken(String email, List<String> authorities);
    String extractEmail(String token, TokenType type);

}
