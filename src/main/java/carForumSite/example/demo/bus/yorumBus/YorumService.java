package carForumSite.example.demo.bus.yorumBus;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public interface YorumService {
    JSONObject yorumEkle(String yorumText, Integer kullaniciId, Integer konuId);
    JSONObject yorumSil(Integer yorumId);
    JSONArray getYorumlar(Integer konuId);
    JSONArray getYorumlarByKullaniciId(Integer kullaniciId);
    Integer yorumLikeEkle(Integer yorumId);
    Integer yorumLikeSil(Integer yorumId);
    Integer yorumDislikeEkle(Integer yorumId);
    Integer yorumDislikeSil(Integer yorumId);
}
