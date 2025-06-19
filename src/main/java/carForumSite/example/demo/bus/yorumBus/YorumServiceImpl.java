package carForumSite.example.demo.bus.yorumBus;

import carForumSite.example.demo.dao.KonuDAO;
import carForumSite.example.demo.dao.KullaniciDAO;
import carForumSite.example.demo.dao.YorumDAO;
import carForumSite.example.demo.entity.Konu;
import carForumSite.example.demo.entity.Kullanici;
import carForumSite.example.demo.entity.Yorum;
import jakarta.transaction.Transactional;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class YorumServiceImpl implements YorumService {
    private final KullaniciDAO kullaniciDAO;
    private final KonuDAO konuDAO;
    private final YorumDAO yorumDAO;

    public YorumServiceImpl(KullaniciDAO kullaniciDAO, KonuDAO konuDAO, YorumDAO yorumDAO) {
        this.kullaniciDAO = kullaniciDAO;
        this.konuDAO = konuDAO;
        this.yorumDAO = yorumDAO;
    }

    @Override
    public JSONObject yorumEkle(String yorumText, Integer kullaniciId, Integer konuId) {
        JSONObject jsonObject = new JSONObject();
        Yorum yorum = new Yorum();
        Kullanici kullanici = kullaniciDAO.getObjectById(Kullanici.class, kullaniciId);
        Konu konu = konuDAO.getObjectById(Konu.class, konuId);
        yorum.setYorumText(yorumText);
        yorum.setKullanici(kullanici);
        yorum.setKonu(konu);
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDateTime now = LocalDateTime.ofInstant(Instant.now(), zoneId);
        yorum.setYorumYapilisTarihi(now);
        yorumDAO.saveOrUpdate(yorum);
        jsonObject.put("succsess", true);
        jsonObject.put("message", "Yorumunuz basariyla gönderildi.");
        return jsonObject;
    }

    @Override
    @Transactional
    public JSONObject yorumSil(Integer yorumId) {
        Yorum yorum = yorumDAO.getObjectById(Yorum.class, yorumId);
        yorumDAO.deleteObject(yorum);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("succsess", true);
        jsonObject.put("message","yorum başarıyla silindi");
        return jsonObject;
    }

    @Override
    public JSONArray getYorumlar(Integer konuId) {
        JSONArray jsonArray = yorumDAO.getYorumlar(konuId);
        return jsonArray;
    }

    @Override
    public JSONArray getYorumlarByKullaniciId(Integer kullaniciId) {
        JSONArray jsonArray = yorumDAO.getYorumlarByKullaniciId(kullaniciId);
        return jsonArray;
    }

    @Override
    @Transactional
    public Integer yorumLikeEkle(Integer yorumId) {
        Yorum yorum = yorumDAO.getObjectById(Yorum.class, yorumId);
        int yorumLikeSayi = yorum.getBegeniSayi();
        yorumLikeSayi++;
        yorum.setBegeniSayi(yorumLikeSayi);
        yorumDAO.saveOrUpdate(yorum);

        return yorum.getBegeniSayi();
    }

    @Override
    @Transactional
    public Integer yorumLikeSil(Integer yorumId) {
        Yorum yorum = yorumDAO.getObjectById(Yorum.class, yorumId);
        int yorumLikeSayi = yorum.getBegeniSayi();
        yorumLikeSayi = yorumLikeSayi - 1;
        yorum.setBegeniSayi(yorumLikeSayi);
        yorumDAO.saveOrUpdate(yorum);
        return yorum.getBegeniSayi();
    }

    @Override
    @Transactional
    public Integer yorumDislikeEkle(Integer yorumId) {
        Yorum yorum = yorumDAO.getObjectById(Yorum.class, yorumId);
        int yorumDislikeSay = yorum.getDislikeSayi();
        yorumDislikeSay = yorumDislikeSay + 1;
        yorum.setDislikeSayi(yorumDislikeSay);
        yorumDAO.saveOrUpdate(yorum);
        return yorum.getDislikeSayi();
    }

    @Override
    @Transactional
    public Integer yorumDislikeSil(Integer yorumId) {
        Yorum yorum = yorumDAO.getObjectById(Yorum.class, yorumId);
        int yorumDislikeSay = yorum.getDislikeSayi();
        yorumDislikeSay = yorumDislikeSay - 1;
        yorum.setDislikeSayi(yorumDislikeSay);
        yorumDAO.saveOrUpdate(yorum);
        return yorum.getDislikeSayi();
    }

}
