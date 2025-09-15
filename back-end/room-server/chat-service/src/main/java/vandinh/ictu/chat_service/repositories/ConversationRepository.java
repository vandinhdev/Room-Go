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

//    // Tìm conversation theo room ID
//    Optional<Conversation> findByRoomId(Long roomId);
//
//    // Tìm tất cả conversations mà user tham gia
//    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId")
//    List<Conversation> findByUserId(@Param("userId") Long userId);
//
//    // Tìm conversation với pagination cho user
//    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId ORDER BY c.updatedAt DESC")
//    Page<Conversation> findByUserIdWithPagination(@Param("userId") Long userId, Pageable pageable);

    // Tìm conversation giữa 2 users
    @Query("SELECT c FROM Conversation c " +
            "WHERE c.id IN (" +
            "    SELECT p1.conversation.id FROM ConversationParticipant p1 " +
            "    WHERE p1.userId = :userId1 " +
            "    AND p1.conversation.id IN (" +
            "        SELECT p2.conversation.id FROM ConversationParticipant p2 " +
            "        WHERE p2.userId = :userId2" +
            "    )" +
            ")")
    Optional<Conversation> findConversationBetweenUsers(@Param("userId1") Long userId1,
                                                        @Param("userId2") Long userId2);

    // Kiểm tra user có trong conversation không
    @Query("SELECT COUNT(p) > 0 FROM ConversationParticipant p " +
            "WHERE p.conversation.id = :conversationId AND p.userId = :userId")
    boolean isUserInConversation(@Param("conversationId") Long conversationId,
                                 @Param("userId") Long userId);
}
