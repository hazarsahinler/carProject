document.addEventListener('DOMContentLoaded', () => {

    const ADMIN_API_URL = '/api/admin';
    const GENERIC_API_URL = '/api';

    let loadedUsers = [];
    let allTopicsCache = [];

    // MERKEZİ API İSTEK FONKSİYONU
    async function apiRequest(fullUrl, method = 'GET', body = null) {
        const options = { method: method, headers: {} };
        const token = localStorage.getItem('jwtToken');
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        if (body instanceof URLSearchParams) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.body = body;
        } else if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(fullUrl, options);
            const responseText = await response.text();
            if (!response.ok) {
                let errorMessage = `Sunucu hatası: ${response.status}`;
                try { const errorData = JSON.parse(responseText); errorMessage = errorData.message || errorData.error || responseText; } catch (e) { if (responseText) errorMessage = responseText; }
                throw new Error(errorMessage);
            }
            return responseText ? JSON.parse(responseText) : {};
        } catch (error) {
            console.error(`API isteği hatası (${fullUrl}):`, error);
            throw error;
        }
    }

    // MERKEZİ SİLME FONKSİYONU (DOĞRU URL'LER İLE)
    async function handleDelete(itemType, itemId, elementToRemove) {
        let url;
        const params = new URLSearchParams();
        let confirmationMessage = '';
        let apiMethod = 'POST'; // API'leriniz POST bekliyorsa bu şekilde kalmalı

        switch (itemType) {
            case 'kullanici':
                url = `${ADMIN_API_URL}/kullanici/sil`; // ==> /api/admin/kullanici/sil
                params.append('kullaniciId', itemId);
                confirmationMessage = 'Bu kullanıcıyı ve tüm verilerini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.';
                break;
            case 'konu':
                url = `${GENERIC_API_URL}/konu/sil`; // ==> /api/konu/sil
                params.append('konuId', itemId);
                confirmationMessage = 'Bu konuyu ve içindeki tüm yorumları kalıcı olarak silmek istediğinizden emin misiniz?';
                break;
            case 'yorum':
                url = `${GENERIC_API_URL}/yorum/sil`; // ==> /api/yorum/sil
                params.append('yorumId', itemId);
                confirmationMessage = 'Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?';
                break;
            default:
                console.error('Bilinmeyen silme tipi:', itemType);
                return;
        }

        if (!confirm(confirmationMessage)) {
            return;
        }

        try {
            const result = await apiRequest(url, apiMethod, params);
            if (result && (result.success === true || result.status === "success")) {
                alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} başarıyla silindi.`);
                if (elementToRemove) {
                    elementToRemove.style.transition = 'opacity 0.5s ease';
                    elementToRemove.style.opacity = '0';
                    setTimeout(() => elementToRemove.remove(), 500);
                }
            } else {
                throw new Error(result.message || 'Silme işlemi sırasında bir hata oluştu.');
            }
        } catch (error) {
            alert(`Hata: ${error.message}`);
            console.error(`Silme hatası (${itemType} - ID: ${itemId}):`, error);
        }
    }


    function showMessage(area, message, isSuccess = false) { if (!area) return; area.textContent = message; area.className = 'message-area'; area.classList.add(isSuccess ? 'success' : 'error'); area.style.display = 'block'; }
    const currentPage = window.location.pathname;
    if (currentPage.includes('/admin/index.html')) {
        if (!localStorage.getItem('jwtToken') || localStorage.getItem('userRole') !== 'Admin') {
            localStorage.clear();
            window.location.replace('/admin/login.html');
        }
    }

    // ADMİN GİRİŞ FORMU
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('kullaniciEposta');
            const passwordInput = document.getElementById('kullaniciSifre');
            const messageArea = document.getElementById('loginMessage');
            const submitButton = adminLoginForm.querySelector('button[type="submit"]');
            const params = new URLSearchParams();
            params.append('kullaniciEposta', emailInput.value);
            params.append('kullaniciSifre', passwordInput.value);
            submitButton.disabled = true; submitButton.textContent = 'Giriş yapılıyor...'; messageArea.style.display = 'none';
            try {
                // Admin girişi /api/admin/giris adresine POST isteği yapar
                const data = await apiRequest(`${ADMIN_API_URL}/giris`, 'POST', params);
                if (data && data.success === true && data.token && (data.rol === 'Admin' || data.rol === 'ROLE_Admin')) {
                    localStorage.setItem('jwtToken', data.token); localStorage.setItem('userRole', 'Admin'); localStorage.setItem('kullaniciId', data.kullaniciId); localStorage.setItem('kullaniciEposta', emailInput.value);
                    window.location.replace('/admin/index.html');
                } else { throw new Error(data.message || 'Giriş yetkiniz yok veya bilgiler hatalı.'); }
            } catch (error) { showMessage(messageArea, `Giriş başarısız: ${error.message}`, false);
            } finally { submitButton.disabled = false; submitButton.textContent = 'Giriş Yap'; }
        });
    }

    const mainContentArea = document.getElementById('main-content');
    if (mainContentArea) {
        const contentTitle = document.getElementById('content-title');
        const navLinks = document.querySelectorAll('.sidebar-nav a');

        function setActiveLink(linkId) { navLinks.forEach(link => link.classList.remove('active')); const activeLink = document.getElementById(linkId); if (activeLink) activeLink.classList.add('active'); }

        async function loadAdminDetails() {
            if (!localStorage.getItem('kullaniciAdi')) {
                try {
                    // Adminin kendi bilgilerini çekmesi için /api/kullanici/bilgi kullanılır.
                    const adminInfo = await apiRequest(`${GENERIC_API_URL}/kullanici/bilgi`);
                    if (adminInfo.kullaniciAdi) {
                        const fullName = `${adminInfo.kullaniciAdi} ${adminInfo.kullaniciSoyadi}`;
                        localStorage.setItem('kullaniciAdi', fullName.trim());
                    }
                } catch (error) {
                    console.error("Admin bilgileri alınamadı:", error);
                }
            }
        }

        function loadDashboard() { setActiveLink('nav-dashboard'); contentTitle.textContent = 'Pano'; const identifier = localStorage.getItem('kullaniciAdi') || localStorage.getItem('kullaniciEposta') || 'Admin'; mainContentArea.innerHTML = `<p>Hoş geldiniz, <strong>${identifier}</strong>! Yönetmek istediğiniz bölümü sol menüden seçebilirsiniz.</p>`; }
        function logout() { localStorage.clear(); window.location.replace('/admin/login.html'); }

        const modal = () => document.getElementById('dataModal');
        const modalTitle = () => document.getElementById('modalTitle');
        const modalBody = () => document.getElementById('modalBody');

        // KULLANICI YÖNETİMİ (SİL BUTONU İLE)
        async function loadUsers() {
            setActiveLink('nav-users'); contentTitle.textContent = 'Kullanıcı Yönetimi'; mainContentArea.innerHTML = '<p>Kullanıcı verileri yükleniyor...</p>';
            try {
                // Tüm kullanıcıları /api/admin/kullanici/bilgi endpoint'inden çeker.
                const users = await apiRequest(`${ADMIN_API_URL}/kullanici/bilgi`);
                loadedUsers = users;
                if (!users || users.length === 0) { mainContentArea.innerHTML = '<p>Gösterilecek kullanıcı bulunamadı.</p>'; return; }
                let tableHTML = `<div style="overflow-x: auto;"><table class="data-table"><thead><tr><th>Ad Soyad</th><th>E-posta</th><th>İşlemler</th></tr></thead><tbody>`;
                users.forEach(user => {
                    const adSoyad = `${user.kullaniciAdi || ''} ${user.kullaniciSoyadi || ''}`.trim() || 'İsimsiz Kullanıcı';
                    const eposta = user.kullaniciEposta || 'N/A';
                    tableHTML += `<tr data-user-row-id="${user.kullaniciId}"><td>${adSoyad}</td><td>${eposta}</td><td>
                        <button class="btn-sm btn-info btn-view-details" data-id="${user.kullaniciId}" title="Kullanıcı Detayları"><i class="fas fa-info-circle"></i> Detaylar</button>
                        <button class="btn-sm btn-primary btn-view-konular" data-id="${user.kullaniciId}" data-name="${adSoyad}" title="Konuları Görüntüle"><i class="fas fa-comments"></i> Konular</button>
                        <button class="btn-sm btn-secondary btn-view-yorumlar" data-id="${user.kullaniciId}" data-name="${adSoyad}" title="Yorumları Görüntüle"><i class="fas fa-pen-square"></i> Yorumlar</button>
                        <button class="btn-sm btn-danger btn-delete-user" data-id="${user.kullaniciId}" title="Kullanıcıyı Sil"><i class="fas fa-trash-alt"></i> Sil</button>
                    </td></tr>`;
                });
                tableHTML += `</tbody></table></div>`;
                mainContentArea.innerHTML = tableHTML;
            } catch (error) { mainContentArea.innerHTML = `<div class="message-area error" style="display: block;">Kullanıcılar yüklenemedi: ${error.message}</div>`; }
        }

        // KULLANICI DETAY MODAL
        function showUserDetails(kullaniciId) {
            const user = loadedUsers.find(u => String(u.kullaniciId) === String(kullaniciId));
            if (!user) { alert('Kullanıcı bilgileri bulunamadı!'); return; }
            modalTitle().textContent = `${user.kullaniciAdi || ''} ${user.kullaniciSoyadi || ''} Detayları`;
            modalBody().innerHTML = `<ul class="detail-list"><li><strong>E-posta:</strong> <span>${user.kullaniciEposta || 'Belirtilmemiş'}</span></li><li><strong>Doğum Tarihi:</strong> <span>${user.kullaniciDogumTarihi || 'Belirtilmemiş'}</span></li><li><strong>Cinsiyet:</strong> <span>${user.kullaniciCinsiyet || 'Belirtilmemiş'}</span></li><li><strong>Şehir:</strong> <span>${user.kullaniciSehir || 'Belirtilmemiş'}</span></li><li><strong>Meslek:</strong> <span>${user.kullaniciMeslek || 'Belirtilmemiş'}</span></li><li><strong>Kayıtlı Aracı:</strong> <span>${user.kullaniciArac || 'Belirtilmemiş'}</span></li></ul>`;
            modal().style.display = 'block';
        }

        // KULLANICININ KONULARI MODAL (SİL BUTONU İLE)
        async function showKonularForUser(kullaniciId, kullaniciAdi) {
            modalTitle().textContent = `${kullaniciAdi} Kullanıcısının Konuları`; modalBody().innerHTML = '<p>Konular yükleniyor...</p>'; modal().style.display = 'block';
            try {
                const konular = await apiRequest(`${GENERIC_API_URL}/konu/konularim?kullaniciId=${kullaniciId}`);
                if (!konular || konular.length === 0) { modalBody().innerHTML = '<p>Bu kullanıcının açtığı herhangi bir konu bulunamadı.</p>'; return; }
                let konularHTML = '<div class="comments-container">';
                konular.forEach(konu => {
                    konularHTML += `<div class="topic-card" data-topic-card-id="${konu.konuId}">
                        <h3>${konu.konuBasligi || 'Başlıksız'}</h3>
                        <p>${konu.konuIcerigi || 'İçerik yok.'}</p>
                        <div class="topic-meta"><small><strong>Tarih:</strong> ${konu.konuAcilisTarihi || '-'}</small></div>
                        <div class="topic-actions">
                            <button class="btn btn-sm btn-info btn-view-konu-yorumlari" data-konu-id="${konu.konuId}" data-konu-baslik="${konu.konuBasligi || 'Başlıksız'}"><i class="fas fa-eye"></i> Yorumları Gör</button>
                            <button class="btn btn-sm btn-danger btn-delete-konu" data-konu-id="${konu.konuId}"><i class="fas fa-trash-alt"></i> Konuyu Sil</button>
                        </div>
                    </div>`;
                });
                konularHTML += '</div>'; modalBody().innerHTML = konularHTML;
            } catch (error) { modalBody().innerHTML = `<p class="message-area error" style="display:block;">Konular yüklenemedi: ${error.message}</p>`; }
        }

        // KULLANICININ YORUMLARI MODAL (SİL BUTONU İLE)
        async function showYorumlarForUser(kullaniciId, kullaniciAdi) {
            modalTitle().textContent = `${kullaniciAdi} Kullanıcısının Yorumları`;
            modalBody().innerHTML = `<p class="modal-message">Yorumlar yükleniyor...</p>`;
            modal().style.display = 'block';
            try {
                const yorumlar = await apiRequest(`${GENERIC_API_URL}/yorum/yorumlarim?kullaniciId=${kullaniciId}`);
                if (!yorumlar || yorumlar.length === 0) {
                    modalBody().innerHTML = '<p class="modal-message">Bu kullanıcının yaptığı herhangi bir yorum bulunamadı.</p>'; return;
                }
                let yorumlarHTML = '<div class="comments-container-modern">';
                yorumlar.forEach(yorum => {
                    yorumlarHTML += `<div class="comment-card-modern" data-comment-card-id="${yorum.yorumId}">
                        <div class="comment-header"><span>Yorum Yapılan Konu: <strong>${yorum.konuBaslik || 'Bilinmiyor'}</strong></span> <small>${yorum.yorumTarihiFormatli || '-'}</small></div>
                        <div class="comment-body"><p>${yorum.yorumBilgi || 'İçerik yok.'}</p></div>
                        <div class="comment-footer">
                            <div class="comment-likes"><i class="fas fa-thumbs-up"></i><span>${yorum.like || 0}</span></div>
                            <div class="comment-dislikes"><i class="fas fa-thumbs-down"></i><span>${yorum.dislike || 0}</span></div>
                            <button class="btn btn-sm btn-danger btn-delete-yorum" data-yorum-id="${yorum.yorumId}" title="Yorumu Sil"><i class="fas fa-trash-alt"></i> Sil</button>
                        </div>
                    </div>`;
                });
                yorumlarHTML += '</div>';
                modalBody().innerHTML = yorumlarHTML;
            } catch (error) { modalBody().innerHTML = `<p class="modal-message error">Yorumlar yüklenemedi: ${error.message}</p>`; }
        }

        // KONUNUN YORUMLARI MODAL (SİL BUTONU İLE)
        async function showYorumlarForKonu(konuId, konuBaslik) {
            modalTitle().textContent = `"${konuBaslik}" Konusunun Yorumları`;
            modalBody().innerHTML = `<p class="modal-message">Yorumlar yükleniyor...</p>`;
            modal().style.display = 'block';
            try {
                const yorumlar = await apiRequest(`${GENERIC_API_URL}/yorum/yorumlar?konuId=${konuId}`);
                if (!yorumlar || yorumlar.length === 0) {
                    modalBody().innerHTML = '<p class="modal-message">Bu konuya henüz yorum yapılmamış.</p>'; return;
                }
                let yorumlarHTML = '<div class="comments-container-modern">';
                yorumlar.forEach(yorum => {
                    yorumlarHTML += `<div class="comment-card-modern" data-comment-card-id="${yorum.yorumId}">
                        <div class="comment-header"><span>Yazan: <strong>${yorum.kullaniciBilgi || 'Bilinmiyor'}</strong></span> <small>${yorum.yorumTarihiFormatli || '-'}</small></div>
                        <div class="comment-body"><p>${yorum.yorumBilgi || 'İçerik yok.'}</p></div>
                        <div class="comment-footer">
                            <div class="comment-likes"><i class="fas fa-thumbs-up"></i><span>${yorum.like || 0}</span></div>
                            <div class="comment-dislikes"><i class="fas fa-thumbs-down"></i><span>${yorum.dislike || 0}</span></div>
                            <button class="btn btn-sm btn-danger btn-delete-yorum" data-yorum-id="${yorum.yorumId}" title="Yorumu Sil"><i class="fas fa-trash-alt"></i> Sil</button>
                        </div>
                    </div>`;
                });
                yorumlarHTML += '</div>';
                modalBody().innerHTML = yorumlarHTML;
            } catch (error) { modalBody().innerHTML = `<p class="modal-message error">Yorumlar yüklenemedi: ${error.message}</p>`; }
        }

        // TÜM KONULAR SAYFASI (SİL BUTONU İLE)
        function displayTopicsAsCards(topics) {
            const container = document.getElementById('topicListContainer');
            if (!topics || topics.length === 0) { container.innerHTML = `<p>Arama sonucuyla eşleşen konu bulunamadı.</p>`; return; }
            let topicsHTML = '';
            topics.forEach(konu => {
                topicsHTML += `<div class="topic-card" data-topic-card-id="${konu.konuId}">
                    <h3>${konu.konuBasligi || 'Başlıksız'}</h3><p>${konu.konuIcerigi || 'İçerik özeti bulunmuyor...'}</p>
                    <div class="topic-meta"><small><strong>Açan Kişi:</strong> ${konu.konuyuAcan || 'Bilinmiyor'}</small><small><strong>Tarih:</strong> ${konu.konuAcilisTarihi || '-'}</small></div>
                    <div class="topic-actions">
                        <button class="btn btn-sm btn-info btn-view-konu-yorumlari" data-konu-id="${konu.konuId}" data-konu-baslik="${konu.konuBasligi || 'Başlıksız'}"><i class="fas fa-eye"></i> Yorumları Gör</button>
                        <button class="btn btn-sm btn-danger btn-delete-konu" data-konu-id="${konu.konuId}"><i class="fas fa-trash-alt"></i> Konuyu Sil</button>
                    </div>
                </div>`;
            });
            container.innerHTML = topicsHTML;
        }

        async function loadAllTopicsPage() {
            setActiveLink('nav-topics'); contentTitle.textContent = 'Tüm Konular'; mainContentArea.innerHTML = `<div class="topic-controls"><input type="text" id="topicSearchInput" placeholder="Konu başlığı, içerik veya kullanıcı adı ile anında ara..."></div><div id="topicListContainer" class="topic-grid-container"></div>`;
            const searchInput = document.getElementById('topicSearchInput');
            const container = document.getElementById('topicListContainer');
            container.innerHTML = '<p>Konular yükleniyor...</p>';
            try {
                allTopicsCache = await apiRequest(`${GENERIC_API_URL}/konu/all`);
                displayTopicsAsCards(allTopicsCache);
            } catch (error) {
                container.innerHTML = `<p class="message-area error" style="display:block;">Konular yüklenemedi: ${error.message}</p>`;
            }
            searchInput.addEventListener('input', () => {
                const sorgu = searchInput.value.toLowerCase().trim();
                const filteredTopics = allTopicsCache.filter(konu => (konu.konuBasligi && konu.konuBasligi.toLowerCase().includes(sorgu)) || (konu.konuIcerigi && konu.konuIcerigi.toLowerCase().includes(sorgu)) || (konu.konuyuAcan && konu.konuyuAcan.toLowerCase().includes(sorgu)));
                displayTopicsAsCards(filteredTopics);
            });
        }

        // EVENT LISTENERS
        document.getElementById('nav-dashboard').addEventListener('click', (e) => { e.preventDefault(); loadDashboard(); });
        document.getElementById('nav-users').addEventListener('click', (e) => { e.preventDefault(); loadUsers(); });
        document.getElementById('nav-topics').addEventListener('click', (e) => { e.preventDefault(); loadAllTopicsPage(); });
        document.getElementById('adminLogoutBtn').addEventListener('click', (e) => { e.preventDefault(); logout(); });

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (e.target.classList.contains('close-button')) {
                const activeModal = e.target.closest('.modal'); if (activeModal) activeModal.style.display = 'none'; return;
            }
            if (!button) return;

            const { id, name, konuId, konuBaslik, yorumId } = button.dataset;

            if (button.classList.contains('btn-view-details')) showUserDetails(id);
            else if (button.classList.contains('btn-view-konular')) showKonularForUser(id, name);
            else if (button.classList.contains('btn-view-yorumlar')) showYorumlarForUser(id, name);
            else if (button.classList.contains('btn-view-konu-yorumlari')) showYorumlarForKonu(konuId, konuBaslik);
            else if (button.classList.contains('btn-delete-user')) {
                const elementToRemove = button.closest('tr[data-user-row-id]');
                handleDelete('kullanici', id, elementToRemove);
            }
            else if (button.classList.contains('btn-delete-konu')) {
                const elementToRemove = button.closest('.topic-card[data-topic-card-id]');
                handleDelete('konu', konuId, elementToRemove);
            }
            else if (button.classList.contains('btn-delete-yorum')) {
                const elementToRemove = button.closest('.comment-card-modern[data-comment-card-id]');
                handleDelete('yorum', yorumId, elementToRemove);
            }
        });

        window.addEventListener('click', (e) => { const activeModal = document.querySelector('.modal'); if (activeModal && e.target == activeModal) activeModal.style.display = 'none'; });

        // PANELİ BAŞLAT
        async function initializePanel() {
            await loadAdminDetails();
            loadDashboard();
        }
        initializePanel();
    }
});