package vandinh.ictu.user_service.dto.response;

import lombok.Getter;
import lombok.Setter;
import vandinh.ictu.user_service.common.response.PageResponseAbstract;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class UserPageResponse extends PageResponseAbstract implements Serializable {
    private List<UserResponse> users;
}
