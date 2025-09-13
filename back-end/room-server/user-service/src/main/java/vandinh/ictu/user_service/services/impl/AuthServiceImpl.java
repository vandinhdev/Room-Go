package vandinh.ictu.user_service.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthenticatedAuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vandinh.ictu.user_service.common.response.TokenResponse;
import vandinh.ictu.user_service.dto.request.SignInRequest;
import vandinh.ictu.user_service.dto.request.SignUpRequest;
import vandinh.ictu.user_service.exception.ForBiddenException;
import vandinh.ictu.user_service.exception.InvalidDataException;
import vandinh.ictu.user_service.models.Role;
import vandinh.ictu.user_service.models.UserEntity;
import vandinh.ictu.user_service.repositories.UserRepository;
import vandinh.ictu.user_service.services.AuthService;
import vandinh.ictu.user_service.services.JwtService;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import static vandinh.ictu.user_service.common.enums.TokenType.REFRESH_TOKEN;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Override
    public TokenResponse getAccessToken(SignInRequest request) {
        List<String> authorities = new ArrayList<>();
        try {
            Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            authenticate.getAuthorities().forEach(a -> authorities.add(a.getAuthority()));

            SecurityContextHolder.getContext().setAuthentication(authenticate);
        } catch (BadCredentialsException | DisabledException e) {
            throw new AccessDeniedException(e.getMessage());
        }

        String accessToken = jwtService.generateAccessToken(request.getEmail(), authorities);
        String refreshToken = jwtService.generateRefreshToken(request.getEmail(), authorities);

        return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    @Override
    public TokenResponse getRefreshToken(String refreshToken) {
        if (!StringUtils.hasLength(refreshToken)) {
            throw new InvalidDataException("Token must be not blank");
        }

        try {
            String email = jwtService.extractEmail(refreshToken, REFRESH_TOKEN);

            UserEntity userEmail = userRepository.findByEmail(email);

            List<String> authorities = new ArrayList<>();
            userEmail.getAuthorities().forEach(authority -> authorities.add(authority.getAuthority()));

            String accessToken = jwtService.generateAccessToken(userEmail.getEmail(), authorities);

            return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
        } catch (Exception e) {
            throw new ForBiddenException(e.getMessage());
        }
    }

    @Override
    public TokenResponse register(SignUpRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new InvalidDataException("Email is already in use");
        }

        String base = request.getFirstName().toLowerCase().trim() + "_" + request.getLastName().toLowerCase().trim();
        String generatedUsername = base + new Random().nextInt(1000);



        UserEntity user = UserEntity.builder()
                .username(generatedUsername)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.ADMIN)
                .build();

        userRepository.save(user);

        List<String> authorities = new ArrayList<>();
        user.getAuthorities().forEach(authority -> authorities.add(authority.getAuthority()));

        String accessToken = jwtService.generateAccessToken(user.getEmail(), authorities);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), authorities);

        return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
}
