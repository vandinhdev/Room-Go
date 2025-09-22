package vandinh.ictu.user_service.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vandinh.ictu.user_service.models.UserEntity;



public interface UserRepository extends JpaRepository<UserEntity, Long> {
    @Query("SELECT u FROM UserEntity u " +
            "WHERE lower(u.firstName) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(u.lastName) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(u.username) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(u.phone) LIKE lower(concat('%', :keyword, '%')) " +
            "OR lower(u.email) LIKE lower(concat('%', :keyword, '%'))")

    Page<UserEntity> searchByKeyword(String keyword, Pageable pageable);
    UserEntity findByUsername(String username);

}
