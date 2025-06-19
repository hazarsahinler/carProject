package carForumSite.example.demo.controller;

import carForumSite.example.demo.Util.Utilty;
import carForumSite.example.demo.bus.kullaniciBus.KullaniciService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class KullaniciController {
    private final KullaniciService kullaniciService;
    private final HttpServletResponse httpServletResponse;
    private final HttpServletRequest httpServletRequest;
    private final Utilty utils;


    public KullaniciController(KullaniciService kullaniciService, HttpServletResponse httpServletResponse, HttpServletRequest httpServletRequest, Utilty utils) {
        this.kullaniciService = kullaniciService;
        this.httpServletResponse = httpServletResponse;
        this.httpServletRequest = httpServletRequest;
        this.utils = utils;
    }

    @RequestMapping("/kullanici/kayit")
    public void kullaniciKayit(HttpServletResponse response, HttpServletRequest request) throws IOException {

        String kullaniciAdi = request.getParameter("kullaniciAdi");
        String kullaniciSoyadi = request.getParameter("kullaniciSoyadi");
        String kullaniciCinsiyet = request.getParameter("kullaniciCinsiyet");
        String kullaniciEposta = request.getParameter("kullaniciEposta");
        String kullaniciSifre = request.getParameter("kullaniciSifre");
        String kullaniciArac = request.getParameter("kullaniciArac");
        String kullaniciSehir = request.getParameter("kullaniciSehir");

        Date kullaniciDogumTarih = utils.parseDate(request.getParameter("kullaniciDogumTarih"));

        String kullaniciMeslek = request.getParameter("kullaniciMeslek");

        JSONObject jsonObject = kullaniciService.kullaniciKayit(kullaniciAdi, kullaniciSoyadi, kullaniciCinsiyet,
                kullaniciEposta, kullaniciSifre, kullaniciArac,
                kullaniciSehir, kullaniciDogumTarih, kullaniciMeslek);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }


    }

    @RequestMapping("/kullanici/giris")
    public void kullaniciGiris(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciEposta = request.getParameter("kullaniciEposta");
        String kullaniciSifre = request.getParameter("kullaniciSifre");
        JSONObject jsonObject = kullaniciService.kullaniciGiris(kullaniciEposta, kullaniciSifre);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }


    }

    @RequestMapping("/kullanici/kayitlar")
    public void kayitlar(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciAdi = request.getParameter("kullaniciAdi");
        String kullaniciSoyadi = request.getParameter("kullaniciSoyadi");
        String kullaniciCinsiyet = request.getParameter("kullaniciCinsiyet");
        String kullaniciEposta = request.getParameter("kullaniciEposta");
        String kullaniciSehir = request.getParameter("kullaniciSehir");
        String kullaniciMeslek = request.getParameter("kullaniciMeslek");

        JSONArray respArray = kullaniciService.kullaniciKayitlar(kullaniciAdi, kullaniciSoyadi, kullaniciCinsiyet, kullaniciEposta, kullaniciSehir, kullaniciMeslek);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (respArray != null && respArray.size() > 0) {
            response.getWriter().write(respArray.toString());

        } else {
            response.getWriter().write("no record found");
        }


    }

    @RequestMapping("/kullanici/bilgi")
    public void kullaniciBilgi(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        JSONObject respObj = kullaniciService.kullaniciBilgi(Integer.parseInt(kullaniciId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (respObj != null) {
            response.getWriter().write(respObj.toString());
        }
    }
    @RequestMapping("/kullanici/yorum/sayisi")
    public void kullaniciYorumSayisi(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        JSONObject jsonObject = kullaniciService.kullaniciYorumSayisi(Integer.parseInt(kullaniciId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }

    }

    @RequestMapping("/kullanici/bilgi/guncelle")
    public void kullaniciBilgiGuncelle(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        String kullaniciAdi = request.getParameter("kullaniciAdi");
        String kullaniciSoyadi = request.getParameter("kullaniciSoyadi");
        String kullaniciEposta = request.getParameter("kullaniciEposta");
        String kullaniciArac = request.getParameter("kullaniciArac");
        String kullaniciSehir = request.getParameter("kullaniciSehir");
        String kullaniciMeslek = request.getParameter("kullaniciMeslek");
        JSONObject jsonObject = kullaniciService.kullaniciGuncelle(Integer.parseInt(kullaniciId), kullaniciAdi,
                kullaniciSoyadi, kullaniciEposta, kullaniciArac, kullaniciSehir, kullaniciMeslek);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }
    }

    @RequestMapping("/kullanici/bilgi/sifreGuncelle")
    public void kullaniciSifreGuncelle(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        String kullaniciSifre = request.getParameter("kullaniciSifre");
        String kullaniciYeniSifre = request.getParameter("KullaniciYeniSifre");
        JSONObject jsonObject = kullaniciService.kullaniciSifreDegistir(Integer.parseInt(kullaniciId), kullaniciSifre, kullaniciYeniSifre);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }
    }

}
