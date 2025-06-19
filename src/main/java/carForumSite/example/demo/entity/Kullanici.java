package carForumSite.example.demo.entity;

import carForumSite.example.demo.Enum.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "kullanici", schema = "forum")
@Data
public class Kullanici {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kullanici_id")
    private int kullaniciId;

    @Column(name = "kullanici_adi")
    private String kullaniciAdi;

    @Column(name = "kullanici_soyadi")
    private String kullaniciSoyadi;

    @Column(name="kullanici_cinsiyet")
    private String kullaniciCinsiyet;

    @Column(name = "kullanici_ePosta")
    private String kullaniciEposta;

    @Column(name = "kullanici_sifre")
    private String kullaniciSifre;

    @Column(name = "kullanici_arac")
    private String kullaniciArac;

    @Column(name="kullanici_sehir")
    private String kullaniciSehir;

    @Column(nullable = false, name = "kullanici_dogum_tarihi")
    private Date kullaniciDogumTarihi;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name="kullanici_meslek")
    private String kullaniciMeslek;
}
