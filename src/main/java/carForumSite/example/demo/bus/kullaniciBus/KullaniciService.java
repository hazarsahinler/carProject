package carForumSite.example.demo.bus.kullaniciBus;

import carForumSite.example.demo.entity.Kullanici;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.Date;

public interface KullaniciService {
    JSONObject kullaniciKayit(String kullaniciAdi, String kullaniciSoyadi,
                              String kullaniciCinsiyet, String kullaniciEposta,
                              String kullaniciSifre, String kullaniciArac,
                              String kullaniciSehir, Date kullaniciDogumTarihi,
                              String kullaniciMeslek
    );

    JSONObject kullaniciGiris(String kullaniciEposta, String kullaniciSifre);

    JSONArray kullaniciKayitlar(String kullaniciAdi, String kullaniciSoyadi,
                                String kullaniciCinsiyet, String kullaniciEposta,
                                String kullaniciSehir, String kullaniciMeslek);

    JSONObject kullaniciBilgi(Integer kullaniciId);

    JSONObject kullaniciGuncelle(Integer kullaniciId, String kullaniciAdi, String kullaniciSoyadi,
                                 String kullaniciEposta, String kullaniciArac,
                                 String kullaniciSehir, String kullaniciMeslek
    );
    JSONObject kullaniciSifreDegistir(Integer kullaniciId,String kullaniciSifre,String kullaniciYeniSifre);
    JSONObject kullaniciYorumSayisi(Integer kullaniciId);
    JSONArray getAllKullanici();
    JSONObject kullaniciSil(Integer kullaniciId);;
}
