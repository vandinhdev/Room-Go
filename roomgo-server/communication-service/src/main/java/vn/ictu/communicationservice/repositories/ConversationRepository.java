package vn.ictu.communicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.ictu.communicationservice.models.Conversation;


import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByUser1IdAndUser2Id(Long user1Id, Long user2Id);


    List<Conversation> findByUser1IdOrUser2Id(Long user1Id, Long user2Id);

    @Query("""
        SELECT c FROM Conversation c
        WHERE
            (c.user1Id = :userId AND c.deletedByUser1 = false)
            OR
            (c.user2Id = :userId AND c.deletedByUser2 = false)
    """)
    List<Conversation> findByUser1IdOrUser2IdAndNotDeleted(@Param("userId") Long userId);


    //Optional<Conversation> findByConversationNameAndCurrentUserId(String conversationName, Long currentUserId);

}
