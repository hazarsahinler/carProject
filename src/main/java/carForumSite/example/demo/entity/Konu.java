package carForumSite.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "konu", schema = "forum")
@Data
public class Konu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "konu_id")
    private int konuId;

    @Column(name = "konu_baslik")
    private String konuBaslik;

    @Column(name="konu_icerigi")
    private String konuIcerigi;

    @ManyToOne
    @JoinColumn(name = "konu_sahibi_id")
    private Kullanici kullanici;

    @Column(name = "konu_acilis_tarih")
    private LocalDateTime konuAcilisTarih;

    @ManyToOne
    @JoinColumn(name = "motor_id")
    private Motor motor;


}
