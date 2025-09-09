package vandinh.ictu.user_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SigInRequest {
    private String email;
    private String password;
    private String platForm;
    private String diviceToken;
    private String versionApp;
}
