package vandinh.ictu.user_service.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vandinh.ictu.user_service.dto.request.CreateUserRequest;
import vandinh.ictu.user_service.dto.request.UpdateUserRequest;
import vandinh.ictu.user_service.dto.request.UserPasswordRequest;
import vandinh.ictu.user_service.dto.response.UserPageResponse;
import vandinh.ictu.user_service.dto.response.UserResponse;
import vandinh.ictu.user_service.exception.ResourceNotFoundException;
import vandinh.ictu.user_service.models.Role;
import vandinh.ictu.user_service.models.UserEntity;
import vandinh.ictu.user_service.repositories.UserRepository;
import vandinh.ictu.user_service.services.UserService;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j(topic = "USER_SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserPageResponse getAllUser(String keyword, String sort, int page, int size) {
        log.info("findAll start");

        // Sorting
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

        // Xu ly truong hop FE muon bat dau voi page = 1
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
                .role(userEntity.getRole())
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
                .role(userEntity.getRole())
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
                .role(userEntity.getRole())
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
        userEntity.setRole(Role.valueOf(req.getRole().toUpperCase()));
        UserEntity saveUser = userRepository.save(userEntity);

        return saveUser.getId();
    }

    @Override
    public void updateUser(UpdateUserRequest req) {
        UserEntity userEntity = getUserEntity(req.getId());
        userEntity.setFirstName(req.getFirstname());
        userEntity.setLastName(req.getLastname());
        userEntity.setEmail(req.getEmail());
        userEntity.setPhone(req.getPhone());
        userEntity.setGender(req.getGender());
        userEntity.setDateOfBirth(req.getDateOfBirth());

        userRepository.save(userEntity);

    }

    @Override
    public void changePassword(UserPasswordRequest req) {
        UserEntity user = getUserEntity(req.getId());
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
        userRepository.delete(userEntity);
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
}
