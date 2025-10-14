package vn.ictu.usermanagementservice.mapper;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import vn.ictu.usermanagementservice.dto.response.UserPageResponse;
import vn.ictu.usermanagementservice.dto.response.UserResponse;
import vn.ictu.usermanagementservice.model.UserEntity;

import java.util.List;

@Component
public class UserMapper {

    public UserResponse toUserResponse(UserEntity entity) {
        if (entity == null) return null;

        return UserResponse.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .gender(entity.getGender())
                .dateOfBirth(entity.getDateOfBirth())
                .userName(entity.getUserName())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .role(entity.getRole().getRoleName())
                .status(entity.getStatus().name())
                .build();
    }

    public UserPageResponse toUserPageResponse(Page<UserEntity> entityPage, int page, int size) {
        List<UserResponse> users = entityPage.stream()
                .map(this::toUserResponse)
                .toList();

        return UserPageResponse.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .users(users)
                .build();
    }
}
