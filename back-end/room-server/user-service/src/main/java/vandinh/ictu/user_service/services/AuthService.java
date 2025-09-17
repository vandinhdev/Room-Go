package vandinh.ictu.user_service.services;

import vandinh.ictu.user_service.common.response.TokenResponse;
import vandinh.ictu.user_service.dto.request.SignInRequest;
import vandinh.ictu.user_service.dto.request.SignUpRequest;

public interface AuthService {
    TokenResponse getAccessToken(SignInRequest request);
    TokenResponse getRefreshToken(String request);
    TokenResponse register(SignUpRequest request);
    //void logout(String email);
}

