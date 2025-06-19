package carForumSite.example.demo.Enum;


import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

public enum Role {
    Ziyaretci(0, "ROLE_ZIYARETCI"),
    Admin(1, "ROLE_ADMIN");

    private int role;
    private String authority;

    private Role(int role, String authority) {
        this.role = role;
        this.authority = authority;
    }

    public int getRole() {
        return role;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    public static Role fromRole(int role) {
        for (Role role1 : values()) {
            if (role1.getRole() == role) {
                return role1;
            }
        }
        throw new IllegalArgumentException("Unknown enum type " + role);
    }
}
