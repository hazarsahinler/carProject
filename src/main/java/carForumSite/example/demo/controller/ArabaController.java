package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.arabaBus.ArabaService;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ArabaController {

    private final ArabaService arabaService;

    public ArabaController(ArabaService arabaService) {
        this.arabaService = arabaService;
    }

    @RequestMapping("/arabalar")
    public void getAllAraba(HttpServletResponse response) throws IOException {

        JSONArray respArray=arabaService.arabaKayitlar();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (respArray != null && respArray.size() > 0) {
            response.getWriter().write(respArray.toString());

        } else {
            response.getWriter().write("no record found");
        }

    }
}
