package carForumSite.example.demo.dao;

import carForumSite.example.demo.Enum.Role;
import carForumSite.example.demo.entity.Konu;
import carForumSite.example.demo.entity.Yorum;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.List;
import java.util.Map;

@Repository
public class YorumDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public YorumDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }


    public JSONArray getYorumlar(Integer konuId) {
        // HQL sorgusu değişmiyor, olduğu gibi kalabilir.
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" y.yorumId as yorumId,");
        hql.append(" y.kullanici.kullaniciId as yorumYapanKullaniciId,");
        hql.append(" y.kullanici.kullaniciAdi || ' ' || y.kullanici.kullaniciSoyadi as kullaniciBilgi,");
        hql.append(" y.kullanici.role as rol,");
        hql.append(" y.yorumText as yorumBilgi,");
        hql.append(" y.yorumYapilisTarihi as yorumYapilisTarihi,");
        hql.append(" y.begeniSayi as like,");
        hql.append(" y.dislikeSayi as dislike)");
        hql.append(" FROM Yorum y ");
        hql.append(" WHERE y.konu.konuId = :konuId ");
        hql.append(" ORDER BY y.yorumYapilisTarihi ASC");

        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());
        query.setParameter("konuId", konuId);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultList = query.list();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            Object rolObj = map.get("rol");
            String kullaniciRutbesi = "Üye"; // Varsayılan değer

            // --- İŞTE DÜZELTİLMİŞ VE DOĞRU MANTIK ---
            // Gelen nesnenin bir 'Role' nesnesi olup olmadığını kontrol ediyoruz.
            if (rolObj instanceof Role) {
                Role rol = (Role) rolObj; // Nesneyi kendi tipine çeviriyoruz (cast).

                // Artık enum sabitleri üzerinden güvenli bir şekilde switch yapabiliriz.
                // String karşılaştırması yok, tırnak işareti yok!
                switch (rol) {
                    case Admin:
                        kullaniciRutbesi = "Yönetici";
                        break;
                    case Ziyaretci:
                        kullaniciRutbesi = "Üye";
                        break;
                    // 'default' bloğuna gerek kalmayabilir ama iyi bir pratiktir.
                    default:
                        kullaniciRutbesi = "Üye";
                        break;
                }
            }

            // Belirlenen rütbeyi map'e ekliyoruz.
            map.put("kullaniciRutbesi", kullaniciRutbesi);

            // Tarih formatlama kodunuz olduğu gibi kalabilir.
            Object tarihObj = map.get("yorumYapilisTarihi");
            if (tarihObj != null) {
                String formatliTarih = null;
                if (tarihObj instanceof LocalDateTime) {
                    formatliTarih = ((LocalDateTime) tarihObj).format(formatter);
                } else if (tarihObj instanceof java.sql.Timestamp) {
                    formatliTarih = ((java.sql.Timestamp) tarihObj).toLocalDateTime().format(formatter);
                } else if (tarihObj instanceof java.util.Date) {
                    formatliTarih = ((java.util.Date) tarihObj).toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDateTime().format(formatter);
                }

                if (formatliTarih != null) {
                    map.put("yorumTarihiFormatli", formatliTarih);
                } else {
                    map.put("yorumTarihiFormatli", "Format Hatası");
                }
            } else {
                map.put("yorumTarihiFormatli", null);
            }
        }
        return JSONArray.fromObject(resultList);
    }
    public JSONArray getYorumlarByKullaniciId(Integer kullaniciId) { // Veya List<Map<String, Object>> dönüyorsa
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" y.yorumId as yorumId,");
        hql.append(" y.kullanici.kullaniciId as yorumYapanKullaniciId,");
        hql.append(" y.kullanici.kullaniciAdi || ' ' || y.kullanici.kullaniciSoyadi as kullaniciBilgi,");
        hql.append(" y.yorumText as yorumBilgi,");
        hql.append(" y.konu.konuId as konuId,");
        hql.append(" y.konu.konuBaslik as konuBaslik,");
        hql.append(" y.yorumYapilisTarihi as yorumYapilisTarihi,");
        hql.append(" y.begeniSayi as like,");
        hql.append(" y.dislikeSayi as dislike)");
        hql.append(" FROM Yorum y ");
        hql.append(" WHERE y.kullanici.kullaniciId = :kullaniciId ");
        hql.append(" ORDER BY y.yorumYapilisTarihi ASC");

        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());
        query.setParameter("kullaniciId", kullaniciId);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultList = query.list();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

        for (Map<String, Object> map : resultList) {
            // Kullanıcı Aracı Kontrolü:
            // Eğer y.kullanici.kullaniciArac null ise, frontend'de "Belirtilmemiş" görünmesi normaldir.
            // Veritabanınızda test kullanıcıları için bu alanın dolu olduğundan emin olun.
            // Örneğin:
            // if (map.get("kullaniciAraci") == null) {
            //     System.out.println("Yorum ID " + map.get("yorumId") + " için kullanıcı aracı null.");
            // }


            // Tarih Formatlama Kontrolü:
            Object tarihObj = map.get("yorumYapilisTarihi");
            if (tarihObj != null) {
                String formatliTarih = null;
                if (tarihObj instanceof LocalDateTime) {
                    formatliTarih = ((LocalDateTime) tarihObj).format(formatter);
                } else if (tarihObj instanceof java.sql.Timestamp) {
                    formatliTarih = ((java.sql.Timestamp) tarihObj).toLocalDateTime().format(formatter);
                } else if (tarihObj instanceof java.util.Date) {
                    formatliTarih = ((java.util.Date) tarihObj).toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDateTime().format(formatter);
                }
                // Diğer olası tarih tipleri (örn: java.sql.Date) için de kontrol ekleyebilirsiniz.

                if (formatliTarih != null) {
                    map.put("yorumTarihiFormatli", formatliTarih); // <-- BU ALAN ADIYLA GÖNDERİLİYOR
                } else {
                    // Eğer formatlama başarısız olursa veya tarihObj tanınmayan bir tipse, loglayın.
                    System.err.println("Yorum ID " + map.get("yorumId") + " için tarih formatlanamadı. Tarih objesi tipi: " + tarihObj.getClass().getName());
                    map.put("yorumTarihiFormatli", "Format Hatası"); // Veya null bırakın
                }
            } else {
                // Eğer yorumTarihi null ise, loglayın.
                System.out.println("Yorum ID " + map.get("yorumId") + " için yorum tarihi null.");
                map.put("yorumTarihiFormatli", null); // Frontend'de "Bilinmiyor" olacak
            }
        }
        return JSONArray.fromObject(resultList); // Eğer JSONArray dönüyorsanız
        // Veya direkt List<Map<String, Object>> dönüyorsanız: return resultList;
        // Controller'ınız bu listeyi JSON'a çevirecektir.
    }
}
