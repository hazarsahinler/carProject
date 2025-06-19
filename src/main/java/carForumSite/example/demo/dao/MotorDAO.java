package carForumSite.example.demo.dao;

import carForumSite.example.demo.entity.Model;
import carForumSite.example.demo.entity.Motor;
import io.swagger.v3.core.util.Json;
import net.sf.json.JSONArray;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MotorDAO extends BaseDAO{
    private final SessionFactory sessionFactory;
    private final ModelDAO modelDAO;

    public MotorDAO(SessionFactory sessionFactory, ModelDAO modelDAO) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
        this.modelDAO = modelDAO;
    }
    public JSONArray getMotorlar(Integer modelId){


        StringBuilder hql = new StringBuilder();
        hql.append(" SELECT new map(");
        hql.append(" m.motorId as motorId, m.motorIsmi as motorIsmi)");
        hql.append(" From Motor m");
        hql.append(" Where m.model.modelId = :modelId");
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());
        query.setParameter("modelId", modelId);
        JSONArray jsonArray = JSONArray.fromObject(query.list());
        return jsonArray;
    }

}
