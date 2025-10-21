package vn.ictu.usermanagementservice.service.impl;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.ictu.usermanagementservice.common.enums.UserStatus;
import vn.ictu.usermanagementservice.dto.request.*;
import vn.ictu.usermanagementservice.dto.response.UserPageResponse;
import vn.ictu.usermanagementservice.dto.response.UserResponse;
import vn.ictu.usermanagementservice.exception.ResourceNotFoundException;
import vn.ictu.usermanagementservice.mapper.UserMapper;
import vn.ictu.usermanagementservice.model.UserEntity;
import vn.ictu.usermanagementservice.repository.UserRepository;
import vn.ictu.usermanagementservice.service.FileStorageService;
import vn.ictu.usermanagementservice.service.UserService;
import vn.ictu.usermanagementservice.utils.AppUtils;
import vn.ictu.usermanagementservice.utils.NameUtils;



@Service
@Slf4j(topic = "USER_SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AppUtils appUtils;
    private final FileStorageService fileStorageService;


    @Override
    public UserPageResponse getAllUser(String keyword, String sort, int page, int size) {
        log.info("Fetching all users, page: {}, size: {}, keyword: {}", page, size, keyword);

        Sort.Order order = AppUtils.getSortOrder(sort);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(order));
        Page<UserEntity> entityPage = StringUtils.hasLength(keyword)
                ? userRepository.searchByKeyword("%" + keyword + "%", pageable)
                : userRepository.findAll(pageable);

        return userMapper.toUserPageResponse(entityPage, page, size);
    }

    @Override
    public UserResponse getUserById(long id) {
        log.info("Fetching user by ID: {}", id);
        UserEntity userEntity = getUserEntity(id);
        return userMapper.toUserResponse(userEntity);
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        UserEntity userEntity = userRepository.findByUsername(username);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with username: " + username);
        }
        return userMapper.toUserResponse(userEntity);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }
        return userMapper.toUserResponse(userEntity);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(long id, String status) {
        UserEntity userEntity = getUserEntity(id);
        userEntity.setStatus(UserStatus.valueOf(status.toUpperCase()));
        userRepository.save(userEntity);
    }

    @Override
    public UserResponse getProfile(String email) {
        return getUserByEmail(email);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProfile(UpdateProfileRequest req, String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }

        String[] names = NameUtils.splitFullName(req.getFullName());
        String lastName = names[0];
        String firstName = names[1];


        userEntity.setFirstName(firstName);
        userEntity.setLastName(lastName);
        userEntity.setDateOfBirth(req.getDateOfBirth());
        userEntity.setAddress(req.getAddress());
        userEntity.setBio(req.getBio());
        userRepository.save(userEntity);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateEmail(UpdateEmailRequest req, String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }
        userEntity.setEmail(req.getNewEmail());
        userRepository.save(userEntity);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePhone(UpdatePhoneRequest req, String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }
        userEntity.setPhone(req.getNewPhone());
        userRepository.save(userEntity);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAvatar(UpdateAvatarRequest request, String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }
        userEntity.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(userEntity);
    }

    @Override
    public void updateInfo(UpdateInfoRequest req, String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }

        String[] names = NameUtils.splitFullName(req.getFullName());
        String lastName = names[0];
        String firstName = names[1];

        userEntity.setFirstName(firstName);
        userEntity.setLastName(lastName);
        userEntity.setDateOfBirth(req.getDateOfBirth());
        userEntity.setAddress(req.getAddress());
        userEntity.setBio(req.getBio());
        userRepository.save(userEntity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void uploadAvatar(MultipartFile avatar, String email) throws IOException, java.io.IOException {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.uploadAvatar(avatar);
            user.setAvatarUrl(avatarUrl);
        }

        userRepository.save(user);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(long id) {
        UserEntity userEntity = getUserEntity(id);
        userEntity.setStatus(UserStatus.INACTIVE);
        userRepository.save(userEntity);
    }

    private UserEntity getUserEntity(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
