package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.yorumBus.YorumService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class YorumController {
    private final YorumService yorumService;

    public YorumController(YorumService yorumService) {
        this.yorumService = yorumService;
    }

    @RequestMapping("/yorum/ekle")
    public void yorumEkle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorum = request.getParameter("yorum");
        String kullaniciId = request.getParameter("kullaniciId");
        String konuId = request.getParameter("konuId");

        JSONObject jsonObject = yorumService.yorumEkle(yorum, Integer.parseInt(kullaniciId), Integer.parseInt(konuId));
        response.setContentType("application/json");
        response.getWriter().write(jsonObject.toString());
    }
    @RequestMapping("/yorum/sil")
    public void yorumSil(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorumId = request.getParameter("yorumId");
        JSONObject jsonObject = yorumService.yorumSil(Integer.parseInt(yorumId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8"); // Bu şekilde tek satırda da olur.
        response.getWriter().write(jsonObject.toString());
    }

    @RequestMapping("/yorum/yorumlar")
    public void getYorumlar(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String konuId = request.getParameter("konuId");
        JSONArray jsonArray = yorumService.getYorumlar(Integer.parseInt(konuId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8"); // Bu şekilde tek satırda da olur.
        response.getWriter().write(jsonArray.toString());
    }
    @RequestMapping("/yorum/yorumlarim")
    public void getYorumlarByKullaniciId(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String kullaniciId = request.getParameter("kullaniciId");
        JSONArray jsonArray = yorumService.getYorumlarByKullaniciId(Integer.parseInt(kullaniciId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8"); // Bu şekilde tek satırda da olur.
        response.getWriter().write(jsonArray.toString());
    }


    @RequestMapping("/yorum/like/ekle")
    public void likeEkle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorumId = request.getParameter("yorumId");
        Integer likeSay = yorumService.yorumLikeEkle(Integer.parseInt(yorumId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(String.valueOf(likeSay));
    }

    @RequestMapping("/yorum/like/geriCek")
    public void likeGeriCek(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorumId = request.getParameter("yorumId");
        Integer likeSay = yorumService.yorumLikeSil(Integer.parseInt(yorumId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(String.valueOf(likeSay));
    }

    @RequestMapping("/yorum/dislike/ekle")
    public void dislikeEkle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorumId = request.getParameter("yorumId");
        Integer dislikeSay = yorumService.yorumDislikeEkle(Integer.parseInt(yorumId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(String.valueOf(dislikeSay));
    }

    @RequestMapping("/yorum/dislike/geriCek")
    public void dislikeGeriCek(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String yorumId = request.getParameter("yorumId");
        Integer dislikeSay = yorumService.yorumDislikeSil(Integer.parseInt(yorumId));
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(String.valueOf(dislikeSay));
    }

}
