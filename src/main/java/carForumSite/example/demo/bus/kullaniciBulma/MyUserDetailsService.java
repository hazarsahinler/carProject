package carForumSite.example.demo.bus.kullaniciBulma;

import carForumSite.example.demo.dao.KullaniciDAO;
import carForumSite.example.demo.entity.Kullanici;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyUserDetailsService implements UserDetailsService {
    private final KullaniciDAO kullaniciDAO;

    public MyUserDetailsService(KullaniciDAO kullaniciDAO) {
        this.kullaniciDAO = kullaniciDAO;
    }

    @Override
    @Transactional
    public Kullanici loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // DAO metodunuzun kayıt bulamazsa BOŞ LİSTE döndürdüğünden emin olun, null değil.
        List<Kullanici> kullaniciList = kullaniciDAO.getObjectsByParam(Kullanici.class, "kullaniciEposta", usernameOrEmail);

        if (kullaniciList == null || kullaniciList.isEmpty()) {
            throw new UsernameNotFoundException("'" + usernameOrEmail + "' e-postasına sahip kullanıcı bulunamadı.");
        }
        // Kullanici sınıfınız UserDetails'i implemente ettiği için direkt cast edebilir veya döndürebilirsiniz.
        return kullaniciList.get(0);
    }
}
