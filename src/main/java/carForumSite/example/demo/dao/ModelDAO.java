package carForumSite.example.demo.dao;

import carForumSite.example.demo.entity.Araba;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ModelDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    private final ArabaDAO arabaDAO;


    public ModelDAO(SessionFactory sessionFactory, ArabaDAO arabaDAO) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
        this.arabaDAO = arabaDAO;
    }
    public JSONArray getModeller(Integer arabaId) {
        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map( ");
        hql.append(" m.modelId as modelId, m.modelIsmi as modelIsmi)");
        hql.append(" FROM Model m ");
        hql.append("WHERE m.araba.arabaId = :arabaId");

        Query query=sessionFactory.getCurrentSession().createQuery(hql.toString());
        query.setParameter("arabaId", arabaId);
        JSONArray jsonArray = JSONArray.fromObject(query.list());
        return jsonArray;

    }
}
