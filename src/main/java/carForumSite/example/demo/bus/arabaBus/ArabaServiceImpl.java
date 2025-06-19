package carForumSite.example.demo.bus.arabaBus;

import carForumSite.example.demo.dao.ArabaDAO;
import net.sf.json.JSONArray;
import org.springframework.stereotype.Service;

@Service
public class ArabaServiceImpl implements ArabaService {
    private final ArabaDAO arabaDAO;

    public ArabaServiceImpl(ArabaDAO arabaDAO) {
        this.arabaDAO = arabaDAO;
    }


    @Override
    public JSONArray arabaKayitlar() {
        return arabaDAO.getArabalar();
    }
}
