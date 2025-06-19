package carForumSite.example.demo.filter;

import carForumSite.example.demo.bus.jwt.JwtService;
import carForumSite.example.demo.bus.kullaniciBulma.UserDetailsService;
import carForumSite.example.demo.entity.Kullanici;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final RequestMatcher permitAllUrls; // Değişkeni burada tanımla

    // Constructor içinde listeyi oluşturarak daha güvenli hale getiriyoruz
    public MyFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;

        // Herkesin token olmadan erişebileceği yolların tam ve doğru listesi
        this.permitAllUrls = new OrRequestMatcher(
                // 1. Statik Dosyalar ve Arayüzler (Kullanıcı ve Admin)
                new AntPathRequestMatcher("/"),
                new AntPathRequestMatcher("/html/**"),
                new AntPathRequestMatcher("/css/**"),
                new AntPathRequestMatcher("/js/**"),
                new AntPathRequestMatcher("/images/**"),
                new AntPathRequestMatcher("/favicon.ico"),
                new AntPathRequestMatcher("/admin/**"), // Admin arayüzü dosyaları için genel kural

                // 2. Public API Endpoints (Giriş ve Kayıt)
                new AntPathRequestMatcher("/api/kullanici/kayit", "POST"),
                new AntPathRequestMatcher("/api/kullanici/giris", "POST"),
                new AntPathRequestMatcher("/api/admin/giris", "POST"), // <-- EKSİK OLAN KRİTİK KURAL

                // 3. Public API Endpoints (Veri Çekme)
                new AntPathRequestMatcher("/api/arabalar", "GET"),
                new AntPathRequestMatcher("/api/modeller", "GET"),
                new AntPathRequestMatcher("/api/motorlar", "GET"),
                new AntPathRequestMatcher("/api/konu/konular", "GET"),
                new AntPathRequestMatcher("/api/yorum/yorumlar", "GET"),
                new AntPathRequestMatcher("/api/konu/detay", "GET"),
                new AntPathRequestMatcher("/api/kullanici/yorum/sayisi", "GET"),
                new AntPathRequestMatcher("/api/konu/search", "GET")
        );
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Gelen isteğin, yukarıda tanımladığımız herkese açık URL listesiyle eşleşip eşleşmediğini kontrol et.
        if (permitAllUrls.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // --- Buradan sonrası korumalı yollar için ---
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Token eksik veya geçersiz formatta.");
            return;
        }

        String token = authHeader.substring(7);
        String kullaniciEposta;

        try {
            kullaniciEposta = jwtService.extractUsername(token);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Oturum geçersiz veya süresi dolmuş.");
            return;
        }

        if (kullaniciEposta != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Kullanici kullanici = userDetailsService.loadUserByUsername(kullaniciEposta);

            if (kullanici != null && jwtService.validateToken(token, kullaniciEposta)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        kullanici, null, List.of(() -> "ROLE_" + kullanici.getRole().name())
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    // Hata mesajlarını tek bir yerden yönetmek için yardımcı metod
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
    }
}