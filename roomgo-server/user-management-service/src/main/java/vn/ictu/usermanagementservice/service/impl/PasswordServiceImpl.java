package vn.ictu.usermanagementservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.exception.ResourceNotFoundException;
import vn.ictu.usermanagementservice.model.PasswordResetToken;
import vn.ictu.usermanagementservice.model.UserEntity;
import vn.ictu.usermanagementservice.repository.PasswordResetTokenRepository;
import vn.ictu.usermanagementservice.repository.UserRepository;
import vn.ictu.usermanagementservice.service.PasswordService;
import vn.ictu.usermanagementservice.service.client.EmailClient;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PASSWORD_SERVICE")
public class PasswordServiceImpl implements PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailClient emailClient;


    @Override
    public void changePassword(UserPasswordRequest req, String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) throw new ResourceNotFoundException("User not found with email: " + email);

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User không tồn tại");
        }

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .build();
        tokenRepository.save(token);

        emailClient.sendResetPasswordEmail(user.getEmail(),
                user.getFirstName(),
                otp);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        PasswordResetToken token = tokenRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Chưa yêu cầu OTP"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP đã hết hạn");
        }
        if (!token.getOtpCode().equals(otp)) {
            throw new RuntimeException("OTP không đúng");
        }

        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User không tồn tại");
        }
        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userRepository.save(user);

        tokenRepository.deleteByEmail(email); // xóa token cũ
    }
}
