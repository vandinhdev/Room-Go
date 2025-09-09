package vandinh.ictu.user_service.services;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import vandinh.ictu.user_service.repositories.UserRepository;

@Service
public record UserServiceDetail(UserRepository userRepository) {

    public UserDetailsService userDetailsService() {
        return userRepository::findByUsername;
    }
}
