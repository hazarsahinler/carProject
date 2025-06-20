Araba Forum Sitesi - Full Stack Projesi
Bu proje, Java Spring Boot ile geliştirilmiş bir backend (REST API) ve bu API'yi kullanan basit bir frontend arayüzünden oluşan bir araba forumu sitesidir. Proje, bir bitirme projesi olarak geliştirilmiştir.
🚀 Projenin Amacı ve Özellikleri
Uygulama, kullanıcıların sisteme kaydolup giriş yapabildiği, arabalar hakkında konular açabildiği ve bu konulara yorum yapabildiği bir platform sunmayı hedefler.
Kullanıcı Yönetimi:
Yeni kullanıcı kaydı oluşturma
Mevcut kullanıcı ile sisteme giriş yapma (Login)
Güvenlik:
API güvenliği Spring Security ve JWT (JSON Web Token) ile sağlanmıştır. Yetkisiz erişimler engellenmiştir.
Forum İşlevselliği:
Sisteme kayıtlı arabaları listeleme
Belirli bir araba için yeni bir tartışma konusu ekleme
Mevcut konulara yorum yapma ve yorumları görüntüleme
Admin panelinde genel işlemlerin görüntülenmesi
🛠️ Kullanılan Teknolojiler ve Konseptler
Proje, modern ve endüstri standardı teknolojiler kullanılarak geliştirilmiştir.
Backend
Dil: Java
Framework: Spring Boot
Veritabanı Erişimi: Hibernate (JPA), HQL (Hibernate Query Language)
Güvenlik: Spring Security, JWT
Build Aracı: Maven
API: RESTful API
Frontend
Diller: HTML, CSS, JavaScript
Veritabanı
Sistem: PostgreSQL
Mimari ve Prensipler
Katmanlı Mimari (Controller - Service - DAO)
