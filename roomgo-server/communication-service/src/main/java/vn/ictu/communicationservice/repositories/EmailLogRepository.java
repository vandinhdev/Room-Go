package vn.ictu.communicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.ictu.communicationservice.models.EmailLog;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}
