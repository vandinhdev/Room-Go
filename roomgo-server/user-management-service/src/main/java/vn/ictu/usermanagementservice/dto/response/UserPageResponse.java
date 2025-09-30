package vn.ictu.usermanagementservice.dto.response;

import lombok.Getter;
import lombok.Setter;
import vn.ictu.usermanagementservice.common.response.PageResponseAbstract;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class UserPageResponse extends PageResponseAbstract implements Serializable {
    private List<UserResponse> users;
}
