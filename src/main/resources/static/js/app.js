document.addEventListener('DOMContentLoaded', () => {
    const API_PREFIX = '/api'; // Bu, fetchData içinde kullanılacak

    // --- GENEL ELEMENTLER (Tüm sayfalarda bulunabilir) ---
    const authNav = document.getElementById('authNav');
    const globalYeniKonuAcLinkHeader = document.getElementById('globalYeniKonuAcLink');
    const globalYeniKonuAcLinkMainIndex = document.getElementById('globalYeniKonuAcLinkMain');
    const globalYeniKonuAcLinkPageSpecific = document.getElementById('globalYeniKonuAcLinkPage');

    const welcomeBannerSection = document.getElementById('welcomeBannerSection');
    const infoBarContainer = document.getElementById('infoBarContainer');

    // --- YARDIMCI FONKSİYONLAR ---
    async function fetchData(urlPath, params = {}, method = 'GET', body = null, customHeaders = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const fullUrl = queryParams ? `${API_PREFIX}${urlPath}?${queryParams}` : `${API_PREFIX}${urlPath}`;

        const options = {
            method: method,
            headers: {...customHeaders} // Başlangıçta verilen özel header'ları al
        };

        const token = localStorage.getItem('jwtToken');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
            if (body instanceof URLSearchParams) {
                if (!options.headers['Content-Type']) {
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
                options.body = body.toString();
            } else if (body && typeof body === 'object' && !(body instanceof FormData)) { // FormData değilse JSON varsay
                if (!options.headers['Content-Type']) {
                    options.headers['Content-Type'] = 'application/json';
                }
                options.body = JSON.stringify(body);
            } else if (body) { // FormData veya başka bir string body
                options.body = body; // FormData ise Content-Type otomatik ayarlanır (tarayıcı tarafından)
            }
        }

        try {
            const response = await fetch(fullUrl, options);
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                let errorDetail = ''; // Sunucudan gelen hata detayını saklamak için
                try {
                    // Yanıtı önce text olarak almayı dene, çünkü JSON olmayabilir
                    const errorText = await response.text();
                    errorDetail = errorText; // Hata detayı olarak text'i sakla

                    // Eğer content type JSON ise, parse etmeyi dene
                    if (response.headers.get("content-type")?.includes("application/json")) {
                        const errorData = JSON.parse(errorText); // errorText'i parse et
                        errorMessage = errorData.message || errorData.error || `${response.status} - ${response.statusText || 'Bilinmeyen sunucu hatası'}`;
                    } else {
                        // JSON değilse, status ve text'i kullan
                        errorMessage = `${response.status} - ${errorText.substring(0, 150) || response.statusText || 'Bilinmeyen sunucu hatası'}`;
                    }
                } catch (e) {
                    // JSON parse hatası veya response.text() hatası
                    errorMessage = `${response.status} - ${response.statusText || (errorDetail.substring(0, 100) || 'Yanıt okunamadı veya işlenemedi.')}`;
                }
                throw new Error(errorMessage); // Hata mesajını fırlat
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            // JSON değilse text olarak döndür (örneğin, bazı API'ler sadece metin döndürebilir)
            return await response.text();
        } catch (error) {
            // Bu hata, fetch'in kendisinden (network hatası) veya yukarıda fırlatılan Error'dan gelebilir.
            // Hatanın zaten detaylı bir mesajı olmalı (örn. fetchData içindeki Error).
            console.error(`API'den veri alınırken hata oluştu (${fullUrl}):`, error.message); // Sadece mesajı logla, error objesi zaten stack trace içerir.
            throw error; // Hatayı yeniden fırlat ki çağıran fonksiyon kendi try-catch'inde yakalayabilsin.
        }
    }

    function populateDropdown(selectElement, data, valueField, textField, defaultOptionText) {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        if (data && Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
            selectElement.disabled = false;
        } else {
            selectElement.disabled = true;
        }
    }

    function showLoading(containerElement, sectionElement) {
        if (containerElement) containerElement.innerHTML = '<p class="loading">Yükleniyor...</p>';
        if (sectionElement) sectionElement.style.display = 'block';
    }

    function showAppMessage(area, message, isSuccess) {
        if (area) {
            area.textContent = message;
            area.className = 'message-area';
            area.classList.add(isSuccess ? 'success' : 'error');
            area.style.display = 'block';
            setTimeout(() => {
                if (area) area.style.display = 'none';
            }, 5000);
        }
    }

    // --- KULLANICI OTURUM YÖNETİMİ VE NAVİGASYON ---
    function updateUserNav() {
        if (!authNav) return;

        const token = localStorage.getItem('jwtToken');
        const kullaniciAdi = localStorage.getItem('kullaniciAdi') || "Kullanıcı";

        if (token) {
            authNav.innerHTML = `
                <span class="welcome-message">Hoş geldiniz, ${kullaniciAdi}!</span>
                <div class="profile-dropdown">
                    <button id="profileBtn" class="btn profile-dropdown-btn">Hesabım</button>
                    <div id="profileDropdownContent" class="dropdown-content">
                        <a href="/html/kullanici-bilgileri.html">Bilgilerim</a>
                        <a href="/html/kullanici-konularim.html">Konularım</a>
                        <a href="/html/kullanici-yorumlarim.html">Yorumlarım</a>
                    </div>
                </div>
                <button id="cikisYapBtn" class="btn btn-danger"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</button>
            `;

            const profileBtn = document.getElementById('profileBtn');
            const profileDropdownContent = document.getElementById('profileDropdownContent');
            const cikisYapBtn = document.getElementById('cikisYapBtn');

            if (profileBtn && profileDropdownContent) {
                profileBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    profileDropdownContent.classList.toggle('show');
                });

                window.addEventListener('click', (event) => {
                    if (profileDropdownContent && profileDropdownContent.classList.contains('show')) {
                        if (!profileBtn.contains(event.target) && !profileDropdownContent.contains(event.target)) {
                            profileDropdownContent.classList.remove('show');
                        }
                    }
                });
            }

            if (cikisYapBtn) {
                cikisYapBtn.addEventListener('click', () => {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('kullaniciId');
                    localStorage.removeItem('kullaniciAdi');
                    updateUserNav();

                    const currentPath = window.location.pathname;
                    if (currentPath !== '/html/index.html' &&
                        currentPath !== '/' &&
                        !currentPath.includes('/html/giris.html') &&
                        !currentPath.includes('/html/kayit.html')) {
                        window.location.href = '/html/index.html';
                    }
                });
            }

            if (welcomeBannerSection) welcomeBannerSection.style.display = 'none';
            if (infoBarContainer) infoBarContainer.style.display = 'none';
            if (globalYeniKonuAcLinkMainIndex) globalYeniKonuAcLinkMainIndex.style.display = 'inline-block';
            if (globalYeniKonuAcLinkPageSpecific) globalYeniKonuAcLinkPageSpecific.style.display = 'inline-block';

        } else {
            authNav.innerHTML = `
                <a href="/html/giris.html" class="auth-link"><i class="fas fa-key"></i> Giriş yap</a>
                <a href="/html/kayit.html" class="auth-link"><i class="fas fa-clipboard-list"></i> Kayıt ol</a>
            `;

            if (welcomeBannerSection) welcomeBannerSection.style.display = 'block';
            if (infoBarContainer) infoBarContainer.style.display = 'block';
            if (globalYeniKonuAcLinkMainIndex) globalYeniKonuAcLinkMainIndex.style.display = 'none';
            if (globalYeniKonuAcLinkPageSpecific) globalYeniKonuAcLinkPageSpecific.style.display = 'none';
        }
    }

    const handleYeniKonuAcRedirect = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        const targetUrl = '/html/yeni-konu.html';
        if (token) {
            window.location.href = targetUrl;
        } else {
            window.location.href = `/html/giris.html?redirect=${encodeURIComponent(targetUrl)}`;
        }
    };

    if (globalYeniKonuAcLinkHeader) {
        globalYeniKonuAcLinkHeader.addEventListener('click', handleYeniKonuAcRedirect);
    }
    if (globalYeniKonuAcLinkMainIndex) {
        globalYeniKonuAcLinkMainIndex.addEventListener('click', handleYeniKonuAcRedirect);
    }
    if (globalYeniKonuAcLinkPageSpecific) {
        globalYeniKonuAcLinkPageSpecific.addEventListener('click', handleYeniKonuAcRedirect);
    }

    // --- SADECE INDEX.HTML'DE ÇALIŞACAK İŞLEVLER ---
    const arabaSelect = document.getElementById('arabaSelect');
    if (arabaSelect) {
        const modelSelect = document.getElementById('modelSelect');
        const motorSelect = document.getElementById('motorSelect');
        const konularBolumu = document.getElementById('konular-bolumu');
        const konularListesi = document.getElementById('konularListesi');
        const yeniKonuBolumu = document.getElementById('yeni-konu-bolumu');
        const yeniKonuForm = document.getElementById('yeniKonuForm');
        const konuBaslikInput = document.getElementById('konuBaslikInput');
        const seciliModelIdInput = document.getElementById('seciliModelIdInput');
        const seciliMotorIdInput = document.getElementById('seciliMotorIdInput');
        const yeniKonuMessage = document.getElementById('yeniKonuMessage');
        const yeniKonuAcBtn = document.getElementById('yeniKonuAcBtn');
        const yeniKonuIptalBtn = document.getElementById('yeniKonuIptalBtn');
        const yeniKonuAcButonAlani = document.getElementById('yeniKonuAcButonAlani');

        let currentSeciliModelId = null;
        let currentSeciliMotorId = null;

        function hideIndexContentSections() {
            if (konularBolumu) konularBolumu.style.display = 'none';
            if (konularListesi) konularListesi.innerHTML = '';
            if (yeniKonuBolumu && yeniKonuBolumu.style.display === 'block') {
                yeniKonuBolumu.style.display = 'none';
                toggleYeniKonuAcBtnVisibility(currentSeciliMotorId);
            }
        }

        async function loadArabalar() {
            try {
                const arabalar = await fetchData(`/arabalar`); // API_PREFIX kaldırıldı
                if (arabalar) {
                    populateDropdown(arabaSelect, arabalar, 'arabaId', 'arabaMarka', 'Marka Seçiniz...');
                }
            } catch (error) {
                console.error("Arabalar yüklenirken hata:", error);
                // Hata durumunda kullanıcıya mesaj gösterilebilir
            }
        }

        async function loadModeller(arabaId) {
            currentSeciliModelId = null;
            currentSeciliMotorId = null;
            toggleYeniKonuAcBtnVisibility(null);
            if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';

            if (!arabaId) {
                if (modelSelect) {
                    modelSelect.innerHTML = '<option value="">Önce Marka Seçiniz...</option>';
                    modelSelect.disabled = true;
                }
                if (motorSelect) {
                    motorSelect.innerHTML = '<option value="">Önce Model Seçiniz...</option>';
                    motorSelect.disabled = true;
                }
                hideIndexContentSections();
                return;
            }
            try {
                const modeller = await fetchData(`/modeller`, {araba: arabaId}); // API_PREFIX kaldırıldı
                if (modeller) {
                    populateDropdown(modelSelect, modeller, 'modelId', 'modelIsmi', 'Model Seçiniz...');
                }
            } catch (error) {
                console.error("Modeller yüklenirken hata:", error);
            }
            if (motorSelect) {
                motorSelect.innerHTML = '<option value="">Önce Model Seçiniz...</option>';
                motorSelect.disabled = true;
            }
            hideIndexContentSections();
        }

        async function loadMotorlar(modelId) {
            currentSeciliModelId = modelId;
            currentSeciliMotorId = null;
            toggleYeniKonuAcBtnVisibility(null);
            if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';

            if (!modelId) {
                if (motorSelect) {
                    motorSelect.innerHTML = '<option value="">Önce Model Seçiniz...</option>';
                    motorSelect.disabled = true;
                }
                hideIndexContentSections();
                return;
            }
            try {
                const motorlar = await fetchData(`/motorlar`, {model: modelId}); // API_PREFIX kaldırıldı
                if (motorlar) {
                    populateDropdown(motorSelect, motorlar, 'motorId', 'motorIsmi', 'Motor Seçiniz...');
                }
            } catch (error) {
                console.error("Motorlar yüklenirken hata:", error);
            }
            hideIndexContentSections();
        }

        async function loadKonular(motorId) { // Bu index.html'deki genel konuları yükler
            if (!konularBolumu || !konularListesi) return;

            if (!motorId) {
                hideIndexContentSections();
                toggleYeniKonuAcBtnVisibility(null);
                return;
            }
            currentSeciliMotorId = motorId;
            toggleYeniKonuAcBtnVisibility(motorId);

            showLoading(konularListesi, konularBolumu);
            if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';

            try {
                const konular = await fetchData(`/konu/konular`, {Motor: motorId}); // API_PREFIX kaldırıldı
                konularListesi.innerHTML = '';
                if (konular && Array.isArray(konular) && konular.length > 0) {
                    konular.forEach(konu => {
                        const konuDiv = document.createElement('div');
                        konuDiv.classList.add('konu-item');
                        konuDiv.innerHTML = `
                            <h3><a href="/html/konu-detay.html?id=${konu.konuId}">${konu.konuBasligi}</a></h3>
                            <p class="meta">
                                <span>Açan: <strong>${konu.konuyuAcan || 'Bilinmiyor'}</strong> <em class="konu-sahibi-etiket">(Konu Sahibi)</em></span>
                                <span>Aracı: <strong>${konu.konuyuAcanınAracı || 'Belirtilmemiş'}</strong></span>
                                <span>Tarih: <strong>${konu.konuAcilisTarihi}</strong></span>
                            </p>
                        `;
                        konularListesi.appendChild(konuDiv);
                    });
                } else if (konular && Array.isArray(konular)) {
                    konularListesi.innerHTML = '<p>Bu motor tipine ait konu bulunamadı.</p>';
                } else {
                    konularListesi.innerHTML = '<p>Konular yüklenirken bir hata oluştu veya veri formatı uygun değil.</p>';
                }
            } catch (error) {
                console.error("Genel konular yüklenirken hata:", error);
                konularListesi.innerHTML = `<p class="error-message-global">Konular yüklenemedi: ${error.message}</p>`;
            }
        }

        function toggleYeniKonuAcBtnVisibility(motorIdParam) {
            const motorId = motorIdParam || currentSeciliMotorId;
            if (yeniKonuAcButonAlani) {
                const token = localStorage.getItem('jwtToken');
                if (token && motorId) {
                    if (yeniKonuBolumu && yeniKonuBolumu.style.display === 'block') {
                        yeniKonuAcButonAlani.style.display = 'none';
                    } else {
                        yeniKonuAcButonAlani.style.display = 'block';
                    }
                } else {
                    yeniKonuAcButonAlani.style.display = 'none';
                    if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';
                }
            }
        }

        if (yeniKonuAcBtn) {
            yeniKonuAcBtn.addEventListener('click', () => {
                if (yeniKonuBolumu && konuBaslikInput && seciliModelIdInput && seciliMotorIdInput) {
                    konuBaslikInput.value = '';
                    const konuIcerikTextarea = document.getElementById('konuIcerikInput_index');
                    if (konuIcerikTextarea) konuIcerikTextarea.value = '';
                    if (yeniKonuMessage) yeniKonuMessage.style.display = 'none';

                    if (!currentSeciliModelId || !currentSeciliMotorId) {
                        showAppMessage(yeniKonuMessage, "Lütfen önce Araba, Model ve Motor seçimi yapın.", false);
                        return;
                    }
                    seciliModelIdInput.value = currentSeciliModelId;
                    seciliMotorIdInput.value = currentSeciliMotorId;
                    yeniKonuBolumu.style.display = 'block';
                    if (yeniKonuAcButonAlani) yeniKonuAcButonAlani.style.display = 'none';
                }
            });
        }

        if (yeniKonuIptalBtn) {
            yeniKonuIptalBtn.addEventListener('click', () => {
                if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';
                toggleYeniKonuAcBtnVisibility(currentSeciliMotorId);
            });
        }

        // app.js içindeki if (yeniKonuForm) { ... } bloğunu bulun ve içindeki submit listener'ı değiştirin
        if (yeniKonuForm) {
            yeniKonuForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (yeniKonuMessage) yeniKonuMessage.style.display = 'none';

                const kullaniciId = localStorage.getItem('kullaniciId');
                if (!kullaniciId) { /* Giriş yapılmamışsa... */ return; }

                const konuBaslik = konuBaslikInput.value.trim();
                // GÜNCELLENDİ: Konu içeriğini al
                const konuIcerikTextarea = document.getElementById('konuIcerikInput_index');
                const konuIcerik = konuIcerikTextarea ? konuIcerikTextarea.value.trim() : '';
                const modelId = seciliModelIdInput.value;
                const motorId = seciliMotorIdInput.value;

                // Doğrulama
                if (!konuBaslik) {
                    showAppMessage(yeniKonuMessage, 'Konu başlığı boş olamaz.', false);
                    return;
                }
                if (!konuIcerik) { // YENİ EKLENDİ
                    showAppMessage(yeniKonuMessage, 'Konu içeriği boş olamaz.', false);
                    return;
                }

                const params = new URLSearchParams();
                params.append('konuBaslik', konuBaslik);
                params.append('konuIcerik', konuIcerik); // YENİ EKLENDİ
                params.append('kullaniciId', kullaniciId);
                params.append('Model', modelId);
                params.append('Motor', motorId);

                const submitButton = yeniKonuForm.querySelector('button[type="submit"]');
                const originalButtonHTML = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

                try {
                    const data = await fetchData(`/konu/ekle`, {}, 'POST', params);
                    // Backend'in JSON döndürdüğünü varsayalım
                    // Örnek: { success: true, message: "...", konuId: 123 }
                    showAppMessage(yeniKonuMessage, (data.message || "Konu başarıyla açıldı!"), true);
                    yeniKonuForm.reset();
                    setTimeout(() => {
                        if (yeniKonuBolumu) yeniKonuBolumu.style.display = 'none';
                        toggleYeniKonuAcBtnVisibility(currentSeciliMotorId);
                        loadKonular(motorId); // Listeyi yenile
                    }, 1500);

                } catch (error) {
                    console.error('Yeni konu (index) açma hatası:', error);
                    showAppMessage(yeniKonuMessage, error.message, false);
                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            });
        }

        arabaSelect.addEventListener('change', (e) => loadModeller(e.target.value));
        if (modelSelect) modelSelect.addEventListener('change', (e) => loadMotorlar(e.target.value));
        if (motorSelect) motorSelect.addEventListener('change', (e) => loadKonular(e.target.value));

        loadArabalar();
        hideIndexContentSections();
        toggleYeniKonuAcBtnVisibility(null);
    }

    // app.js dosyanızın içindeki ilgili bölümü bununla değiştirin.
