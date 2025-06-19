package carForumSite.example.demo.dao;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.hibernate.SessionFactory;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;

import java.util.List;

public class BaseDAO {
    private final SessionFactory sessionFactory;

    public BaseDAO(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }


    public <T> T getObjectById(Class<T> clazz, Integer id) {
        return sessionFactory.getCurrentSession().get(clazz, id);
    }


    public <T> List<T> getObjectsByParam(Class<T> clazz, String columnName, Object param) {
        try {
            HibernateCriteriaBuilder builder = sessionFactory.getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<T> criteria = builder.createQuery(clazz);
            Root root = criteria.from(clazz);
            criteria.select(root);
            criteria.where(builder.equal(root.get(columnName), param));

            return (List<T>) sessionFactory.getCurrentSession().createQuery(criteria).getResultList();
        } catch (Exception ex) {
            return null;
        }
    }

    public <T> List<T> getObjectsByParam(Class<T> clazz, String[] columnName, Object[] param) {
        try {
            HibernateCriteriaBuilder builder = sessionFactory.getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<T> criteria = builder.createQuery(clazz);
            Root root = criteria.from(clazz);
            criteria.select(root);
            for (int i = 0; i < columnName.length; i++) {
                criteria.where(builder.equal(root.get(columnName[i]), param[i]));
            }

            return (List<T>) sessionFactory.getCurrentSession().createQuery(criteria).getResultList();
        } catch (Exception ex) {
            return null;
        }
    }

    public <T> void updateObject(Class<T> clazz) {
        sessionFactory.getCurrentSession().update(clazz);
    }

    public <T> void deleteObject(T object) {
        sessionFactory.getCurrentSession().delete(object);
    }

    public <T> void deleteObjectById(Class<T> clazz, Integer id) {
        sessionFactory.getCurrentSession().delete(getObjectById(clazz, id));
    }

    public <T> void saveOrUpdate(T object) {
        sessionFactory.getCurrentSession().saveOrUpdate(object);
    }

}
