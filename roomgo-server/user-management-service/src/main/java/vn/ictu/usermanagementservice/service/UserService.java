package vn.ictu.usermanagementservice.service;


import vn.ictu.usermanagementservice.dto.request.UpdateProfileRequest;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.dto.response.UserPageResponse;
import vn.ictu.usermanagementservice.dto.response.UserResponse;

public interface UserService {
    UserPageResponse getAllUser(String keyword, String sort, int page, int size);
    UserResponse getUserById(long id);
    UserResponse getUserByUsername(String username);
    UserResponse getUserByEmail(String email);
    void updateStatus(long id, String status);
    UserResponse getProfile(String email);
    void updateProfile(UpdateProfileRequest req, String email);
    void changePassword(UserPasswordRequest req, String email);
    void deleteUser(long id);

    void sendResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);
}
