package vandinh.ictu.user_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import vandinh.ictu.user_service.models.PasswordResetToken;
import vandinh.ictu.user_service.models.UserEntity;
import vandinh.ictu.user_service.repositories.PasswordResetTokenRepository;
import vandinh.ictu.user_service.repositories.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailClient emailClient;

    // B1: Gửi OTP
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

    // B2: Đặt lại mật khẩu
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
