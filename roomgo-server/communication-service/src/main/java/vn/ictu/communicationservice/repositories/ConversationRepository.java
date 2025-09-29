package vn.ictu.communicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.ictu.communicationservice.models.Conversation;


import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByRoomIdAndCurrentUserIdAndOwnerId(Long roomId, Long currentUserId, Long ownerId);
    List<Conversation> findByCurrentUserIdOrOwnerId(Long currentUserId, Long ownerId);
    Optional<Conversation> findByConversationNameAndCurrentUserId(
            String conversationName, Long currentUserId);
}
