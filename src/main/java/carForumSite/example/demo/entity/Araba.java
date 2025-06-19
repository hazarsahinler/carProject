package carForumSite.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "araba", schema = "tasit")
@Data
public class Araba {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "araba_id")
    private int arabaId;

    @Column(name = "araba_marka")
    private String arabaMarka;


}
