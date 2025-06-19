package carForumSite.example.demo.dao;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.List;
import java.util.Map;

@Repository
public class KonuDAO extends BaseDAO{
    private final SessionFactory sessionFactory;
    public KonuDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
    public JSONArray getAllKonu(){
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" k.konuId as konuId, k.konuBaslik as konuBasligi,");
        hql.append(" k.kullanici.kullaniciAdi || ' ' || k.kullanici.kullaniciSoyadi as konuyuAcan,");
        hql.append(" k.konuIcerigi as konuIcerigi,");
        hql.append(" k.kullanici.kullaniciArac as konuyuAcanınAracı,");
        hql.append(" k.konuAcilisTarih as konuAcilisTarihi)");
        hql.append(" FROM Konu k ");

        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        List<Map<String, Object>> resultList = query.list();

        // Tarih formatlayıcısını tanımlayın
        // Eğer k.konuAcilisTarih entity'de LocalDateTime ise:
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        // Eğer k.konuAcilisTarih entity'de java.util.Date ise:
        // SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            Object tarihObj = map.get("konuAcilisTarihi");
            if (tarihObj != null) {
                if (tarihObj instanceof LocalDateTime) { // Veya java.util.Date
                    LocalDateTime ldt = (LocalDateTime) tarihObj;
                    map.put("konuAcilisTarihi", ldt.format(formatter));
                } else if (tarihObj instanceof java.util.Date) {
                    java.util.Date date = (java.util.Date) tarihObj;
                    map.put("konuAcilisTarihi", formatter.format((TemporalAccessor) date));
                }
            }
        }
        JSONArray jsonArray = JSONArray.fromObject(resultList);

        return jsonArray;
    }
    public JSONArray getKonular(Integer motorId){
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" k.konuId as konuId, k.konuBaslik as konuBasligi,");
        hql.append(" k.kullanici.kullaniciAdi || ' ' || k.kullanici.kullaniciSoyadi as konuyuAcan,");
        hql.append(" k.konuIcerigi as konuIcerigi,");
        hql.append(" k.kullanici.kullaniciArac as konuyuAcanınAracı,");
        hql.append(" k.konuAcilisTarih as konuAcilisTarihi)");
        hql.append(" FROM Konu k ");
        hql.append(" WHERE (1=1) ");
        if (motorId != null) {
            hql.append(" AND k.motor.motorId=:motorId ");
        }
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        if(motorId != null) {
            query.setParameter("motorId", motorId);
        }
        List<Map<String, Object>> resultList = query.list();

        // Tarih formatlayıcısını tanımlayın
        // Eğer k.konuAcilisTarih entity'de LocalDateTime ise:
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        // Eğer k.konuAcilisTarih entity'de java.util.Date ise:
        // SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            Object tarihObj = map.get("konuAcilisTarihi");
            if (tarihObj != null) {
                if (tarihObj instanceof LocalDateTime) { // Veya java.util.Date
                    LocalDateTime ldt = (LocalDateTime) tarihObj;
                    map.put("konuAcilisTarihi", ldt.format(formatter));
                } else if (tarihObj instanceof java.util.Date) {
                    java.util.Date date = (java.util.Date) tarihObj;
                    map.put("konuAcilisTarihi", formatter.format((TemporalAccessor) date));
                }
            }
        }
        JSONArray jsonArray = JSONArray.fromObject(resultList);

        return jsonArray;
    }

    public JSONObject getDetay(Integer konuId) {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" k.konuId as konuId, k.konuBaslik as konuBasligi,");
        hql.append(" k.konuIcerigi as konuIcerik,");
        hql.append(" k.kullanici.kullaniciId as konuyuAcanKullaniciId, k.kullanici.kullaniciAdi || ' ' || k.kullanici.kullaniciSoyadi as konuyuAcan,");
        hql.append(" k.kullanici.kullaniciArac as konuyuAcanınAracı,");
        hql.append(" k.motor.motorIsmi as motorIsmi,");
        hql.append(" k.motor.model.modelIsmi as modelIsmi,");
        hql.append(" k.motor.model.araba.arabaMarka as arabaMarka,");
        hql.append(" k.konuAcilisTarih as konuAcilisTarihi)");
        hql.append(" FROM Konu k ");
        hql.append(" WHERE (1=1) ");
        if (konuId != null) {
            hql.append(" AND k.konuId=:konuId ");
        }
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        if (konuId != null) {
            query.setParameter("konuId", konuId);
        }
        List<Map<String, Object>> resultList = query.list();

        // Tarih formatlayıcısını tanımlayın
        // Eğer k.konuAcilisTarih entity'de LocalDateTime ise:
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        // Eğer k.konuAcilisTarih entity'de java.util.Date ise:
        // SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            Object tarihObj = map.get("konuAcilisTarihi");
            if (tarihObj != null) {
                if (tarihObj instanceof LocalDateTime) { // Veya java.util.Date
                    LocalDateTime ldt = (LocalDateTime) tarihObj;
                    map.put("konuAcilisTarihi", ldt.format(formatter));
                } else if (tarihObj instanceof java.util.Date) {
                    java.util.Date date = (java.util.Date) tarihObj;
                    map.put("konuAcilisTarihi", formatter.format((TemporalAccessor) date));
                }
            }
        }
        JSONArray jsonArray = JSONArray.fromObject(resultList);
        JSONObject jsonObject = jsonArray.getJSONObject(0);

        return jsonObject;
    }
    public JSONArray getKonuByKullaniciId(Integer kullaniciId){
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" k.konuId as konuId, k.konuBaslik as konuBasligi,");
        hql.append(" k.konuIcerigi as konuIcerigi,");
        hql.append(" k.kullanici.kullaniciAdi || ' ' || k.kullanici.kullaniciSoyadi as konuyuAcan,");
        hql.append(" k.motor.motorIsmi as motorIsmi,");
        hql.append(" k.motor.model.modelIsmi as modelIsmi,");
        hql.append(" k.motor.model.araba.arabaMarka as arabaMarka,");
        hql.append(" k.konuAcilisTarih as konuAcilisTarihi)");
        hql.append(" FROM Konu k ");
        hql.append(" WHERE (1=1) ");
        if (kullaniciId != null) {
            hql.append(" AND k.kullanici.kullaniciId=:kullaniciId ");
        }
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        if(kullaniciId != null) {
            query.setParameter("kullaniciId", kullaniciId);
        }
        List<Map<String, Object>> resultList = query.list();

        // Tarih formatlayıcısını tanımlayın
        // Eğer k.konuAcilisTarih entity'de LocalDateTime ise:
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        // Eğer k.konuAcilisTarih entity'de java.util.Date ise:
        // SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            Object tarihObj = map.get("konuAcilisTarihi");
            if (tarihObj != null) {
                if (tarihObj instanceof LocalDateTime) { // Veya java.util.Date
                    LocalDateTime ldt = (LocalDateTime) tarihObj;
                    map.put("konuAcilisTarihi", ldt.format(formatter));
                } else if (tarihObj instanceof java.util.Date) {
                    java.util.Date date = (java.util.Date) tarihObj;
                    map.put("konuAcilisTarihi", formatter.format((TemporalAccessor) date));
                }
            }
        }
        JSONArray jsonArray = JSONArray.fromObject(resultList);

        return jsonArray;
    }
    public JSONArray getKonuByModel(String sorgu) {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" k.konuId as konuId, k.konuBaslik as konuBasligi,");
        hql.append(" CONCAT(k.motor.model.araba.arabaMarka, ' ', k.motor.model.modelIsmi , ' ', k.motor.motorIsmi) as aracBilgisi)");
        hql.append(" FROM Konu k ");
        hql.append(" WHERE lower(k.konuBaslik) LIKE :sorgu ");
        hql.append(" OR lower(k.motor.model.modelIsmi) LIKE :sorgu ");
        hql.append(" OR lower(k.motor.model.araba.arabaMarka) LIKE :sorgu ");



        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        query.setParameter("sorgu", "%" + sorgu.toLowerCase() + "%");
        List<Map<String, Object>> resultList = query.list();

        // Eski net.sf.json.JSONArray yerine modern bir JSON kütüphanesi (örn. Jackson veya Gson) kullanmanız önerilir.
        // Ancak mevcut yapınızda bu çalışıyorsa şimdilik değiştirmeyebilirsiniz.
        JSONArray jsonArray = JSONArray.fromObject(resultList);

        return jsonArray;
    }

}
