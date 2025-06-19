package carForumSite.example.demo.bus.konuBus;

import carForumSite.example.demo.entity.Konu;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.util.Date;

public interface KonuService {
    JSONObject konuEkle(String konuBaslik,String konuIcerigi, Integer kullaniciId,Integer motorId,Integer modelId);
    JSONArray getKonular(Integer motorId);
    JSONObject detay(Integer konuId);
    JSONArray getKonuByKullaniciId(Integer kullaniciId);
    JSONObject konuSil(Integer konuId);
    JSONArray konuSearch(String sorgu);
    JSONArray getAllKonu();
}
