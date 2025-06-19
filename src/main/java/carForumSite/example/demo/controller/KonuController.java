package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.konuBus.KonuService;
import carForumSite.example.demo.entity.Konu;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class KonuController {
    private final KonuService konuService;

    public KonuController(KonuService konuService) {
        this.konuService = konuService;
    }

    @RequestMapping("/konu/ekle")
    public JSONObject konuEkle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String konuBaslik = request.getParameter("konuBaslik");
        String konuIcerigi = request.getParameter("konuIcerik");
        String kullaniciId = request.getParameter("kullaniciId");
        String MotorId = request.getParameter("Motor");
        String ModelId = request.getParameter("Model");

        JSONObject jsonObject = konuService.konuEkle(konuBaslik,konuIcerigi, Integer.parseInt(kullaniciId), Integer.parseInt(MotorId), Integer.parseInt(ModelId));
        return jsonObject;
    }

    @RequestMapping("/konu/konular")
    public void getKonular(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String motorId = request.getParameter("Motor");
        JSONArray jsonArray = konuService.getKonular(Integer.parseInt(motorId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonArray.toString());
    }

    @RequestMapping("/konu/detay")
    public void detay(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String konuId = request.getParameter("konuId");
        JSONObject jsonObject = konuService.detay(Integer.parseInt(konuId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonObject.toString());
    }

    @RequestMapping("/konu/konularim")
    public void getKonuByKullaniciId(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        JSONArray jsonArray = konuService.getKonuByKullaniciId(Integer.parseInt(kullaniciId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonArray.toString());
    }

    @RequestMapping("/konu/sil")
    public void konuSil(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String konuId = request.getParameter("konuId");
        JSONObject jsonObject = konuService.konuSil(Integer.parseInt(konuId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonObject.toString());
    }
    @RequestMapping("/konu/search")
    public void konuSearch(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String sorgu = request.getParameter("sorgu");
        JSONArray jsonArray = konuService.konuSearch(sorgu);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonArray.toString());
    }
    @RequestMapping("/konu/all")
    public void konuAll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        JSONArray jsonArray = konuService.getAllKonu();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonArray.toString());
    }
}
