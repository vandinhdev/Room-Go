package vn.ictu.usermanagementservice.service;


import org.springframework.web.multipart.MultipartFile;
import vn.ictu.usermanagementservice.dto.request.UpdateInfoRequest;
import vn.ictu.usermanagementservice.dto.request.UpdateProfileRequest;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.dto.response.UserPageResponse;
import vn.ictu.usermanagementservice.dto.response.UserResponse;

import java.io.IOException;

public interface UserService {
    UserPageResponse getAllUser(String keyword, String sort, int page, int size);
    UserResponse getUserById(long id);
    UserResponse getUserByUsername(String username);
    UserResponse getUserByEmail(String email);
    void updateStatus(long id, String status);
    UserResponse getProfile(String email);
    void updateProfile(UpdateProfileRequest req, String email);
    void updateInfo(UpdateInfoRequest req, String email);
    void uploadAvatar(MultipartFile avatar, String email) throws IOException;
    void deleteUser(long id);


}
