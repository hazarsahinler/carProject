package carForumSite.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "motor", schema = "tasit")
@Data
public class Motor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "motor_id")
    private int motorId;

    @Column(name = "motor_ismi")
    private String motorIsmi;

    @ManyToOne
    @JoinColumn(name = "model_id")
    private Model model;
}
