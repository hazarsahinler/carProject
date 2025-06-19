package carForumSite.example.demo.bus.kullaniciBus;

import carForumSite.example.demo.Enum.Role;
import carForumSite.example.demo.bus.jwt.JwtService;
import carForumSite.example.demo.dao.KullaniciDAO;
import carForumSite.example.demo.dao.YorumDAO;
import carForumSite.example.demo.entity.Kullanici;
import carForumSite.example.demo.entity.Yorum;
import jakarta.transaction.Transactional;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class KullaniciServiceImpl implements KullaniciService {

    private final KullaniciDAO kullaniciDAO;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final YorumDAO yorumDAO;

    public KullaniciServiceImpl(KullaniciDAO kullaniciDAO, JwtService jwtService, PasswordEncoder passwordEncoder, YorumDAO yorumDAO) {
        this.kullaniciDAO = kullaniciDAO;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.yorumDAO = yorumDAO;
    }

    // KullaniciServiceImpl.java içinde
    @Override
    public JSONObject kullaniciKayit(String kullaniciAdi, String kullaniciSoyadi,
                                     String kullaniciCinsiyet, String kullaniciEposta,
                                     String kullaniciSifre, String kullaniciArac,
                                     String kullaniciSehir, Date kullaniciDogumTarihi,
                                     String kullaniciMeslek) {
        JSONObject jsonObject = new JSONObject();
        try {
            List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciEposta", kullaniciEposta);
            if (kullaniciList != null && !kullaniciList.isEmpty()) { // null kontrolü eklendi
                jsonObject.put("succsess", false);
                jsonObject.put("message", "Bu E posta ile kayıtlı bir kullanıcı mevcut.");
                return jsonObject;
            }

            // Doğum tarihi null kontrolü (eğer utils.parseDate null dönebilirse)
            if (kullaniciDogumTarihi == null) {
                jsonObject.put("succsess", false);
                jsonObject.put("message", "Geçerli bir doğum tarihi giriniz.");
                return jsonObject;
            }

            Kullanici kullanici = new Kullanici();
            kullanici.setKullaniciAdi(kullaniciAdi);
            kullanici.setKullaniciSoyadi(kullaniciSoyadi);
            kullanici.setKullaniciCinsiyet(kullaniciCinsiyet);
            kullanici.setKullaniciArac(kullaniciArac);
            kullanici.setKullaniciSifre(passwordEncoder.encode(kullaniciSifre));
            kullanici.setKullaniciEposta(kullaniciEposta);
            kullanici.setKullaniciDogumTarihi(kullaniciDogumTarihi);
            kullanici.setKullaniciMeslek(kullaniciMeslek);
            kullanici.setKullaniciSehir(kullaniciSehir);
            kullanici.setRole(Role.Ziyaretci); // Rol ataması
            // kullanici.setYetki("Ziyaretci"); // Eğer ayrı bir yetki alanı varsa

            kullaniciDAO.saveOrUpdate(kullanici);

            jsonObject.put("succsess", true);
            jsonObject.put("message", "Kaydınız başarıyla oluşturuldu.");

        } catch (DataAccessException dae) { // Spring'in genel veritabanı erişim hatası
            // Loglama yapılabilir: log.error("Veritabanı hatası kullanıcı kaydında: ", dae);
            jsonObject.put("succsess", false);
            jsonObject.put("message", "Kayıt sırasında bir veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin.");
        } catch (Exception e) {
            // Diğer beklenmedik hatalar için
            // Loglama yapılabilir: log.error("Beklenmedik hata kullanıcı kaydında: ", e);
            jsonObject.put("succsess", false);
            jsonObject.put("message", "Kayıt sırasında beklenmedik bir hata oluştu.");
        }
        return jsonObject;
    }

    @Override
    public JSONObject kullaniciGiris(String kullaniciEposta, String kullaniciSifre) {
        JSONObject jsonObject = new JSONObject();


        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciEposta", kullaniciEposta);

        if (kullaniciList == null || kullaniciList.isEmpty()) {
            jsonObject.put("success", false);
            jsonObject.put("message", "Kullanıcı bulunamadı.");
            return jsonObject;
        }

        Kullanici kullanici = kullaniciList.get(0);



        if (!passwordEncoder.matches(kullaniciSifre, kullanici.getKullaniciSifre())) {
            jsonObject.put("success", false);
            jsonObject.put("message", "Şifre yanlış.");
            return jsonObject;
        }

        String token = jwtService.generateToken(kullanici.getKullaniciEposta());

        jsonObject.put("success", true);
        jsonObject.put("message", "Giriş başarılı.");
        jsonObject.put("token", token);
        jsonObject.put("rol", kullanici.getRole().toString());
        jsonObject.put("kullaniciId", kullanici.getKullaniciId());

        return jsonObject;
    }


    @Override
    public JSONArray kullaniciKayitlar(String kullaniciAdi, String kullaniciSoyadi,
                                       String kullaniciCinsiyet, String kullaniciEposta,
                                       String kullaniciSehir, String kullaniciMeslek) {
        JSONArray jsonArray = kullaniciDAO.getByParam(kullaniciAdi, kullaniciSoyadi,
                kullaniciCinsiyet, kullaniciEposta,
                kullaniciSehir, kullaniciMeslek);
        return jsonArray;
    }

    @Override
    public JSONObject kullaniciBilgi(Integer kullaniciId) {
        JSONObject jsonObject = kullaniciDAO.getKullaniciBilgi(kullaniciId);
        return jsonObject;
    }

    @Override
    @Transactional
    public JSONObject kullaniciGuncelle(Integer kullaniciId, String kullaniciAdi, String kullaniciSoyadi,
                                        String kullaniciEposta,
                                        String kullaniciArac, String kullaniciSehir,
                                        String kullaniciMeslek) {
        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class, kullaniciId);

        if (kullaniciAdi != null || !kullaniciAdi.isEmpty()) {
            kullanici.setKullaniciAdi(kullaniciAdi);
        }
        if (kullaniciSoyadi != null || !kullaniciSoyadi.isEmpty()) {
            kullanici.setKullaniciSoyadi(kullaniciSoyadi);
        }
        if (kullaniciEposta != null || !kullaniciEposta.isEmpty()) {
            kullanici.setKullaniciEposta(kullaniciEposta);
        }
        if (kullaniciMeslek != null || !kullaniciMeslek.isEmpty()) {
            kullanici.setKullaniciMeslek(kullaniciMeslek);
        }
        if (kullaniciSehir != null || !kullaniciSehir.isEmpty()) {
            kullanici.setKullaniciSehir(kullaniciSehir);
        }
        if (kullaniciArac != null || !kullaniciArac.isEmpty()) {
            kullanici.setKullaniciArac(kullaniciArac);
        }
        kullaniciDAO.saveOrUpdate(kullanici);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("succsess", true);
        jsonObject.put("message", "Bilgileriniz başarıyla güncellendi.");

        return jsonObject;
    }

    @Override
    @Transactional
    public JSONObject kullaniciSifreDegistir(Integer kullaniciId, String kullaniciSifre, String kullaniciYeniSifre) {
        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class, kullaniciId);
        JSONObject jsonObject = new JSONObject();
        String mevcutSifre = kullanici.getKullaniciSifre();
        if (passwordEncoder.matches( kullaniciSifre,mevcutSifre)) {
            kullanici.setKullaniciSifre(passwordEncoder.encode(kullaniciYeniSifre));
            jsonObject.put("succsess", true);
            jsonObject.put("message", "Sifreniz güncellendi.");
            kullaniciDAO.saveOrUpdate(kullanici);
        } else {
            jsonObject.put("succsess", false);
            jsonObject.put("message", "Mevcut sifreniz hatali");
        }
        return jsonObject;

    }

    @Override
    public JSONObject kullaniciYorumSayisi(Integer kullaniciId) {
        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class,kullaniciId);
        JSONObject jsonObject = new JSONObject();
        List<Yorum> yorumList = yorumDAO.getObjectsByParam(Yorum.class,"kullanici",kullanici);
        Integer sayi = yorumList.size();
        jsonObject.put("sayi", sayi);
        return jsonObject;
    }

    @Override
    public JSONArray getAllKullanici() {
        JSONArray jsonArray = kullaniciDAO.getAllKullanici();
        return jsonArray;
    }

    @Override
    @Transactional
    public JSONObject kullaniciSil(Integer kullaniciId) {
        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class, kullaniciId);
        JSONObject jsonObject = new JSONObject();

        if(kullanici.getRole()==Role.Admin){
            jsonObject.put("succsess", false);
            jsonObject.put("message", "Admini silemezsiniz!!");
            return jsonObject;
        }
        kullaniciDAO.deleteObject(kullanici);

        if(kullaniciDAO.getObjectById(Kullanici.class, kullaniciId)==null){
            jsonObject.put("succsess", true);
            jsonObject.put("message", "Bilgileriniz siliniz.");
        }else{
            jsonObject.put("succsess", false);
            jsonObject.put("message", "Bilgileriniz silinemedi.");
        }

        return jsonObject;

    }


}
