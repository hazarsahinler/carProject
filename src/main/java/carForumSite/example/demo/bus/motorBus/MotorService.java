package carForumSite.example.demo.bus.motorBus;

import net.sf.json.JSONArray;
import org.springframework.stereotype.Repository;


public interface MotorService {
    JSONArray getMotorlar(Integer modelId);
}
