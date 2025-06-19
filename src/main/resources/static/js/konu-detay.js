document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT VE DEĞİŞKEN TANIMLAMALARI ---
    const API_PREFIX = '/api';

    // Sayfa içindeki ana elementler
    const konuDetayBolumu = document.getElementById('konu-detay-bolumu');
    const konuIcerigiAlani = document.getElementById('konuIcerigiAlani');
    const konuYukleniyor = document.getElementById('konuYukleniyor');
    const genelMesajAlani = konuDetayBolumu.querySelector('.message-area'); // Silme/oylama mesajları için

    const yorumlarBolumuDetay = document.getElementById('yorumlar-bolumu-detay');
    const yorumlarListesiDetay = document.getElementById('yorumlarListesiDetay');
    const yorumlarYukleniyor = document.getElementById('yorumlarYukleniyor');

    const yeniYorumFormuDetay = document.getElementById('yeniYorumFormuDetay');
    const yeniYorumTextDetay = document.getElementById('yeniYorumTextDetay');
    const yorumGonderBtnDetay = document.getElementById('yorumGonderBtnDetay');
    const yeniYorumMessageDetay = document.getElementById('yeniYorumMessageDetay');

    // Sayfa durumunu tutan değişkenler
    let currentKonuId = null;
    let konuyuAcanKullaniciId = null;

    // --- YARDIMCI FONKSİYONLAR ---

    // API istekleri için genel fonksiyon
    async function fetchData(urlPath, params = {}, method = 'GET', body = null) {
        const queryParams = new URLSearchParams(params).toString();
        const fullUrl = queryParams ? `${API_PREFIX}${urlPath}?${queryParams}` : `${API_PREFIX}${urlPath}`;
        const options = { method, headers: {} };
        const token = localStorage.getItem('jwtToken');
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
            // Backend'iniz URLSearchParams beklediği için her zaman bu formatı kullanıyoruz.
            if (body && typeof body === 'object') {
                options.body = new URLSearchParams(body);
            } else if(body) {
                options.body = body;
            }
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        try {
            const response = await fetch(fullUrl, options);
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || `Sunucu hatası: ${response.statusText}`;
                } catch (e) {
                    const errorText = await response.text().catch(() => 'Sunucudan yanıt okunamadı.');
                    errorMessage = `${response.status} - ${errorText.substring(0, 150) || 'Bilinmeyen sunucu hatası'}`;
                }
                throw new Error(errorMessage);
            }
            const contentType = response.headers.get("content-type");
            // Backend'iniz bazen sadece sayı (text) döndürdüğü için hem JSON hem text kontrolü yapıyoruz.
            return contentType?.includes("application/json") ? response.json() : response.text();
        } catch (error) {
            console.error(`API hatası (${fullUrl}):`, error);
            // Hata mesajını genel alanda göster
            showPageMessage(genelMesajAlani, `Bir hata oluştu: ${error.message}`, false);
            throw error;
        }
    }

    // Kullanıcıya mesaj gösterme fonksiyonu
    function showPageMessage(area, message, isSuccess) {
        if (!area) return;
        area.textContent = message;
        area.className = `message-area ${isSuccess ? 'success' : 'error'}`;
        area.style.display = 'block';
        setTimeout(() => { if (area) area.style.display = 'none'; }, 5000);
    }

    // Elementleri gösterme/gizleme
    function showElement(element) { if (element) element.style.display = 'block'; }
    function hideElement(element) { if (element) element.style.display = 'none'; }


    // --- ANA İŞLEVLER ---

    // konu-detay.js içinde
    // konu-detay.js içinde

    async function loadKonuDetay(konuId) {
        hideElement(konuIcerigiAlani);
        showElement(konuYukleniyor);
        try {
            const konuData = await fetchData(`/konu/detay`, { konuId });
            hideElement(konuYukleniyor);

            konuyuAcanKullaniciId = konuData.konuyuAcanKullaniciId;
            document.title = `${konuData.konuBasligi || 'Konu Detayı'} - OTOMOBİL DAYANIŞMA`;

            // GÜNCELLENDİ: Gelen araç, model ve motor bilgilerini birleştirelim.
            const aracParcalari = [];
            if (konuData.arabaMarka) aracParcalari.push(konuData.arabaMarka);
            if (konuData.modelIsmi) aracParcalari.push(konuData.modelIsmi);
            if (konuData.motorIsmi) aracParcalari.push(konuData.motorIsmi);

            // Parçaları ' -> ' ile birleştir. Eğer hiç veri yoksa varsayılan bir metin kullan.
            const aracBilgisiString = aracParcalari.length > 0 ? aracParcalari.join(' -> ') : 'Araç Belirtilmemiş';

            const konuIcerikHTML = konuData.konuIcerik
                ? `<div class="konu-icerik-detay">${konuData.konuIcerik.replace(/\n/g, '<br>')}</div>`
                : '';

            // GÜNCELLENDİ: HTML'i oluştururken eski `konuyuAcanınAracı` yerine yeni `aracBilgisiString` değişkenini kullanalım.
            // Ayrıca daha uygun bir ikon (fa-cogs) kullanabiliriz.
            konuIcerigiAlani.innerHTML = `
            <h1 class="konu-basligi-detay">${konuData.konuBasligi || 'Başlık Yok'}</h1>
            ${konuIcerikHTML}
            <div class="konu-meta-detay">
                <span><i class="fas fa-user-edit"></i> <strong>${konuData.konuyuAcan || 'Bilinmiyor'}</strong> <em class="konu-sahibi-etiket">(Konu Sahibi)</em></span>
                
                <!-- BURASI DEĞİŞTİRİLDİ -->
                <span><i class="fas fa-cogs"></i> <strong>${aracBilgisiString}</strong></span>
                
                <span><i class="fas fa-calendar-alt"></i> <strong>${konuData.konuAcilisTarihi || 'Bilinmiyor'}</strong></span>
            </div>
        `;
            showElement(konuIcerigiAlani);
            showElement(yorumlarBolumuDetay);
            await loadYorumlar(konuId);
        } catch (error) {
            hideElement(konuYukleniyor);
            konuIcerigiAlani.innerHTML = `<p class="error-message-global">Konu yüklenirken bir hata oluştu: ${error.message}</p>`;
            showElement(konuIcerigiAlani);
        }
    }
    // Konuya ait yorumları çeker ve listeler (Yorum Sayısı Entegrasyonu ile Güncellendi)
    async function loadYorumlar(konuId) {
        hideElement(yorumlarListesiDetay);
        showElement(yorumlarYukleniyor);
        try {
            const params = { konuId };
            const currentKullaniciId = localStorage.getItem('kullaniciId');
            if (currentKullaniciId) {
                params.kullaniciId = currentKullaniciId; // Kullanıcının oy bilgisini almak için
            }
            const yorumlar = await fetchData(`/yorum/yorumlar`, params);

            hideElement(yorumlarYukleniyor);
            yorumlarListesiDetay.innerHTML = '';

            if (yorumlar && Array.isArray(yorumlar) && yorumlar.length > 0) {
                const isLoggedIn = !!localStorage.getItem('jwtToken');

                // --- DEĞİŞİKLİK BURADA BAŞLIYOR ---

                // Her yorum için HTML oluşturma işlemini bir "Promise" (asenkron işlem) haline getiriyoruz.
                const yorumHtmlPromises = yorumlar.map(async (yorum) => {
                    const yorumID = yorum.id || yorum.yorumId;
                    if (!yorumID) return ''; // Geçersiz yorumlar için boş string döndür

                    // Her yorumun sahibi için yorum sayısını ayrıca çekiyoruz.
                    let kullaniciYorumSayisi = 0; // Varsayılan değer
                    try {
                        // Backend'inizden gelen JSON { "sayi": 15 } formatında olduğu için 'sayi' alanını alıyoruz.
                        const sayiData = await fetchData(`/kullanici/yorum/sayisi`, { kullaniciId: yorum.yorumYapanKullaniciId });
                        kullaniciYorumSayisi = sayiData.sayi || 0;
                    } catch (err) {
                        console.error(`Kullanıcı ${yorum.yorumYapanKullaniciId} için yorum sayısı alınamadı.`, err);
                        // Hata durumunda sayıyı 0 olarak bırakıp devam ediyoruz.
                    }

                    const isLiked = yorum.kullaniciOyu === 'LIKE';
                    const isDisliked = yorum.kullaniciOyu === 'DISLIKE';

                    let silmeButonuHTML = '';
                    if (isLoggedIn && currentKullaniciId && parseInt(yorum.yorumYapanKullaniciId) === parseInt(currentKullaniciId)) {
                        silmeButonuHTML = `<button class="btn-sil-yorum-detay btn-action" data-yorum-id="${yorumID}" title="Yorumu Sil"><i class="fas fa-trash-alt"></i></button>`;
                    }

                    // HTML'i oluştururken çektiğimiz yeni `kullaniciYorumSayisi` bilgisini kullanıyoruz.
                    return `
                    <div class="yorum-item-v2" data-yorum-id="${yorumID}">
                        <div class="yorum-kullanici-kolonu">
                            <div class="kullanici-avatar">${(yorum.kullaniciBilgi || 'Ü').charAt(0).toUpperCase()}</div>
                            <h4 class="kullanici-adi">${yorum.kullaniciBilgi || 'Bilinmeyen'} ${parseInt(yorum.yorumYapanKullaniciId) === parseInt(konuyuAcanKullaniciId) ? '<em class="konu-sahibi-etiket">(Konu Sahibi)</em>' : ''}</h4>
                            <p class="kullanici-rutbe">${yorum.kullaniciRutbesi || 'Üye'}</p>
                            <div class="kullanici-istatistikler">
                                <span><i class="fas fa-comment-dots"></i> ${kullaniciYorumSayisi}</span>
                            </div>
                        </div>
                        <div class="yorum-icerik-kolonu">
                            <div class="yorum-ust-bilgi">
                                <span class="yorum-tarihi">${yorum.yorumTarihiFormatli || yorum.yorumTarihi}</span>
                            </div>
                            <div class="yorum-metni">${(yorum.yorumBilgi || '').replace(/\n/g, '<br>')}</div>
                            <div class="yorum-etkilesim">
                                <button class="btn-action btn-like ${isLiked ? 'aktif' : ''}" data-yorum-id="${yorumID}" title="Beğen" ${!isLoggedIn ? 'disabled' : ''}>
                                    <i class="fas fa-thumbs-up"></i> <span class="like-count">${yorum.like ?? 0}</span>
                                </button>
                                <button class="btn-action btn-dislike ${isDisliked ? 'aktif' : ''}" data-yorum-id="${yorumID}" title="Beğenme" ${!isLoggedIn ? 'disabled' : ''}>
                                    <i class="fas fa-thumbs-down"></i> <span class="dislike-count">${yorum.dislike ?? 0}</span>
                                </button>
                                ${silmeButonuHTML}
                            </div>
                        </div>
                    </div>
                `;
                });

                // Tüm yorumların HTML'i (ve yorum sayıları) hazır olana kadar bekle.
                const yorumHtmlArray = await Promise.all(yorumHtmlPromises);

                // Hazır olan tüm HTML'leri birleştirip tek seferde listeye ekle.
                yorumlarListesiDetay.innerHTML = yorumHtmlArray.join('');

                // --- DEĞİŞİKLİK BURADA BİTİYOR ---

            } else {
                yorumlarListesiDetay.innerHTML = '<p style="text-align:center; padding: 20px;">Bu konu için henüz yorum yapılmamış.</p>';
            }
            showElement(yorumlarListesiDetay);
        } catch (error) {
            hideElement(yorumlarYukleniyor);
            yorumlarListesiDetay.innerHTML = `<p class="error-message-global">Yorumlar yüklenemedi: ${error.message}</p>`;
            showElement(yorumlarListesiDetay);
        } finally {
            checkTokenAndSetupYorumFormu();
        }
    }
    // Yorum yapma formunu kullanıcının giriş durumuna göre gösterir/gizler
    function checkTokenAndSetupYorumFormu() {
        if (localStorage.getItem('jwtToken') && currentKonuId) {
            showElement(yeniYorumFormuDetay);
        } else {
            hideElement(yeniYorumFormuDetay);
            if (!document.getElementById('login-prompt')) {
                const p = document.createElement('p');
                p.id = 'login-prompt';
                p.style.textAlign = 'center';
                p.style.marginTop = '20px';
                p.innerHTML = `Yorum yapmak veya oylamak için <a href="/html/giris.html?redirect=${encodeURIComponent(window.location.href)}">giriş yapınız</a>.`;
                yorumlarBolumuDetay.appendChild(p);
            }
        }
    }

    // Yeni yorum gönderme işlemini yapar
    async function postYorum() {
        const yorumTextValue = yeniYorumTextDetay.value.trim();
        if (!yorumTextValue) {
            return showPageMessage(yeniYorumMessageDetay, 'Yorum boş olamaz.', false);
        }
        yorumGonderBtnDetay.disabled = true;
        yorumGonderBtnDetay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

        try {
            const body = {
                yorum: yorumTextValue,
                kullaniciId: localStorage.getItem('kullaniciId'),
                konuId: currentKonuId
            };
            await fetchData('/yorum/ekle', {}, 'POST', body);
            yeniYorumTextDetay.value = '';
            hideElement(yeniYorumMessageDetay);
            await loadYorumlar(currentKonuId); // Yorumları tazeleyerek yenisini göster
        } catch (error) {
            showPageMessage(yeniYorumMessageDetay, `Yorum gönderilirken hata: ${error.message}`, false);
        } finally {
            yorumGonderBtnDetay.disabled = false;
            yorumGonderBtnDetay.innerHTML = '<i class="fas fa-paper-plane"></i> Yorumu Gönder';
        }
    }

    // Yorum silme işlemini yönetir
    async function handleYorumSilClick(deleteButton) {
        const yorumId = deleteButton.dataset.yorumId;
        if (confirm("Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?")) {
            try {
                const response = await fetchData(`/yorum/sil`, { yorumId }, 'DELETE');
                showPageMessage(genelMesajAlani, (response.message || response || "Yorum başarıyla silindi."), true);
                const yorumKarti = document.querySelector(`.yorum-item-v2[data-yorum-id='${yorumId}']`);
                if (yorumKarti) {
                    yorumKarti.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    yorumKarti.style.opacity = '0';
                    yorumKarti.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        yorumKarti.remove();
                        if (yorumlarListesiDetay.children.length === 0) {
                            yorumlarListesiDetay.innerHTML = '<p style="text-align:center; padding: 20px;">Bu konu için henüz yorum yapılmamış.</p>';
                        }
                    }, 300);
                }
            } catch (error) { /* Hata zaten fetchData içinde genel olarak ele alınıyor */ }
        }
    }

    // Gelişmiş Like/Dislike işlemlerini yönetir
    async function handleEtkilesimClick(button) {
        const yorumKarti = button.closest('.yorum-item-v2');
        if (!yorumKarti) return;

        const yorumId = button.dataset.yorumId;
        const kullaniciId = localStorage.getItem('kullaniciId');

        const likeButton = yorumKarti.querySelector('.btn-like');
        const dislikeButton = yorumKarti.querySelector('.btn-dislike');
        const likeCountSpan = likeButton.querySelector('.like-count');
        const dislikeCountSpan = dislikeButton.querySelector('.dislike-count');

        let likeCount = parseInt(likeCountSpan.textContent);
        let dislikeCount = parseInt(dislikeCountSpan.textContent);

        const isLikeButton = button.classList.contains('btn-like');
        const wasLiked = likeButton.classList.contains('aktif');
        const wasDisliked = dislikeButton.classList.contains('aktif');

        // Butonları geçici olarak devre dışı bırak
        likeButton.disabled = true;
        dislikeButton.disabled = true;

        const apiCalls = [];
        const params = { yorumId, kullaniciId };

        if (isLikeButton) { // LIKE butonuna tıklandı
            if (wasLiked) {
                likeButton.classList.remove('aktif');
                likeCountSpan.textContent = --likeCount;
                apiCalls.push(fetchData('/yorum/like/geriCek', params, 'POST'));
            } else {
                likeButton.classList.add('aktif');
                likeCountSpan.textContent = ++likeCount;
                apiCalls.push(fetchData('/yorum/like/ekle', params, 'POST'));
                if (wasDisliked) {
                    dislikeButton.classList.remove('aktif');
                    dislikeCountSpan.textContent = --dislikeCount;
                    apiCalls.push(fetchData('/yorum/dislike/geriCek', params, 'POST'));
                }
            }
        } else { // DISLIKE butonuna tıklandı
            if (wasDisliked) {
                dislikeButton.classList.remove('aktif');
                dislikeCountSpan.textContent = --dislikeCount;
                apiCalls.push(fetchData('/yorum/dislike/geriCek', params, 'POST'));
            } else {
                dislikeButton.classList.add('aktif');
                dislikeCountSpan.textContent = ++dislikeCount;
                apiCalls.push(fetchData('/yorum/dislike/ekle', params, 'POST'));
                if (wasLiked) {
                    likeButton.classList.remove('aktif');
                    likeCountSpan.textContent = --likeCount;
                    apiCalls.push(fetchData('/yorum/like/geriCek', params, 'POST'));
                }
            }
        }

        try {
            await Promise.all(apiCalls);
        } catch (error) {
            showPageMessage(genelMesajAlani, `İşlemde hata, sayfa yenileniyor: ${error.message}`, false);
            setTimeout(() => location.reload(), 2000);
        } finally {
            likeButton.disabled = false;
            dislikeButton.disabled = false;
        }
    }


    // --- SAYFA BAŞLANGIÇ VE OLAY DİNLEYİCİLERİ ---

    // URL'den konu ID'sini al ve sayfayı yükle
    const urlParams = new URLSearchParams(window.location.search);
    const konuIdFromUrl = urlParams.get('id');

    if (konuIdFromUrl && !isNaN(parseInt(konuIdFromUrl, 10))) {
        currentKonuId = parseInt(konuIdFromUrl, 10);
        loadKonuDetay(currentKonuId);
    } else {
        konuIcerigiAlani.innerHTML = `<p class="error-message-global">${konuIdFromUrl ? 'Geçersiz konu ID.' : 'Konu ID belirtilmemiş.'}</p>`;
        showElement(konuIcerigiAlani);
    }

    // Yorum gönderme formu için olay dinleyici
    if (yeniYorumFormuDetay) {
        yeniYorumFormuDetay.addEventListener('submit', (e) => {
            e.preventDefault();
            postYorum();
        });
    }

    // Yorum listesi için merkezi olay dinleyici (Event Delegation)
    if (yorumlarListesiDetay) {
        yorumlarListesiDetay.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('button.btn-action');
            if (!clickedButton) return; // Buton değilse devam etme

            if (clickedButton.classList.contains('btn-sil-yorum-detay')) {
                handleYorumSilClick(clickedButton);
            } else if (clickedButton.classList.contains('btn-like') || clickedButton.classList.contains('btn-dislike')) {
                handleEtkilesimClick(clickedButton);
            }
        });
    }
});