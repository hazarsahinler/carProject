document.addEventListener('DOMContentLoaded', () => {
    const kayitForm = document.getElementById('kayitForm');
    const girisForm = document.getElementById('girisForm');
    const kayitMessageArea = document.getElementById('kayitMessage');
    const girisMessageArea = document.getElementById('girisMessage');
    const sehirSelect = document.getElementById('kullaniciSehir'); // Kayıt formundaki şehir select'i

    // --- YARDIMCI FONKSİYONLAR ---
    function showMessage(area, message, isSuccess) {
        if (area) {
            area.style.display = 'none'; // Önce gizle, sonra class'ları ayarla
            area.textContent = message;
            area.className = 'message-area'; // Temel class'ları sıfırla
            if (message) { // Sadece mesaj varsa class ekle ve göster
                area.classList.add(isSuccess ? 'success' : 'error');
                area.style.display = 'block';
            }
        }
    }

    const sehirler = [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
        "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
        "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
        "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir",
        "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya",
        "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya",
        "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak",
        "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak",
        "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
    ];

    // Şehirleri select elementine doldur (sadece kayitForm varsa)
    if (kayitForm && sehirSelect) {
        sehirler.sort(); // Alfabetik sırala
        sehirler.forEach(sehir => {
            const option = document.createElement('option');
            option.value = sehir;
            option.textContent = sehir;
            sehirSelect.appendChild(option);
        });
    }

    // --- KAYIT İŞLEMİ ---
    if (kayitForm) {
        kayitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(kayitMessageArea, '', false); // Önceki mesajları temizle

            const formData = new FormData(kayitForm);
            const sifre = formData.get('kullaniciSifre');
            const sifreTekrar = formData.get('kullaniciSifreTekrar');
            const secilenSehir = formData.get('kullaniciSehir'); // Şehir select'inden değeri al

            if (sifre !== sifreTekrar) {
                showMessage(kayitMessageArea, 'Şifreler uyuşmuyor!', false);
                return;
            }
            if (sifre.length < 6) {
                showMessage(kayitMessageArea, 'Şifre en az 6 karakter olmalıdır!', false);
                return;
            }
            if (!secilenSehir) { // Şehir seçilmemişse
                showMessage(kayitMessageArea, 'Lütfen şehir seçiniz!', false);
                return;
            }
            // Diğer zorunlu alan kontrolleri (cinsiyet, doğum tarihi vs.) eklenebilir.
            if (!formData.get('kullaniciCinsiyet')) {
                showMessage(kayitMessageArea, 'Lütfen cinsiyet seçiniz!', false); return;
            }
            if (!formData.get('kullaniciDogumTarih')) {
                showMessage(kayitMessageArea, 'Lütfen doğum tarihinizi giriniz!', false); return;
            }


            const params = new URLSearchParams();
            for (const pair of formData) {
                // Şifre tekrar alanını gönderme
                if (pair[0] !== 'kullaniciSifreTekrar') {
                    params.append(pair[0], pair[1]);
                }
            }
            // console.log("Kayıt için gönderilen parametreler:", params.toString());

            const submitButton = kayitForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Kaydediliyor...';

            try {
                const response = await fetch('/api/kullanici/kayit', { // API endpoint'inizi kontrol edin
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                });

                const responseText = await response.text();
                // console.log("Kayıt yanıtı (raw):", responseText);

                if (!response.ok) {
                    let errorMessage = `Sunucu Hatası (${response.status})`;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || `${errorMessage}: ${errorData.error || response.statusText || 'Bilinmeyen sunucu hatası'}`;
                    } catch (parseError) {
                        errorMessage = `${errorMessage}: ${responseText.substring(0,150) || response.statusText || 'Yanıt ayrıştırılamadı'}`;
                    }
                    throw new Error(errorMessage);
                }

                // Yanıtın JSON olup olmadığını kontrol etmeye çalış
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Başarılı kayıt yanıtı JSON formatında değil:', responseText, parseError);
                    showMessage(kayitMessageArea, 'Sunucudan beklenmeyen bir yanıt formatı alındı. Lütfen daha sonra tekrar deneyin.', false);
                    // throw new Error('Sunucudan gelen başarılı kayıt yanıtı JSON formatında değil.'); // Kullanıcıya bu kadar teknik detay göstermeyebiliriz.
                    return; // İşlemi durdur
                }

                // Backend 'succsess' (çift s ile) dönüyorsa ona göre kontrol et
                if (data.succsess || data.success) {
                    showMessage(kayitMessageArea, (data.message || 'Kayıt başarılı!') + " Giriş sayfasına yönlendiriliyorsunuz...", true);
                    setTimeout(() => {
                        window.location.href = '/html/giris.html';
                    }, 2500);
                } else {
                    showMessage(kayitMessageArea, data.message || 'Kayıt işlemi başarısız oldu.', false);
                }

            } catch (error) {
                console.error('Kayıt sırasında genel hata:', error);
                showMessage(kayitMessageArea, error.message || 'Kayıt sırasında bir problem oluştu. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.', false);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // --- GİRİŞ İŞLEMİ ---
    if (girisForm) {
        girisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage(girisMessageArea, '', false); // Önceki mesajları temizle

            const formData = new FormData(girisForm);
            const params = new URLSearchParams();
            for (const pair of formData) {
                params.append(pair[0], pair[1]);
            }
            // console.log("Giriş için gönderilen parametreler:", params.toString());

            const submitButton = girisForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Giriş Yapılıyor...';

            try {
                const response = await fetch('/api/kullanici/giris', { // API endpoint'inizi kontrol edin
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                });

                const responseText = await response.text();
                // console.log("Giriş yanıtı (raw):", responseText);

                if (!response.ok) {
                    let errorMessage = `Sunucu Hatası (${response.status})`;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || `${errorMessage}: ${errorData.error || response.statusText || 'Bilinmeyen sunucu hatası'}`;
                    } catch (parseError) {
                        errorMessage = `${errorMessage}: ${responseText.substring(0,150) || response.statusText || 'Yanıt ayrıştırılamadı'}`;
                    }
                    throw new Error(errorMessage);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Başarılı giriş yanıtı JSON formatında değil:', responseText, parseError);
                    showMessage(girisMessageArea, 'Sunucudan beklenmeyen bir yanıt formatı alındı.', false);
                    return; // İşlemi durdur
                }

                if (data.success) { // Backend 'success' (tek s ile) dönüyorsa
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('userRole', data.rol); // Backend'den gelen rol adı
                    if (data.kullaniciId) {
                        localStorage.setItem('kullaniciId', data.kullaniciId);
                    }
                    if (data.kullaniciAdi) { // Kullanıcı adını da saklayalım
                        localStorage.setItem('kullaniciAdi', data.kullaniciAdi);
                    }
                    showMessage(girisMessageArea, (data.message || 'Giriş başarılı!') + " Ana sayfaya yönlendiriliyorsunuz...", true);

                    // Yönlendirme öncesi app.js'deki navigasyon güncellemesini tetiklemek için
                    // Eğer app.js global bir updateUserNav fonksiyonu sunuyorsa:
                    // if (typeof window.updateUserNav === 'function') {
                    //     window.updateUserNav();
                    // }
                    // Ya da direkt yönlendir:
                    setTimeout(() => {
                        // Giriş yapıldıktan sonra yönlendirilecek sayfa (query param ile gelmiş olabilir)
                        const urlParams = new URLSearchParams(window.location.search);
                        const redirectUrl = urlParams.get('redirect');
                        window.location.href = redirectUrl || '/html/index.html';
                    }, 1500);
                } else {
                    showMessage(girisMessageArea, data.message || 'Giriş bilgileriniz hatalı.', false);
                }
            } catch (error) {
                console.error('Giriş sırasında genel hata:', error);
                showMessage(girisMessageArea, error.message || 'Giriş sırasında bir problem oluştu. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.', false);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Bu kısım, app.js'de daha kapsamlı bir updateUserNav varsa oradan çağrılabilir.
    // Basit bir header güncellemesi için burada kalabilir.
    // Ancak app.js ile çakışmamasına dikkat edin.
    // Şimdilik bu sayfada header'ı statik bırakıyorum, çünkü app.js'nin
    // tüm sayfalarda authNav'ı güncellemesi beklenir.
    // Eğer app.js bu sayfada yüklenmiyorsa, basit bir kontrol eklenebilir:
    // const authNavHeader = document.querySelector('header nav#authNav');
    // if (authNavHeader && !localStorage.getItem('jwtToken')) {
    //     // Giriş yapılmamışsa default butonları göster (HTML'deki gibi)
    // } else if (authNavHeader && localStorage.getItem('jwtToken')) {
    //     // Giriş yapılmışsa farklı butonlar gösterilebilir (app.js'deki mantık gibi)
    // }
});