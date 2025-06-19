package carForumSite.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "yorum", schema = "forum")
@Data
public class Yorum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "yorum_id")
    private int yorumId;

    @Column(name = "yorum_text")
    private String yorumText;

    @Column(name = "like_sayi")
    private int begeniSayi = 0;

    @Column(name = "dislike_sayi")
    private int dislikeSayi = 0;

    @Column(name = "yorumYapilisTarihi")
    private LocalDateTime yorumYapilisTarihi;

    @ManyToOne
    @JoinColumn(name = "yorum_sahibi_id")
    private Kullanici kullanici;

    @ManyToOne
    @JoinColumn(name = "konu_id")
    private Konu konu;


}
