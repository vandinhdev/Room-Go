package vn.ictu.usermanagementservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vn.ictu.usermanagementservice.common.enums.UserStatus;
import vn.ictu.usermanagementservice.dto.request.CreateUserRequest;
import vn.ictu.usermanagementservice.dto.request.UpdateUserRequest;
import vn.ictu.usermanagementservice.dto.request.UserPasswordRequest;
import vn.ictu.usermanagementservice.dto.response.UserPageResponse;
import vn.ictu.usermanagementservice.dto.response.UserResponse;
import vn.ictu.usermanagementservice.exception.ResourceNotFoundException;
import vn.ictu.usermanagementservice.model.PasswordResetToken;
import vn.ictu.usermanagementservice.model.UserEntity;
import vn.ictu.usermanagementservice.repository.PasswordResetTokenRepository;
import vn.ictu.usermanagementservice.repository.UserRepository;
import vn.ictu.usermanagementservice.service.UserService;
import vn.ictu.usermanagementservice.service.client.EmailClient;


import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j(topic = "USER_SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailClient emailClient;


    @Override
    public UserPageResponse getAllUser(String keyword, String sort, int page, int size) {
        log.info("findAll start");

        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+?)(:)(.*)"); // tencot:asc|desc
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) {
            pageNo = page - 1;
        }

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));
        Page<UserEntity> entityPage;

        if (StringUtils.hasLength(keyword)) {
            keyword = "%" + keyword + "%";
            entityPage = userRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = userRepository.findAll(pageable);
        }

        return getUserPageResponse(page, size, entityPage);
    }

    @Override
    public UserResponse getUserById(long id) {
        UserEntity userEntity = getUserEntity(id);

        return UserResponse.builder()
                .id(id)
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .gender(userEntity.getGender())
                .dateOfBirth(userEntity.getDateOfBirth())
                .userName(userEntity.getUsername())
                .phone(userEntity.getPhone())
                .email(userEntity.getEmail())
                .role(userEntity.getRole().getRoleName())
                .status(userEntity.getStatus().name())
                .build();
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        UserEntity userEntity = userRepository.findByUsername(username);
        return UserResponse.builder()
                .id(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .gender(userEntity.getGender())
                .dateOfBirth(userEntity.getDateOfBirth())
                .userName(userEntity.getUsername())
                .phone(userEntity.getPhone())
                .email(userEntity.getEmail())
                .role(userEntity.getRole().getRoleName())
                .status(userEntity.getStatus().name())
                .build();
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        return UserResponse.builder()
                .id(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .gender(userEntity.getGender())
                .dateOfBirth(userEntity.getDateOfBirth())
                .userName(userEntity.getUsername())
                .phone(userEntity.getPhone())
                .email(userEntity.getEmail())
                .role(userEntity.getRole().getRoleName())
                .status(userEntity.getStatus().name())
                .build();
    }



    @Override
    public long addUser(CreateUserRequest req) {
        UserEntity userEntity = new UserEntity();
        userEntity.setFirstName(req.getFirstname());
        userEntity.setLastName(req.getLastname());
        userEntity.setUsername(req.getUsername());
        userEntity.setPassword(passwordEncoder.encode(req.getPassword()));
        userEntity.setEmail(req.getEmail());
        userEntity.setPhone(req.getPhone());
        userEntity.setRole(req.getRole());
        userEntity.setStatus(UserStatus.PENDING);
        UserEntity saveUser = userRepository.save(userEntity);

        return saveUser.getId();
    }

    @Override
    public void updateProfile(UpdateUserRequest req, String email) {
        Long id = getUserByEmail(email).getId();
        UserEntity userEntity = getUserEntity(id);
        userEntity.setFirstName(req.getFirstname());
        userEntity.setLastName(req.getLastname());
        userEntity.setEmail(req.getEmail());
        userEntity.setPhone(req.getPhone());
        userEntity.setGender(req.getGender());
        userEntity.setDateOfBirth(req.getDateOfBirth());

        userRepository.save(userEntity);

    }

    @Override
    public void changePassword(UserPasswordRequest req, String email) {
        Long id = getUserByEmail(email).getId();
        req.setId(id);
        UserEntity user = getUserEntity(id);
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
    public void deleteUser(long id) {
        UserEntity userEntity = getUserEntity(id);
        userEntity.setStatus(UserStatus.INACTIVE);
        userRepository.save(userEntity);
    }

    private UserEntity getUserEntity(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static UserPageResponse getUserPageResponse(int page, int size, Page<UserEntity> userEntities) {
        log.info("Convert User Entity Page");

        List<UserResponse> userList = userEntities.stream().map(entity -> UserResponse.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .gender(entity.getGender())
                .dateOfBirth(entity.getDateOfBirth())
                .userName(entity.getUsername())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .role(entity.getRole().getRoleName())
                .status(entity.getStatus().name())
                .build()
        ).toList();

        UserPageResponse response = new UserPageResponse();
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(userEntities.getTotalElements());
        response.setTotalPages(userEntities.getTotalPages());
        response.setUsers(userList);

        return response;
    }

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
