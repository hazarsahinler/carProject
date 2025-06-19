package carForumSite.example.demo.bus.modelBus;

import carForumSite.example.demo.dao.ModelDAO;
import net.sf.json.JSONArray;
import org.springframework.stereotype.Service;

@Service
public class ModelServiceImpl implements ModelService {
    private final ModelDAO modelDAO;

    public ModelServiceImpl(ModelDAO modelDAO) {
        this.modelDAO = modelDAO;
    }

    @Override
    public JSONArray getModeller(Integer arabaId) {
        JSONArray respArray = modelDAO.getModeller(arabaId);
        return respArray;
    }
}
