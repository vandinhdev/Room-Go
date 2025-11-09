package vn.ictu.usermanagementservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.ictu.usermanagementservice.common.enums.UserStatus;
import vn.ictu.usermanagementservice.common.response.TokenResponse;
import vn.ictu.usermanagementservice.dto.request.SignInRequest;
import vn.ictu.usermanagementservice.dto.request.SignUpRequest;
import vn.ictu.usermanagementservice.exception.ForBiddenException;
import vn.ictu.usermanagementservice.exception.InvalidDataException;
import vn.ictu.usermanagementservice.model.Role;
import vn.ictu.usermanagementservice.model.UserEntity;
import vn.ictu.usermanagementservice.repository.RoleRepository;
import vn.ictu.usermanagementservice.repository.UserRepository;
import vn.ictu.usermanagementservice.service.AuthService;
import vn.ictu.usermanagementservice.service.JwtService;
import vn.ictu.usermanagementservice.utils.NameUtils;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static vn.ictu.usermanagementservice.common.enums.TokenType.REFRESH_TOKEN;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTH-SERVICE")
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    //private final EmailClient emailClient;


    @Override
    public TokenResponse login(SignInRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            log.info("Login success for email={}", request.getEmail());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            List<String> authorities = authentication.getAuthorities()
                    .stream()
                    .map(a -> a.getAuthority())
                    .toList();

            String accessToken = jwtService.generateAccessToken(authentication.getName(), authorities);
            String refreshToken = jwtService.generateRefreshToken(authentication.getName(), authorities);

            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Sai mật khẩu cho email={}", request.getEmail());
            throw new BadCredentialsException("Sai email hoặc mật khẩu");

        } catch (InternalAuthenticationServiceException e) {
            log.warn("User không tồn tại: {}", request.getEmail());

            if (e.getCause() instanceof UsernameNotFoundException) {
                throw new BadCredentialsException("Sai email hoặc mật khẩu");
            }

            throw new RuntimeException("Lỗi hệ thống khi xác thực", e);
        } catch (DisabledException e) {
            throw new DisabledException("Tài khoản bị vô hiệu hóa");
        }
    }



    @Override
    public TokenResponse getRefreshToken(String refreshToken) {
        if (!StringUtils.hasLength(refreshToken)) {
            throw new InvalidDataException("Refresh token must not be blank");
        }

        long periodCount = refreshToken.chars().filter(ch -> ch == '.').count();
        if (periodCount != 2) {
            log.error("Invalid JWT format. Expected 2 periods, found: {}. Token length: {}, Token preview: {}",
                    periodCount, refreshToken.length(),
                    refreshToken.length() > 50 ? refreshToken.substring(0, 50) + "..." : refreshToken);
            throw new InvalidDataException("Invalid refresh token format. JWT must contain exactly 2 period characters.");
        }

        try {
            String email = jwtService.extractEmail(refreshToken, REFRESH_TOKEN);
            log.info("Extracted email from refresh token: {}", email);

            UserEntity userEmail = userRepository.findByEmail(email);

            if (userEmail == null) {
                throw new InvalidDataException("User not found for email: " + email);
            }

            List<String> authorities = new ArrayList<>();
            userEmail.getAuthorities().forEach(authority -> authorities.add(authority.getAuthority()));

            String accessToken = jwtService.generateAccessToken(userEmail.getEmail(), authorities);

            log.info("Successfully refreshed token for email: {}", email);
            return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
        } catch (org.springframework.security.access.AccessDeniedException e) {
            log.error("Access denied during token refresh: {}", e.getMessage());
            throw new ForBiddenException("Invalid or expired refresh token: " + e.getMessage());
        } catch (InvalidDataException e) {
            log.error("Invalid data during token refresh: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during token refresh: {}", e.getMessage(), e);
            throw new ForBiddenException("Failed to refresh token: " + e.getMessage());
        }
    }

    @Override
    public TokenResponse createTokenGuest() {
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        List<String> roles = List.of("ROLE_GUEST");

        String accessToken = jwtService.generateAccessToken(guestUsername, roles);


        log.info("Created guest token for username: {}", guestUsername);
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(null)
                .build();

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(SignUpRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email is already in use");
        }
        String[] names = NameUtils.splitFullName(request.getFullName());
        String lastName = names[0];
        String firstName = names[1];

        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("Default role USER not found"));

        String generatedUsername = role.getRoleName().toLowerCase()
                + "_" + UUID.randomUUID().toString().substring(0, 8);

        UserEntity user = UserEntity.builder()
                .username(generatedUsername)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        // Gửi email xác thực
//        String verifyLink = "https://roomgo.com/verify?email=" + user.getEmail();
//        emailClient.sendVerificationEmail(
//                user.getEmail(),
//                user.getFirstName() + " " + user.getLastName(),
//                verifyLink
//        );
    }

    @Override
    public void verifyEmail(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new InvalidDataException("Email not found");
        }
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new InvalidDataException("Account already verified");
        }
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }


}