// Önceki kodunuz aynı kalabilir, sadece bu bölüm güncellenecek.

// --- KULLANICI KONULARIM SAYFASI İŞLEVLERİ ---
    const kullaniciKonularListesiEl = document.getElementById('kullaniciKonularListesi');
    if (kullaniciKonularListesiEl) {
        const kullaniciKonularMessageEl = document.getElementById('kullaniciKonularMessage');

        async function loadKullaniciKonulari() {
            const token = localStorage.getItem('jwtToken');
            const kullaniciId = localStorage.getItem('kullaniciId');

            if (!token || !kullaniciId) {
                kullaniciKonularListesiEl.innerHTML = `<p>Konularınızı görmek için lütfen <a href="/html/giris.html?redirect=${encodeURIComponent(window.location.pathname)}">giriş yapın</a>.</p>`;
                if (kullaniciKonularMessageEl) showAppMessage(kullaniciKonularMessageEl, "Bu sayfayı görüntülemek için giriş yapmalısınız.", false);
                return;
            }

            kullaniciKonularListesiEl.innerHTML = '<p class="loading">Konularınız yükleniyor...</p>';
            if (kullaniciKonularMessageEl) kullaniciKonularMessageEl.style.display = 'none';

            try {
                const konular = await fetchData(`/konu/konularim`, {kullaniciId: kullaniciId});

                kullaniciKonularListesiEl.innerHTML = '';

                if (konular && Array.isArray(konular) && konular.length > 0) {
                    konular.forEach(konu => {
                        const konuKartiDiv = document.createElement('div');
                        konuKartiDiv.classList.add('konu-ozet-karti');
                        // Silme sonrası kartı bulabilmek için ID ekliyoruz
                        konuKartiDiv.setAttribute('data-konu-id', konu.konuId);

                        const konuBasligi = konu.konuBasligi || 'Başlık Yok';
                        const konuId = konu.konuId;
                        const acilisTarihi = konu.konuAcilisTarihi || 'Tarih Bilinmiyor';
                        const marka = konu.arabaMarka || '';
                        const model = konu.modelIsmi || '';
                        const motor = konu.motorIsmi || '';

                        let aracBilgisi = [marka, model, motor].filter(Boolean).join(' <i class="fas fa-angle-right"></i> ') || 'Araç Bilgisi Belirtilmemiş';

                        // GÜNCELLENMİŞ HTML YAPISI: İçerik ve aksiyon (silme butonu) için ayrı alanlar
                        konuKartiDiv.innerHTML = `
                        <div class="konu-icerik-alani">
                            <h3 class="konu-basligi-konularim">
                                <a href="/html/konu-detay.html?id=${konuId}" class="konu-linki-konularim">${konuBasligi}</a>
                            </h3>
                            <div class="konu-meta-konularim">
                                <span class="arac-bilgisi-konularim"><i class="fas fa-car"></i> ${aracBilgisi}</span>
                                <span class="tarih-konularim"><i class="fas fa-calendar-alt"></i> ${acilisTarihi}</span>
                            </div>
                        </div>
                        <div class="konu-aksiyon-alani">
                            <button class="btn-sil" data-konu-id="${konuId}" title="Konuyu Sil">
                                <i class="fas fa-trash-alt"></i> Sil
                            </button>
                        </div>
                    `;
                        kullaniciKonularListesiEl.appendChild(konuKartiDiv);
                    });
                } else if (konular && Array.isArray(konular)) {
                    kullaniciKonularListesiEl.innerHTML = '<p>Henüz açtığınız bir konu bulunmuyor.</p>';
                } else {
                    kullaniciKonularListesiEl.innerHTML = '<p>Konularınız yüklenirken bir sorun oluştu veya veri formatı uygun değil.</p>';
                    if (kullaniciKonularMessageEl) showAppMessage(kullaniciKonularMessageEl, 'Konular yüklenemedi veya format hatası.', false);
                }
            } catch (error) {
                console.error("Kullanıcı konuları yüklenirken hata:", error);
                kullaniciKonularListesiEl.innerHTML = `<p class="error-message-global">Konular yüklenemedi: ${error.message}</p>`;
                if (kullaniciKonularMessageEl) showAppMessage(kullaniciKonularMessageEl, `Bir hata oluştu: ${error.message}`, false);
            }
        }

        // YENİ EKLENDİ: SİLME BUTONLARI İÇİN OLAY DİNLEYİCİ
        // Konu listesine tıklama olayını dinle (event delegation)
        kullaniciKonularListesiEl.addEventListener('click', async (e) => {
            // Tıklanan elementin bir silme butonu olup olmadığını kontrol et
            const deleteButton = e.target.closest('.btn-sil');

            if (deleteButton) {
                e.preventDefault(); // Varsayılan davranışı engelle

                const konuId = deleteButton.dataset.konuId;

                // Kullanıcıdan onay iste
                if (confirm("Bu konuyu ve içindeki tüm yorumları kalıcı olarak silmek istediğinizden emin misiniz?\nBu işlem geri alınamaz!")) {

                    try {
                        // API'ye silme isteği gönder. Method: 'DELETE' kullanmak REST standartları için daha iyidir.
                        // Mevcut backend @RequestMapping'iniz bunu kabul edecektir.
                        // Java kodunuzdaki `succsess` anahtarını `success` olarak düzelttiyseniz, `response.succsess` kısmını silebilirsiniz.
                        const response = await fetchData(`/konu/sil`, {konuId: konuId}, 'DELETE');

                        if (response && (response.success || response.succsess)) {
                            showAppMessage(kullaniciKonularMessageEl, response.message || "Konu başarıyla silindi.", true);

                            // Başarılı olursa, ilgili konu kartını DOM'dan kaldır
                            const konuKarti = document.querySelector(`.konu-ozet-karti[data-konu-id='${konuId}']`);
                            if (konuKarti) {
                                // Yumuşak bir geçişle kaybolma efekti
                                konuKarti.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                konuKarti.style.opacity = '0';
                                konuKarti.style.transform = 'translateX(-20px)';
                                setTimeout(() => {
                                    konuKarti.remove();
                                    // Eğer listede başka konu kalmadıysa mesaj göster
                                    if (kullaniciKonularListesiEl.children.length === 0) {
                                        kullaniciKonularListesiEl.innerHTML = '<p>Henüz açtığınız bir konu bulunmuyor.</p>';
                                    }
                                }, 500);
                            }
                        } else {
                            showAppMessage(kullaniciKonularMessageEl, response.message || "Konu silinirken bir hata oluştu.", false);
                        }
                    } catch (error) {
                        console.error("Konu silme API çağrısı başarısız:", error);
                        showAppMessage(kullaniciKonularMessageEl, `Bir hata oluştu: ${error.message}`, false);
                    }
                }
            }
        });

        // Sayfa yüklendiğinde kullanıcı konularını yükle
        loadKullaniciKonulari();
    }

    // app.js dosyanızdaki bu bölümü aşağıdaki kodla değiştirin

