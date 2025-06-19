package carForumSite.example.demo.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "model", schema = "tasit")
@Data
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private int modelId;

    @Column(name = "model_ismi")
    private String modelIsmi;

    @ManyToOne
    @JoinColumn(name = "araba_id")
    private Araba araba;

}
