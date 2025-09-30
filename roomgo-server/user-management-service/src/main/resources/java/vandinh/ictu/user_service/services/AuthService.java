package vandinh.ictu.user_service.services;

import vandinh.ictu.user_service.common.response.TokenResponse;
import vandinh.ictu.user_service.dto.request.SignInRequest;
import vandinh.ictu.user_service.dto.request.SignUpRequest;

public interface AuthService {
    TokenResponse login(SignInRequest request);
    TokenResponse getRefreshToken(String request);
    void register(SignUpRequest request);
    void verifyEmail(String email);
    //void logout(String email);
}

