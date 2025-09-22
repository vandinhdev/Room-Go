package vandinh.ictu.user_service.services;

import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import vandinh.ictu.user_service.dto.request.CreateUserRequest;
import vandinh.ictu.user_service.dto.request.UpdateUserRequest;
import vandinh.ictu.user_service.dto.request.UserPasswordRequest;
import vandinh.ictu.user_service.dto.response.UserPageResponse;
import vandinh.ictu.user_service.dto.response.UserResponse;
import vandinh.ictu.user_service.models.UserEntity;

import java.util.List;

public interface UserService {
    UserPageResponse getAllUser(String keyword, String sort, int page, int size);
    UserResponse getUserById(long id);
    UserResponse getUserByUsername(String username);
    UserResponse getUserByEmail(String email);
    long addUser(CreateUserRequest req);
    void updateProfile(UpdateUserRequest req, String email);
    void changePassword(UserPasswordRequest req, String email);
    void deleteUser(long id);
}
