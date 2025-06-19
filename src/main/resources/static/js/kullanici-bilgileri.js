document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const userInfoWrapper = document.getElementById('userInfoWrapper');
    const userInfoActions = document.getElementById('userInfoActions');
    const formFeedback = document.getElementById('formFeedback');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordFormContainer = document.getElementById('changePasswordFormContainer');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const cancelChangePasswordBtn = document.getElementById('cancelChangePassword');

    const API_PREFIX = '/api'; // Backend API ön eki
    const kullaniciId = localStorage.getItem('kullaniciId');
    const token = localStorage.getItem('jwtToken');

    let currentUserData = null; // Mevcut kullanıcı verilerini saklamak için

    // --- API İstekleri için Merkezi Fonksiyon ---
    // Backend'iniz request.getParameter() beklediği için güncellendi.
    async function fetchDataWithAuth(url, method = 'GET', bodyParams = null) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Authorization': token ? `Bearer ${token}` : ''
            // Content-Type, URLSearchParams ile gönderim yaparken tarayıcı tarafından otomatik ayarlanır.
        };

        const options = { method, headers };
        let fullUrl = url;

        const requestData = new URLSearchParams();
        if (bodyParams) {
            for (const key in bodyParams) {
                requestData.append(key, bodyParams[key]);
            }
        }

        if (method === 'GET') {
            fullUrl = `${url}?${requestData.toString()}`;
        } else if (method === 'POST' || method === 'PUT') {
            options.method = 'POST'; // Backend @RequestMapping ile kabul edecektir.
            options.body = requestData;
        }

        try {
            const response = await fetch(fullUrl, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `HTTP hatası! Durum: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            console.error(`API hatası (${fullUrl}):`, error);
            showFeedback(error.message, 'error');
            throw error;
        }
    }

    // --- Arayüz Fonksiyonları ---

    // Başarı veya hata mesajlarını göstermek için yardımcı fonksiyon
    function showFeedback(message, type = 'success') {
        formFeedback.innerHTML = `<p class="${type === 'success' ? 'success-user-info' : 'error-user-info'}">${message}</p>`;
        setTimeout(() => formFeedback.innerHTML = '', 4000);
    }

    // Kullanıcı arayüzünü "görüntüleme" veya "düzenleme" modunda çizen fonksiyon
    function renderUserInfo(isEditMode = false) {
        if (!currentUserData) return;

        const tamAd = `${currentUserData.kullaniciAdi || ''} ${currentUserData.kullaniciSoyadi || ''}`.trim() || 'Belirtilmemiş';

        if (isEditMode) {
            // Düzenleme modu: Input alanları oluşturulur.
            userInfoWrapper.innerHTML = `
                <form id="editInfoForm">
                    <div class="user-info-item"><strong>Ad:</strong> <input type="text" name="kullaniciAdi" class="form-control" value="${currentUserData.kullaniciAdi || ''}"></div>
                    <div class="user-info-item"><strong>Soyad:</strong> <input type="text" name="kullaniciSoyadi" class="form-control" value="${currentUserData.kullaniciSoyadi || ''}"></div>
                    <div class="user-info-item"><strong>E-posta:</strong> <input type="email" name="kullaniciEposta" class="form-control" value="${currentUserData.kullaniciEposta || ''}"></div>
                    <div class="user-info-item"><strong>Şehir:</strong> <input type="text" name="kullaniciSehir" class="form-control" value="${currentUserData.kullaniciSehir || ''}"></div>
                    <div class="user-info-item"><strong>Meslek:</strong> <input type="text" name="kullaniciMeslek" class="form-control" value="${currentUserData.kullaniciMeslek || ''}"></div>
                    <div class="user-info-item"><strong>Kullandığı Araç:</strong> <input type="text" name="kullaniciArac" class="form-control" value="${currentUserData.kullaniciArac || ''}"></div>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="submit" class="btn btn-success">Kaydet</button>
                        <button type="button" id="cancelEditBtn" class="btn btn-light">İptal</button>
                    </div>
                </form>
            `;
            document.getElementById('editInfoForm').addEventListener('submit', handleUpdateInfo);
            document.getElementById('cancelEditBtn').addEventListener('click', () => {
                renderUserInfo(false);
                userInfoActions.style.display = 'block';
            });
            userInfoActions.style.display = 'none'; // Düzenleme modunda ana butonları gizle
        } else {
            // Görüntüleme modu: Span etiketleri oluşturulur.
            userInfoWrapper.innerHTML = `
                <div class="user-info-item"><strong>Ad Soyad:</strong> <span>${tamAd}</span></div>
                <div class="user-info-item"><strong>E-posta:</strong> <span>${currentUserData.kullaniciEposta || 'Belirtilmemiş'}</span></div>
                <div class="user-info-item"><strong>Cinsiyet:</strong> <span>${currentUserData.kullaniciCinsiyet || 'Belirtilmemiş'}</span></div>
                <div class="user-info-item"><strong>Şehir:</strong> <span>${currentUserData.kullaniciSehir || 'Belirtilmemiş'}</span></div>
                <div class="user-info-item"><strong>Meslek:</strong> <span>${currentUserData.kullaniciMeslek || 'Belirtilmemiş'}</span></div>
                <div class="user-info-item"><strong>Kullandığı Araç:</strong> <span>${currentUserData.kullaniciArac || 'Belirtilmemiş'}</span></div>
                <div class="user-info-item"><strong>Doğum Tarihi:</strong> <span>${currentUserData.kullaniciDogumTarihi || 'Belirtilmemiş'}</span></div>
            `;
        }
    }

    // --- Olay Yöneticileri (Event Handlers) ---

    async function handleUpdateInfo(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updatedData = Object.fromEntries(formData.entries());

        const body = { kullaniciId, ...updatedData };

        try {
            const result = await fetchDataWithAuth(`${API_PREFIX}/kullanici/bilgi/guncelle`, 'POST', body);
            if (result.success || result.succsess) { // "succsess" yazım hatası ihtimaline karşı
                showFeedback(result.message, 'success');
                currentUserData = { ...currentUserData, ...updatedData };
                renderUserInfo(false);
                userInfoActions.style.display = 'block'; // Butonları tekrar göster
            } else {
                showFeedback(result.message || 'Bir hata oluştu.', 'error');
            }
        } catch (error) { /* Hata zaten `fetchDataWithAuth` içinde gösteriliyor */ }
    }

    async function handleChangePassword(event) {
        event.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            showFeedback('Yeni şifreler eşleşmiyor.', 'error'); return;
        }

        const body = {
            kullaniciId,
            kullaniciSifre: currentPassword,
            KullaniciYeniSifre: newPassword // Backend'deki parametre adı büyük harfliydi
        };

        try {
            const result = await fetchDataWithAuth(`${API_PREFIX}/kullanici/bilgi/sifreGuncelle`, 'POST', body);
            if (result.success) { // Backend'deki düzeltmeyi yaptığınızı varsayıyorum
                showFeedback(result.message, 'success');
                changePasswordForm.reset();
                changePasswordFormContainer.style.display = 'none';
                userInfoActions.style.display = 'block';
            } else {
                showFeedback(result.message || 'Şifre güncellenemedi.', 'error');
            }
        } catch (error) { /* Hata zaten `fetchDataWithAuth` içinde gösteriliyor */ }
    }

    // --- Sayfayı Başlatan Ana Fonksiyon ---
    async function initializePage() {
        if (!token || !kullaniciId) {
            userInfoWrapper.innerHTML = `<p class="error-user-info">Bu sayfayı görüntülemek için giriş yapmalısınız. <a href="/html/giris.html" class="btn btn-primary">Giriş Yap</a></p>`;
            return;
        }

        try {
            const userData = await fetchDataWithAuth(`${API_PREFIX}/kullanici/bilgi`, 'GET', { kullaniciId });
            currentUserData = userData; // Gelen veriyi global değişkene ata
            renderUserInfo(false); // Arayüzü normal modda oluştur
            userInfoActions.style.display = 'block'; // Bilgiler yüklendikten sonra butonları göster
        } catch (error) {
            userInfoWrapper.innerHTML = `<p class="error-user-info">Kullanıcı bilgileri alınırken bir hata oluştu.</p>`;
        }
    }

    // --- Event Listener'ları Bağlama ---
    editProfileBtn.addEventListener('click', () => renderUserInfo(true));

    changePasswordBtn.addEventListener('click', () => {
        changePasswordFormContainer.style.display = 'block';
        userInfoActions.style.display = 'none';
    });

    cancelChangePasswordBtn.addEventListener('click', () => {
        changePasswordForm.reset();
        changePasswordFormContainer.style.display = 'none';
        userInfoActions.style.display = 'block';
        formFeedback.innerHTML = ''; // İptal edince mesajları temizle
    });

    changePasswordForm.addEventListener('submit', handleChangePassword);

    // Sayfayı başlat
    initializePage();
});