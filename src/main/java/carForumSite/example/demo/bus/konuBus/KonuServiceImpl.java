package carForumSite.example.demo.bus.konuBus;

import carForumSite.example.demo.Util.Utilty;
import carForumSite.example.demo.dao.*;
import carForumSite.example.demo.entity.*;
import jakarta.transaction.Transactional;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class KonuServiceImpl implements KonuService {

    private final KullaniciDAO kullaniciDAO;
    private final MotorDAO motorDAO;
    private final Utilty utilty;
    private final ModelDAO modelDAO;
    private final KonuDAO konuDAO;
    private final YorumDAO yorumDAO;

    public KonuServiceImpl(KullaniciDAO kullaniciDAO, MotorDAO motorDAO, Utilty utilty, ModelDAO modelDAO, KonuDAO konuDAO, YorumDAO yorumDAO) {
        this.kullaniciDAO = kullaniciDAO;
        this.motorDAO = motorDAO;
        this.utilty = utilty;
        this.modelDAO = modelDAO;
        this.konuDAO = konuDAO;
        this.yorumDAO = yorumDAO;
    }

    @Override
    public JSONObject konuEkle(String konuBaslik,String konuIcerigi, Integer kullaniciId, Integer motorId, Integer modelId) {
        JSONObject jsonObject = new JSONObject();
        Konu konu = new Konu();
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciId", kullaniciId);
        Kullanici kullanici = kullaniciList.get(0);
        List<Model> modelList = modelDAO.getObjectsByParam(Model.class, "modelId", modelId);
        Model model = modelList.get(0);
        List<Motor> motorList = motorDAO.getObjectsByParam(Motor.class, "motorId", motorId);
        Motor motor = new Motor();
        for (Motor motor1 : motorList) {
            if (motor1.getMotorId() == motorId) {
                motor = motor1;
            }
        }


        konu.setKonuBaslik(konuBaslik);
        konu.setKonuIcerigi(konuIcerigi);
        konu.setKullanici(kullanici);
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDateTime now = LocalDateTime.ofInstant(Instant.now(), zoneId);
        konu.setKonuAcilisTarih(now);


        konu.setMotor(motor);
        konuDAO.saveOrUpdate(konu);
        jsonObject.put("succsess", true);
        jsonObject.put("message", "Konunuz başarıyla oluşturuldu.");
        return jsonObject;


    }

    @Override
    public JSONArray getKonular(Integer motorId) {
        JSONArray jsonArray = konuDAO.getKonular(motorId);
        return jsonArray;
    }

    @Override
    public JSONObject detay(Integer konuId) {
        JSONObject jsonObject = konuDAO.getDetay(konuId);
        return jsonObject;
    }

    @Override
    public JSONArray getKonuByKullaniciId(Integer kullaniciId) {
        JSONArray jsonArray = konuDAO.getKonuByKullaniciId(kullaniciId);
        return jsonArray;
    }

    @Override
    @Transactional
    public JSONObject konuSil(Integer konuId) {
        Konu konu = konuDAO.getObjectById(Konu.class, konuId);
        JSONObject jsonObject = new JSONObject();
        List<Yorum> yorumList = yorumDAO.getObjectsByParam(Yorum.class,"konu",konu);
        for (Yorum yorum : yorumList) {
            yorumDAO.deleteObject(yorum);
        }
        konuDAO.deleteObject(konu);

        jsonObject.put("succsess", true);
        jsonObject.put("message","konu basariyla silindi");
        return jsonObject;
    }

    @Override
    public JSONArray konuSearch(String sorgu) {
        JSONArray jsonArray = konuDAO.getKonuByModel(sorgu);
        return jsonArray;
    }

    @Override
    public JSONArray getAllKonu() {
        JSONArray jsonArray = konuDAO.getAllKonu();
        return jsonArray;
    }

}
