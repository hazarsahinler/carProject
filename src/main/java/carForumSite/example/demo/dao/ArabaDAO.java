package carForumSite.example.demo.dao;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class ArabaDAO extends BaseDAO {

    private final SessionFactory sessionFactory;

    public ArabaDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
    public JSONArray getArabalar() {
        StringBuilder hql = new StringBuilder();
        hql.append("Select new map (a.arabaId as arabaId,a.arabaMarka as arabaMarka) from Araba a");
        Query query = sessionFactory.getCurrentSession().createQuery(hql.toString());
        return JSONArray.fromObject(query.list());
    }



}
