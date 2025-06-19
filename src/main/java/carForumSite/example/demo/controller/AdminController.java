package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.kullaniciBus.KullaniciService;
import io.swagger.v3.oas.models.security.SecurityScheme;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final KullaniciService kullaniciService;

    public AdminController(KullaniciService kullaniciService) {
        this.kullaniciService = kullaniciService;
    }
    @RequestMapping("/giris")
    public void adminGiris(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciEposta = request.getParameter("kullaniciEposta");
        String kullaniciSifre = request.getParameter("kullaniciSifre");
        JSONObject jsonObject = kullaniciService.kullaniciGiris(kullaniciEposta, kullaniciSifre);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }
    }
    @RequestMapping("/kullanici/bilgi")
    public void adminKullaniciBilgi(HttpServletResponse response, HttpServletRequest request) throws IOException {
        JSONArray respObj = kullaniciService.getAllKullanici();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (respObj != null) {
            response.getWriter().write(respObj.toString());
        }
    }
    @RequestMapping("/kullanici/sil")
    public void adminKullaniciSil(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        JSONObject jsonObject = kullaniciService.kullaniciSil(Integer.parseInt(kullaniciId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (jsonObject != null) {
            response.getWriter().write(jsonObject.toString());
        }
    }

}
