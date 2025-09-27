package vn.ictu.usermanagementservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "roles",
        indexes = {
                @Index(name = "idx_roles_role_name", columnList = "role_name", unique = true)
        })
public class Role implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", unique = true, nullable = false, length = 20)
    private String roleName;

    @OneToMany(mappedBy = "role")
    private List<UserEntity> users = new ArrayList<>();
}
