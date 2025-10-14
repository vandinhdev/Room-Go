package vn.ictu.usermanagementservice.service;

import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;

public interface PasswordService {
    void changePassword(UserPasswordRequest req, String email);
    void sendResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);
}
