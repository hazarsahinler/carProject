package carForumSite.example.demo.config;

import carForumSite.example.demo.filter.MyFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final MyFilter myFilter;

    public SecurityConfig(MyFilter myFilter) {
        this.myFilter = myFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(req -> req
                        // ====================================================================
                        // 1. HERKESE AÇIK ALANLAR (Kimlik Doğrulama GEREKTİRMEZ)
                        // ====================================================================
                        .requestMatchers("/", "/html/**", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                        .requestMatchers("/admin/**").permitAll() // Admin panelinin HTML/CSS/JS dosyaları
                        .requestMatchers("/api/kullanici/giris", "/api/kullanici/kayit").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/giris").permitAll()
                        // GET istekleri genellikle bilgi okumak içindir ve herkese açık olabilir
                        .requestMatchers(HttpMethod.GET, "/api/konu/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/yorum/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/arabalar", "/api/modeller", "/api/motorlar").permitAll()
                        // EKLENDİ: İlk sorundaki 403 hatasını çözmek için bu kural gerekli.
                        .requestMatchers(HttpMethod.GET, "/api/kullanici/yorum/sayisi").permitAll()

                        // ====================================================================
                        // 2. SADECE ADMİN YETKİSİ GEREKEN ALANLAR
                        // ====================================================================
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_Admin")

                        // ====================================================================
                        // 3. HEM ADMİN HEM DE ZİYARETÇİ TARAFINDAN ERİŞİLEBİLEN ALANLAR
                        // ====================================================================
                        // DÜZELTİLDİ: Yorum yapma, konu açma gibi işlemler için "hasAnyAuthority" kullanıldı.
                        .requestMatchers("/api/konu/ekle", "/api/yorum/ekle").hasAnyAuthority("ROLE_Admin", "ROLE_Ziyaretci")
                        .requestMatchers("/api/yorum/like/**", "/api/yorum/dislike/**").hasAnyAuthority("ROLE_Admin", "ROLE_Ziyaretci")
                        .requestMatchers("/api/kullanici/bilgi/guncelle", "/api/kullanici/bilgi/sifreGuncelle").hasAnyAuthority("ROLE_Admin", "ROLE_Ziyaretci")
                        .requestMatchers(
                                "/api/konu/sil",
                                "/api/yorum/sil",
                                "/api/konu/konularim",
                                "/api/yorum/yorumlarim",
                                "/api/kullanici/bilgi"
                        ).hasAnyAuthority("ROLE_Admin", "ROLE_Ziyaretci")

                        // ====================================================================
                        // 4. GERİYE KALAN TÜM İSTEKLER
                        // ====================================================================
                        .anyRequest().authenticated()
                )
                .addFilterBefore(myFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}