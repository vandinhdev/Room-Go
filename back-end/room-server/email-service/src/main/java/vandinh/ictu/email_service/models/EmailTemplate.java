package vandinh.ictu.email_service.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates", schema = "email_service")
@Data
public class EmailTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "template_name", nullable = false, unique = true)
    private String templateName;
    @Column(name = "subject_template", nullable = false)
    private String subjectTemplate;
    @Column(name = "body_template", columnDefinition = "TEXT", nullable = false)
    private String bodyTemplate;
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}