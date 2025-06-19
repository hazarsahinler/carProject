package carForumSite.example.demo.controller;

import carForumSite.example.demo.bus.motorBus.MotorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class MotorController {

    private final MotorService motorService;
    public MotorController(MotorService motorService) {
        this.motorService = motorService;
    }
    @RequestMapping("/motorlar")
    public void getMotorlar (HttpServletRequest request, HttpServletResponse response) throws IOException {
        String modelId = request.getParameter("model");

        JSONArray jsonArray = motorService.getMotorlar(Integer.parseInt(modelId));
        response.setContentType("application/json");
        response.getWriter().write(jsonArray.toString());

    }
}
