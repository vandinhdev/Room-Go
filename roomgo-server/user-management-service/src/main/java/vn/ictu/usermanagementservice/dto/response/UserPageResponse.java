package vn.ictu.usermanagementservice.dto.response;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPageResponse {
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private List<UserResponse> users;
}
