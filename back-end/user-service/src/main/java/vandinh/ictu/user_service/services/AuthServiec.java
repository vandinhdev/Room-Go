package vandinh.ictu.user_service.services;

import vandinh.ictu.user_service.common.response.TokenResponse;
import vandinh.ictu.user_service.dto.request.SigInRequest;

public interface AuthServiec {
    TokenResponse getAccessToken(SigInRequest request);
    TokenResponse getRefreshToken(String request);

}
