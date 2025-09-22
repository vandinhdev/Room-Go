package vandinh.ictu.chat_service.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vandinh.ictu.chat_service.models.Conversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByRoomIdAndCurrentUserIdAndOwnerId(Long roomId, Long currentUserId, Long ownerId);
    List<Conversation> findByCurrentUserIdOrOwnerId(Long currentUserId, Long ownerId);
    Optional<Conversation> findByConversationNameAndCurrentUserId(
            String conversationName, Long currentUserId);
}
