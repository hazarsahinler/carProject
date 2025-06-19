package carForumSite.example.demo.bus.motorBus;

import carForumSite.example.demo.dao.MotorDAO;
import net.sf.json.JSONArray;
import org.springframework.stereotype.Service;

@Service
public class MotorServiceImpl implements MotorService {

    private final MotorDAO motorDAO;

    public MotorServiceImpl(MotorDAO motorDAO) {
        this.motorDAO = motorDAO;
    }

    @Override
    public JSONArray getMotorlar(Integer modelId) {
        JSONArray jsonArray = motorDAO.getMotorlar(modelId);
        return jsonArray;
    }
}
