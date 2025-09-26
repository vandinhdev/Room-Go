package vn.ictu.usermanagementservice.service;


import vn.ictu.usermanagementservice.common.response.TokenResponse;
import vn.ictu.usermanagementservice.dto.request.SignInRequest;
import vn.ictu.usermanagementservice.dto.request.SignUpRequest;

public interface AuthService {
    TokenResponse login(SignInRequest request);
    TokenResponse getRefreshToken(String request);
    void register(SignUpRequest request);
    void verifyEmail(String email);
}

