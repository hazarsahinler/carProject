package carForumSite.example.demo.dao;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
public class KullaniciDAO extends BaseDAO {
    private final SessionFactory sessionFactory;


    public KullaniciDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public JSONArray getByParam(String kullaniciAdi, String kullaniciSoyadi,
                                String kullaniciCinsiyet, String kullaniciEposta,
                                String kullaniciSehir, String  kullaniciMeslek) {

        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map( ");
        hql.append(" h.kullaniciEposta as kullaniciEposta,");
        hql.append(" h.kullaniciAdi || ' ' || h.kullaniciSoyadi as kullaniciAd, ");
        hql.append(" h.kullaniciCinsiyet as kullaniciCinsiyet, ");
        hql.append(" h.kullaniciSehir as kullaniciSehir, ");
        hql.append(" h.kullaniciMeslek as kullaniciMeslek) ");
        hql.append(" FROM Kullanici h ");
        hql.append(" WHERE (1=1) ");

        if (kullaniciAdi != null && !kullaniciAdi.isEmpty()) {
            hql.append("AND lower(h.kullaniciAdi) like :kullaniciAdi ");
        }
        if (kullaniciSoyadi != null && !kullaniciSoyadi.isEmpty()) {
            hql.append("AND lower(h.kullaniciSoyadi) like :kullaniciSoyadi ");
        }
        if (kullaniciCinsiyet != null && !kullaniciCinsiyet.isEmpty()) {
            hql.append("AND lower(h.kullaniciCinsiyet) like :kullaniciCinsiyet ");
        }
        if (kullaniciEposta != null && !kullaniciEposta.isEmpty()) {
            hql.append("AND lower(h.kullaniciEposta) like :kullaniciEposta ");
        }
        if (kullaniciSehir != null && !kullaniciSehir.isEmpty()) {
            hql.append("AND lower(h.kullaniciSehir) like :kullaniciSehir ");
        }
        if (kullaniciMeslek != null && !kullaniciMeslek.isEmpty()) {
            hql.append("AND lower(h.kullaniciMeslek) like :kullaniciMeslek ");
        }


        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        if (kullaniciAdi != null && !kullaniciAdi.isEmpty()) {
            query.setParameter("kullaniciAdi", "%" + kullaniciAdi.toLowerCase() + "%");
        }
        if (kullaniciSoyadi != null && !kullaniciSoyadi.isEmpty()) {
            query.setParameter("kullaniciSoyadi", "%" + kullaniciSoyadi.toLowerCase() + "%");
        }
        if (kullaniciEposta != null && !kullaniciEposta.isEmpty()) {
            query.setParameter("kullaniciEposta", "%" + kullaniciEposta.toLowerCase() + "%");
        }
        if (kullaniciSehir != null && !kullaniciSehir.isEmpty()) {
            query.setParameter("kullaniciSehir", "%" + kullaniciSehir.toLowerCase() + "%");
        }
        if (kullaniciMeslek != null && !kullaniciMeslek.isEmpty()) {
            query.setParameter("kullaniciMeslek", "%" + kullaniciMeslek.toLowerCase() + "%");
        }
        if (kullaniciCinsiyet != null && !kullaniciCinsiyet.isEmpty()) {
            query.setParameter("kullaniciCinsiyet", "%" + kullaniciCinsiyet.toLowerCase() + "%");
        }
        JSONArray jsonArray = JSONArray.fromObject(query.list());
        return jsonArray;


    }
    public JSONObject getKullaniciBilgi(Integer kullaniciId) {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map( ");
        hql.append(" k.kullaniciEposta as kullaniciEposta,"); // Entity'deki alan adı: kullaniciEposta
        hql.append(" k.kullaniciAdi as kullaniciAdi, "); // Ayrı ayrı alıp frontend'de birleştirmek daha esnek olabilir
        hql.append(" k.kullaniciSoyadi as kullaniciSoyadi, ");
        hql.append(" k.kullaniciCinsiyet as kullaniciCinsiyet, ");
        hql.append(" k.kullaniciSehir as kullaniciSehir, ");
        hql.append(" k.kullaniciMeslek as kullaniciMeslek, ");
        hql.append(" k.kullaniciArac as kullaniciArac, ");
        hql.append(" k.kullaniciDogumTarihi as kullaniciDogumTarihi) "); // Orijinal Date objesini alalım
        hql.append(" FROM Kullanici k "); // Entity adı: Kullanici
        hql.append(" WHERE k.kullaniciId = :kullaniciId ");
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());

        if(kullaniciId != null) {
            query.setParameter("kullaniciId", kullaniciId);
        }
        List<Map<String, Object>> results = query.list();

        if (results == null || results.isEmpty()) {
            return new JSONObject().element("message", "Kullanıcı bulunamadı");
        }


        Map<String, Object> userMap = results.get(0);


        Object dogumTarihiObj = userMap.get("kullaniciDogumTarihi");
        if (dogumTarihiObj != null) {
            if (dogumTarihiObj instanceof Date) {
                SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
                String formattedDate = sdf.format((Date) dogumTarihiObj);
                userMap.put("kullaniciDogumTarihi", formattedDate); // Aynı key ile formatlanmış string'i koy
            } else if (dogumTarihiObj instanceof Long) { // Eğer timestamp olarak geliyorsa
                SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
                String formattedDate = sdf.format(new Date((Long) dogumTarihiObj));
                userMap.put("kullaniciDogumTarihi", formattedDate);
            } else {
                // Beklenmedik bir tipse, string'e çevir veya null ata
                userMap.put("kullaniciDogumTarihi", dogumTarihiObj.toString());
                // Ya da null olarak ayarlayabilirsiniz: userMap.put("kullaniciDogumTarihi", null);
            }
        } else {
            userMap.put("kullaniciDogumTarihi", null); // Eğer tarih null ise, JSON'a da null gitsin
        }

        JSONObject jsonObject = JSONObject.fromObject(userMap);
        return jsonObject;

    }
    /*
    admin için kullanicilari çeken repo
     */
    public JSONArray getAllKullanici() {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map( ");
        hql.append(" k.kullaniciId as kullaniciId,");
        hql.append(" k.kullaniciEposta as kullaniciEposta,");
        hql.append(" k.kullaniciAdi as kullaniciAdi, ");
        hql.append(" k.kullaniciSoyadi as kullaniciSoyadi, ");
        hql.append(" k.kullaniciCinsiyet as kullaniciCinsiyet, ");
        hql.append(" k.kullaniciSehir as kullaniciSehir, ");
        hql.append(" k.kullaniciMeslek as kullaniciMeslek, ");
        hql.append(" k.kullaniciArac as kullaniciArac, ");
        hql.append(" k.kullaniciDogumTarihi as kullaniciDogumTarihi) ");
        hql.append(" FROM Kullanici k ");

        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());
        List<Map<String, Object>> results = query.list();

        // DÖNGÜ İLE TÜM LİSTEYİ GEZEREK FORMATLAMA YAPILMALI
        SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
        for (Map<String, Object> userMap : results) {
            Object dogumTarihiObj = userMap.get("kullaniciDogumTarihi");
            if (dogumTarihiObj != null && dogumTarihiObj instanceof Date) {
                userMap.put("kullaniciDogumTarihi", sdf.format((Date) dogumTarihiObj));
            } else {
                userMap.put("kullaniciDogumTarihi", null); // Formatlanamıyorsa null yap
            }
        }

        // FORMATLANMIŞ LİSTE JSON'A ÇEVRİLMELİ
        return JSONArray.fromObject(results);
    }


}
