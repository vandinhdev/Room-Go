package vn.ictu.communicationservice.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "conversation_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id", "user_id"}))
public class ConversationParticipant implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
}