// --- KULLANICI YORUMLARIM SAYFASI İŞLEVLERİ ---
    const kullaniciYorumlarListesiEl = document.getElementById('kullaniciYorumlarListesi');
    if (kullaniciYorumlarListesiEl) {
        const kullaniciYorumlarMessageEl = document.getElementById('kullaniciYorumlarMessage');

        async function loadKullaniciYorumlari() {
            const token = localStorage.getItem('jwtToken');
            const kullaniciId = localStorage.getItem('kullaniciId');

            if (!token || !kullaniciId) {
                kullaniciYorumlarListesiEl.innerHTML = `<p>Yorumlarınızı görmek için lütfen <a href="/html/giris.html?redirect=${encodeURIComponent(window.location.pathname)}">giriş yapın</a>.</p>`;
                if (kullaniciYorumlarMessageEl) showAppMessage(kullaniciYorumlarMessageEl, "Bu sayfayı görüntülemek için giriş yapmalısınız.", false);
                return;
            }

            kullaniciYorumlarListesiEl.innerHTML = '<p class="loading">Yorumlarınız yükleniyor...</p>';
            if (kullaniciYorumlarMessageEl) kullaniciYorumlarMessageEl.style.display = 'none';

            try {
                const yorumlar = await fetchData(`/yorum/yorumlarim`, {kullaniciId: kullaniciId});

                kullaniciYorumlarListesiEl.innerHTML = '';

                if (yorumlar && Array.isArray(yorumlar) && yorumlar.length > 0) {
                    yorumlar.forEach(yorum => {
                        const yorumKartiDiv = document.createElement('div');
                        yorumKartiDiv.classList.add('yorum-ozet-karti');
                        // Silme sonrası kartı DOM'dan kolayca bulmak için ID ekliyoruz
                        yorumKartiDiv.setAttribute('data-yorum-id', yorum.yorumId);

                        const konuBaslik = yorum.konuBaslik || 'Konu Başlığı Yok';
                        const konuId = yorum.konuId;
                        const yorumIcerigi = yorum.yorumBilgi || 'Yorum içeriği bulunamadı.';
                        const yorumTarihi = yorum.yorumTarihiFormatli || yorum.yorumTarihi || 'Tarih Bilinmiyor';
                        const likeSayisi = yorum.like !== undefined ? yorum.like : 0;
                        const dislikeSayisi = yorum.dislike !== undefined ? yorum.dislike : 0;

                        // Yorumun ID'si, silme işlemi için kritik
                        const yorumId = yorum.yorumId;

                        let konuLinkHTML = `<h3 class="konu-basligi-yorumlarim">${konuBaslik}</h3>`;
                        if (konuId) {
                            konuLinkHTML = `
                            <h3 class="konu-basligi-yorumlarim">
                                <a href="/html/konu-detay.html?id=${konuId}" class="konu-linki-yorumlarim">${konuBaslik}</a>
                            </h3>`;
                        }
                        const yorumIcerigiHTML = yorumIcerigi.replace(/\n/g, '<br>');

                        // GÜNCELLENMİŞ HTML YAPISI: İçerik ve aksiyon (silme butonu) için ayrı alanlar
                        yorumKartiDiv.innerHTML = `
                        <div class="yorum-icerik-alani">
                            ${konuLinkHTML}
                            <div class="yorum-icerik-yorumlarim">${yorumIcerigiHTML}</div>
                            <div class="yorum-meta-yorumlarim">
                                <span class="tarih-yorumlarim"><i class="fas fa-calendar-alt"></i> ${yorumTarihi}</span>
                                <span class="etkilesim-yorumlarim">
                                    <i class="fas fa-thumbs-up"></i> ${likeSayisi}
                                    <i class="fas fa-thumbs-down"></i> ${dislikeSayisi}
                                </span>
                            </div>
                        </div>
                        <div class="yorum-aksiyon-alani">
                            <button class="btn-sil-yorum" data-yorum-id="${yorumId}" title="Yorumu Sil">
                                <i class="fas fa-trash-alt"></i> Sil
                            </button>
                        </div>
                    `;
                        kullaniciYorumlarListesiEl.appendChild(yorumKartiDiv);
                    });
                } else if (yorumlar && Array.isArray(yorumlar)) {
                    kullaniciYorumlarListesiEl.innerHTML = '<p>Henüz bir yorum yapmamışsınız.</p>';
                } else {
                    kullaniciYorumlarListesiEl.innerHTML = '<p>Yorumlarınız yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>';
                    if (kullaniciYorumlarMessageEl) showAppMessage(kullaniciYorumlarMessageEl, "Yorumlar alınamadı veya format hatası.", false);
                }
            } catch (error) {
                console.error("Kullanıcı yorumları yüklenirken genel hata:", error);
                if (kullaniciYorumlarListesiEl) kullaniciYorumlarListesiEl.innerHTML = `<p class="error-message-global">Yorumlar yüklenemedi: ${error.message}</p>`;
                if (kullaniciYorumlarMessageEl) showAppMessage(kullaniciYorumlarMessageEl, `Bir hata oluştu: ${error.message}`, false);
            }
        }

        // YENİ EKLENDİ: SİLME BUTONLARI İÇİN OLAY DİNLEYİCİ (EVENT DELEGATION)
        kullaniciYorumlarListesiEl.addEventListener('click', async (e) => {
            // Tıklanan elementin bir silme butonu olup olmadığını kontrol et
            const deleteButton = e.target.closest('.btn-sil-yorum');

            if (deleteButton) {
                e.preventDefault(); // Varsayılan davranışı engelle

                const yorumId = deleteButton.dataset.yorumId;

                // Kullanıcıdan onay iste
                if (confirm("Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?")) {
                    try {
                        // API'ye silme isteği gönder. Method: 'DELETE' kullanmak REST standartları için daha iyidir.
                        // fetchData fonksiyonu token'ı otomatik olarak ekleyecektir.
                        // Not: Backend'deki anahtar 'succsess' (yazım hatalı). Kontrolü her iki duruma göre yapıyoruz.
                        const response = await fetchData(`/yorum/sil`, { yorumId: yorumId }, 'DELETE');

                        if (response && (response.success || response.succsess)) {
                            showAppMessage(kullaniciYorumlarMessageEl, response.message || "Yorum başarıyla silindi.", true);

                            // Başarılı olursa, ilgili yorum kartını DOM'dan kaldır
                            const yorumKarti = document.querySelector(`.yorum-ozet-karti[data-yorum-id='${yorumId}']`);
                            if (yorumKarti) {
                                // Yumuşak bir geçişle kaybolma efekti
                                yorumKarti.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                yorumKarti.style.opacity = '0';
                                yorumKarti.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                    yorumKarti.remove();
                                    // Eğer listede başka yorum kalmadıysa mesaj göster
                                    if (kullaniciYorumlarListesiEl.children.length === 0) {
                                        kullaniciYorumlarListesiEl.innerHTML = '<p>Henüz bir yorum yapmamışsınız.</p>';
                                    }
                                }, 500);
                            }
                        } else {
                            showAppMessage(kullaniciYorumlarMessageEl, (response && response.message) || "Yorum silinirken bir hata oluştu.", false);
                        }
                    } catch (error) {
                        console.error("Yorum silme API çağrısı başarısız:", error);
                        showAppMessage(kullaniciYorumlarMessageEl, `Bir hata oluştu: ${error.message}`, false);
                    }
                }
            }
        });

        // Sayfa yüklendiğinde kullanıcı yorumlarını yükle
        loadKullaniciYorumlari();
    }

    // ... mevcut kodlarınız ...

    // --- HEADER ARAMA ÇUBUĞU İŞLEVSELLİĞİ ---
    const headerSearchForm = document.getElementById('headerSearchForm');
    const headerSearchInput = document.getElementById('headerSearchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    if (headerSearchForm && headerSearchInput && searchResultsContainer) {
        let searchTimeout;

        // Her tuş vuruşunda API'yi yormamak için bir "debounce" fonksiyonu
        // Kullanıcı yazmayı bıraktıktan kısa bir süre sonra arama yapar.
        headerSearchInput.addEventListener('input', (e) => {
            const sorgu = e.target.value.trim();

            // Önceki zamanlayıcıyı temizle
            clearTimeout(searchTimeout);

            if (sorgu.length < 3) {
                searchResultsContainer.innerHTML = '';
                searchResultsContainer.style.display = 'none';
                return;
            }

            // Yeni bir zamanlayıcı başlat
            searchTimeout = setTimeout(() => {
                performSearch(sorgu);
            }, 300); // Kullanıcı yazmayı bıraktıktan 300ms sonra ara
        });

        async function performSearch(sorgu) {
            // Arama başlarken "Yükleniyor..." mesajı göster
            searchResultsContainer.innerHTML = '<div class="search-results-message">Aranıyor...</div>';
            searchResultsContainer.style.display = 'block';

            try {
                // API'ye istek at. Java Controller'ını /api/konu/search olarak güncellediyseniz bu çalışacaktır.
                const sonuclar = await fetchData('/konu/search', { sorgu: sorgu });

                renderSearchResults(sonuclar);
            } catch (error) {
                console.error('Arama sırasında hata:', error);
                searchResultsContainer.innerHTML = `<div class="search-results-message error">Arama başarısız oldu. Lütfen tekrar deneyin.</div>`;
            }
        }

        function renderSearchResults(sonuclar) {
            searchResultsContainer.innerHTML = ''; // Önceki sonuçları temizle

            if (!sonuclar || !Array.isArray(sonuclar) || sonuclar.length === 0) {
                searchResultsContainer.innerHTML = '<div class="search-results-message">Sonuç bulunamadı.</div>';
                searchResultsContainer.style.display = 'block';
                return;
            }

            const ul = document.createElement('ul');
            ul.className = 'search-results-list'; // Yeni CSS class'ı

            sonuclar.forEach(konu => {
                const li = document.createElement('li');
                li.className = 'search-result-item'; // Yeni CSS class'ı

                // arabaMarka ve modelIsmi alanlarını backend'den aldığınızdan emin olun
                const aracBilgisi = konu.aracBilgisi || 'Araç bilgisi belirtilmemiş';

                // HTML yapısını yeni tasarıma göre güncelliyoruz
                li.innerHTML = `
            <a href="/html/konu-detay.html?id=${konu.konuId}" class="search-result-link">
                <div class="search-result-title">${konu.konuBasligi}</div>
                <div class="search-result-meta">
                    <i class="fas fa-car"></i>
                    <span>${aracBilgisi}</span>
                </div>
            </a>
        `;
                ul.appendChild(li);
            });

            searchResultsContainer.appendChild(ul);
            searchResultsContainer.style.display = 'block';
        }

        // Arama kutusuna odaklanıldığında eski aramayı tekrar gösterme (isteğe bağlı)
        headerSearchInput.addEventListener('focus', () => {
            const sorgu = headerSearchInput.value.trim();
            if (sorgu.length >= 3 && searchResultsContainer.children.length > 0) {
                searchResultsContainer.style.display = 'block';
            }
        });

        // Dışarı tıklandığında sonuçları gizle
        document.addEventListener('click', (e) => {
            if (!headerSearchForm.contains(e.target)) {
                searchResultsContainer.style.display = 'none';
            }
        });

        // Form gönderimini engelle (sayfanın yenilenmemesi için)
        headerSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sorgu = headerSearchInput.value.trim();
            if(sorgu.length >= 3) {
                performSearch(sorgu); // Enter'a basınca da arama yap
            }
        });
    }


    // --- TÜM SAYFALAR İÇİN GEÇERLİ İLK İŞLEMLER ---
    updateUserNav();



}); // DOMContentLoaded Sonu