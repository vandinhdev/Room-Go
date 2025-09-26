package vn.ictu.usermanagementservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "roles", schema = "soa_app")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", unique = true, nullable = false, length = 20)
    private String roleName;

    @OneToMany(mappedBy = "role")
    private List<UserEntity> users = new ArrayList<>();
}
