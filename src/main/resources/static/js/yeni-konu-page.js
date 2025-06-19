document.addEventListener('DOMContentLoaded', () => {
    // app.js'in içindeki fetchData, populateDropdown gibi fonksiyonları burada tekrar yazmak yerine
    // bu script'in app.js'den sonra yüklendiğini varsayarak direkt kullanabiliriz.
    // Ancak kodun bağımsız çalışması için temel fonksiyonları buraya da ekleyelim.

    const API_PREFIX = '/api';

    async function fetchData(urlPath, params = {}, method = 'GET', body = null) {
        // Bu fonksiyon app.js'deki ile aynı olmalı.
        const queryParams = new URLSearchParams(params).toString();
        const fullUrl = queryParams ? `${API_PREFIX}${urlPath}?${queryParams}` : `${API_PREFIX}${urlPath}`;
        const options = { method, headers: {} };
        const token = localStorage.getItem('jwtToken');
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
            if (body instanceof URLSearchParams) {
                options.body = body.toString();
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            } else if (body && typeof body === 'object') {
                options.body = JSON.stringify(body);
                options.headers['Content-Type'] = 'application/json';
            }
        }

        try {
            const response = await fetch(fullUrl, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            return contentType?.includes("application/json") ? response.json() : response.text();
        } catch (error) {
            console.error(`API hatası (${fullUrl}):`, error);
            throw error;
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

    function showPageMessage(area, message, isSuccess) {
        if (!area) return;
        area.textContent = message;
        area.className = `message-area ${isSuccess ? 'success' : 'error'}`;
        area.style.display = 'block';
        setTimeout(() => { if (area) area.style.display = 'none'; }, 5000);
    }

    // --- Sayfa Elementleri ---
    const arabaSelect = document.getElementById('pageArabaSelect');
    const modelSelect = document.getElementById('pageModelSelect');
    const motorSelect = document.getElementById('pageMotorSelect');
    const yeniKonuForm = document.getElementById('pageYeniKonuForm');
    const konuBaslikInput = document.getElementById('pageKonuBaslikInput');
    const konuIcerikInput = document.getElementById('pageKonuIcerikInput'); // YENİ EKLENDİ
    const seciliModelIdInput = document.getElementById('pageSeciliModelIdInput');
    const seciliMotorIdInput = document.getElementById('pageSeciliMotorIdInput');
    const messageArea = document.getElementById('pageYeniKonuMessage');

    // --- Fonksiyonlar ---
    async function loadArabalar() {
        try {
            const arabalar = await fetchData(`/arabalar`);
            populateDropdown(arabaSelect, arabalar, 'arabaId', 'arabaMarka', 'Marka Seçiniz...');
        } catch (error) {
            showPageMessage(messageArea, 'Markalar yüklenirken bir hata oluştu.', false);
        }
    }

    async function loadModeller(arabaId) {
        modelSelect.innerHTML = '<option value="">Yükleniyor...</option>';
        motorSelect.innerHTML = '<option value="">Önce Model Seçiniz...</option>';
        modelSelect.disabled = true;
        motorSelect.disabled = true;

        if (!arabaId) {
            modelSelect.innerHTML = '<option value="">Önce Marka Seçiniz...</option>';
            return;
        }
        try {
            const modeller = await fetchData(`/modeller`, { araba: arabaId });
            populateDropdown(modelSelect, modeller, 'modelId', 'modelIsmi', 'Model Seçiniz...');
        } catch (error) {
            showPageMessage(messageArea, 'Modeller yüklenirken bir hata oluştu.', false);
        }
    }

    async function loadMotorlar(modelId) {
        motorSelect.innerHTML = '<option value="">Yükleniyor...</option>';
        motorSelect.disabled = true;
        if (!modelId) {
            motorSelect.innerHTML = '<option value="">Önce Model Seçiniz...</option>';
            return;
        }
        try {
            const motorlar = await fetchData(`/motorlar`, { model: modelId });
            populateDropdown(motorSelect, motorlar, 'motorId', 'motorIsmi', 'Motor Seçiniz...');
        } catch (error) {
            showPageMessage(messageArea, 'Motorlar yüklenirken bir hata oluştu.', false);
        }
    }

    // --- Olay Dinleyicileri ---
    arabaSelect.addEventListener('change', (e) => loadModeller(e.target.value));
    modelSelect.addEventListener('change', (e) => loadMotorlar(e.target.value));

    yeniKonuForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('jwtToken');
        const kullaniciId = localStorage.getItem('kullaniciId');

        if (!token || !kullaniciId) {
            showPageMessage(messageArea, 'Konu açmak için giriş yapmalısınız.', false);
            // Kullanıcıyı giriş sayfasına yönlendirebilirsiniz.
            setTimeout(() => { window.location.href = `/html/giris.html?redirect=${window.location.pathname}`; }, 2000);
            return;
        }

        const modelId = modelSelect.value;
        const motorId = motorSelect.value;
        const konuBaslik = konuBaslikInput.value.trim();
        const konuIcerik = konuIcerikInput.value.trim(); // YENİ EKLENDİ

        // Doğrulama
        if (!modelId || !motorId) {
            showPageMessage(messageArea, 'Lütfen marka, model ve motor seçimi yapın.', false);
            return;
        }
        if (!konuBaslik) {
            showPageMessage(messageArea, 'Konu başlığı boş olamaz.', false);
            return;
        }
        if (!konuIcerik) { // YENİ EKLENDİ
            showPageMessage(messageArea, 'Konu içeriği boş olamaz.', false);
            return;
        }

        // GÜNCELLENDİ: Form verilerini API'ye gönderme
        const params = new URLSearchParams();
        params.append('konuBaslik', konuBaslik);
        params.append('konuIcerik', konuIcerik); // YENİ EKLENDİ
        params.append('kullaniciId', kullaniciId);
        params.append('Model', modelId); // Backend bu anahtarları bekliyorsa (Model, Motor)
        params.append('Motor', motorId);

        const submitButton = yeniKonuForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yayınlanıyor...';

        try {
            const data = await fetchData('/konu/ekle', {}, 'POST', params);
            // Backend'in JSON döndürdüğünü varsayalım: { success: true, message: "...", konuId: 123 }
            // Eğer sadece text dönüyorsa, bu kontrolü değiştirmeniz gerekir.
            showPageMessage(messageArea, "Konu başarıyla açıldı! Yönlendiriliyorsunuz...", true);
            yeniKonuForm.reset();

            // Başarılı konu açma sonrası kullanıcıyı konu detay sayfasına yönlendirelim
            // Backend'inizin yeni eklenen konunun ID'sini döndürmesi gerekir.
            const konuId = data.konuId; // Backend'den gelen yanıta göre bu anahtarı ayarlayın.
            if (konuId) {
                setTimeout(() => {
                    window.location.href = `/html/konu-detay.html?id=${konuId}`;
                }, 2000);
            } else {
                setTimeout(() => {
                    window.location.href = `/html/kullanici-konularim.html`; // ID gelmezse konularım sayfasına yönlendir
                }, 2000);
            }

        } catch (error) {
            showPageMessage(messageArea, `Konu oluşturulamadı: ${error.message}`, false);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Konuyu Aç';
        }
    });

    // --- Sayfa Yüklendiğinde ---
    loadArabalar();
});