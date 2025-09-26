package vn.ictu.usermanagementservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.ictu.usermanagementservice.model.UserEntity;
import vn.ictu.usermanagementservice.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-DETAIL-SERVICE")
public class UserServiceDetail implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("Loading user by email: {}", email);
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            log.warn("User not found with email: {}", email);
            throw new UsernameNotFoundException("User not found");
        }
        log.info("Found user in DB: {}", user.getEmail());
        return user;
    }

}
