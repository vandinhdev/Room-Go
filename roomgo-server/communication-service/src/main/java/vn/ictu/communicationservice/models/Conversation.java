package vn.ictu.communicationservice.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.util.Date;

@Entity
@Getter @Setter
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "current_user_id", "owner_id"}))
public class Conversation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_name")
    private String conversationName;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "current_user_id", nullable = false)
    private Long currentUserId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;
}
