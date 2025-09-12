package vandinh.ictu.chat_service.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages",
        indexes = {
                @Index(name = "idx_messages_conversation_id", columnList = "conversation_id"),
                @Index(name = "idx_messages_conversation_created_at", columnList = "conversation_id, created_at DESC")
        })
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20)
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    public enum MessageType {TEXT, IMAGE, SYSTEM}
}