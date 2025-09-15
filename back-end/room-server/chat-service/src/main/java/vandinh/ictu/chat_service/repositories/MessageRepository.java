package vandinh.ictu.chat_service.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vandinh.ictu.chat_service.models.Message;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Tìm messages theo conversation ID với pagination
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    // Tìm messages theo conversation ID
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    // Tìm messages chưa đọc của user trong conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
            "AND m.senderId != :userId AND m.isRead = false")
    List<Message> findUnreadMessagesByConversationAndUser(@Param("conversationId") Long conversationId,
                                                          @Param("userId") Long userId);

    // Đếm số messages chưa đọc của user trong conversation
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
            "AND m.senderId != :userId AND m.isRead = false")
    Long countUnreadMessagesByConversationAndUser(@Param("conversationId") Long conversationId,
                                                  @Param("userId") Long userId);

    // Đánh dấu tất cả messages là đã đọc
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true " +
            "WHERE m.conversation.id = :conversationId AND m.senderId != :userId AND m.isRead = false")
    int markMessagesAsRead(@Param("conversationId") Long conversationId,
                           @Param("userId") Long userId);

    // Tìm message mới nhất của conversation
    Message findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    // Tìm messages theo khoảng thời gian
    List<Message> findByConversationIdAndCreatedAtBetween(Long conversationId,
                                                          LocalDateTime startTime,
                                                          LocalDateTime endTime);

    // Đếm tổng số messages trong conversation
    Long countByConversationId(Long conversationId);
}