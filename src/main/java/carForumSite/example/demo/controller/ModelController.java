package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.modelBus.ModelService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ModelController {
    private final ModelService modelService;

    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @RequestMapping("/modeller")
    public void getModeller(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String arabaId = request.getParameter("araba");
        JSONArray respArray = modelService.getModeller(Integer.parseInt(arabaId));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(respArray.toString());

    }
}
