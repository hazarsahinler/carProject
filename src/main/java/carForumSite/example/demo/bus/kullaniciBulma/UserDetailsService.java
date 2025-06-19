package carForumSite.example.demo.bus.kullaniciBulma;

import carForumSite.example.demo.entity.Kullanici;

public interface UserDetailsService {
    Kullanici loadUserByUsername(String usernameOrEmail);
}
