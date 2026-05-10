let currentPoints = parseInt(localStorage.getItem('milesteenPoints')) || 0;
let activities = JSON.parse(localStorage.getItem('milesteenActivities')) || [];
let ownedRewards = JSON.parse(localStorage.getItem('milesteenRewards')) || [];

const currentPointsEl = document.getElementById('currentPoints');
const activityListEl = document.getElementById('activityList');
const simulateBtn = document.getElementById('simulateNfcBtn');
const toast = document.getElementById('toast');
const rewardModal = document.getElementById('rewardModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const resetBtn = document.getElementById('resetBtn');
const modalIcon = document.getElementById('modalIcon');
const modalDesc = document.getElementById('modalDesc');
const modalQr = document.getElementById('modalQr');
const redeemBtns = document.querySelectorAll('.redeem-btn');
const ownedRewardsArea = document.getElementById('ownedRewardsArea');
const ownedRewardsList = document.getElementById('ownedRewardsList');

// Saat formatlayıcı
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// Yeni aktivite ekleme fonksiyonu
function addActivityLog(message, isPositive = true, save = true, overrideTime = null) {
    const time = overrideTime || `Bugün, ${getCurrentTime()}`;
    
    if (save) {
        activities.unshift({ message, isPositive, time });
        localStorage.setItem('milesteenActivities', JSON.stringify(activities));
    }

    const li = document.createElement('li');
    li.className = `activity-item ${isPositive ? 'positive' : ''}`;
    
    // Checkmark SVG if positive, else 'i'
    const iconContent = isPositive 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `i`;

    li.innerHTML = `
        <div class="activity-icon">${iconContent}</div>
        <div class="activity-details">
            <p class="activity-text">${message}</p>
            <span class="activity-time">${time}</span>
        </div>
    `;
    
    // Listenin en başına ekle
    activityListEl.insertBefore(li, activityListEl.firstChild);
}

// Başlangıçta aktiviteleri yükle
function renderSavedActivities() {
    activityListEl.innerHTML = ''; 
    
    if (activities.length === 0) {
        addActivityLog("Hesap oluşturuldu ve doğrulandı.", false, true);
    } else {
        const rev = [...activities].reverse();
        rev.forEach(act => {
            addActivityLog(act.message, act.isPositive, false, act.time);
        });
    }
}

// Kazanılan ödülleri listele
function renderOwnedRewards() {
    if (ownedRewards.length === 0) {
        ownedRewardsArea.style.display = 'none';
        return;
    }
    
    ownedRewardsArea.style.display = 'block';
    ownedRewardsList.innerHTML = '';
    
    ownedRewards.forEach((reward, index) => {
        const div = document.createElement('div');
        div.style = "border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; background: #f9fafb;";
        
        let icon = '';
        let name = '';
        if (reward.type === 'starbucks') { icon = '☕'; name = 'Starbucks Kahve'; }
        else if (reward.type === 'cigkofte') { icon = '🌯'; name = 'Ömer Aybak Çiğköfte'; }
        else if (reward.type === 'pizza') { icon = '🍕'; name = "Hero's Pizza"; }
        else if (reward.type === 'starbucks3') { icon = '☕☕☕'; name = '3x Starbucks'; }
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${icon}</span>
                <span style="font-size: 0.9rem; font-weight: 600; color: var(--primary-color);">${name}</span>
            </div>
            <button class="view-qr-btn" data-type="${reward.type}" style="background: none; border: 1px solid var(--accent-color); color: var(--accent-color); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: 600;">QR Göster</button>
        `;
        ownedRewardsList.appendChild(div);
    });
    
    // Butonlara event listener ekle
    document.querySelectorAll('.view-qr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showRewardModal(e.target.dataset.type, false);
        });
    });
}

// Butonların durumunu güncelle
function updateStoreButtons() {
    redeemBtns.forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (currentPoints >= cost) {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.disabled = false;
        } else {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.disabled = true;
        }
    });
}

// Sayfa yüklendiğinde UI'ı ayarla
function initUI() {
    currentPointsEl.textContent = currentPoints;
    updateStoreButtons();
    renderSavedActivities();
    renderOwnedRewards();
}

// Toast gösterme
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Dinamik Modal Gösterimi
function showRewardModal(type, isNew = true) {
    let title = isNew ? "Tebrikler!" : "Ödülünüz";
    let descPrefix = isNew ? "Tebrikler," : "Sahip olduğunuz";
    
    if (type === 'starbucks') {
        modalIcon.innerHTML = '☕';
        modalDesc.innerHTML = `${descPrefix} <strong>Starbucks Hediye Kahve</strong> kullanabilirsiniz!`;
        modalQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=StarbucksReward';
    } else if (type === 'cigkofte') {
        modalIcon.innerHTML = '🌯';
        modalDesc.innerHTML = `${descPrefix} <strong>Ömer Aybak Çiğköfte Dürüm</strong> kullanabilirsiniz!`;
        modalQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=OmerAybakReward';
    } else if (type === 'pizza') {
        modalIcon.innerHTML = '🍕';
        modalDesc.innerHTML = `${descPrefix} <strong>Hero's Pizza Orta Boy Menü</strong> kullanabilirsiniz!`;
        modalQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HerosPizzaReward';
    } else if (type === 'starbucks3') {
        modalIcon.innerHTML = '☕☕☕';
        modalDesc.innerHTML = `${descPrefix} <strong>3 Adet Starbucks Kahve</strong> kullanabilirsiniz!`;
        modalQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Starbucks3xReward';
    }
    
    document.querySelector('#rewardModal h2').textContent = title;
    rewardModal.classList.add('show');
}

// NFC Okutma Simülasyonu (Puan Kazanma)
simulateBtn.addEventListener('click', () => {
    currentPoints++;
    localStorage.setItem('milesteenPoints', currentPoints);
    
    // Arayüzü güncelle
    currentPointsEl.textContent = currentPoints;
    updateStoreButtons();
    
    // Log ve Bildirim
    addActivityLog("Galatasaray Lisesi'nde NFC cihazı ile okutuldu. +1 Puan", true);
    showToast();
});

// Mağaza Satın Alma İşlemleri
redeemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const cost = parseInt(btn.dataset.cost);
        const type = btn.dataset.type;
        
        if (currentPoints >= cost) {
            // Puanı Düş
            currentPoints -= cost;
            localStorage.setItem('milesteenPoints', currentPoints);
            currentPointsEl.textContent = currentPoints;
            updateStoreButtons();
            
            // Ödülü Ekle
            ownedRewards.push({ type: type, date: new Date().toISOString() });
            localStorage.setItem('milesteenRewards', JSON.stringify(ownedRewards));
            renderOwnedRewards();
            
            // Modal'ı Göster ve Log Ekle
            let rewardName = '';
            if (type === 'starbucks') rewardName = 'Starbucks Kahve';
            if (type === 'cigkofte') rewardName = 'Ömer Aybak Çiğköfte';
            if (type === 'pizza') rewardName = "Hero's Pizza";
            if (type === 'starbucks3') rewardName = '3x Starbucks';
            
            addActivityLog(`${cost} Puan harcanarak "${rewardName}" satın alındı!`, true);
            showRewardModal(type, true);
        }
    });
});

// Modal Kapatma
closeModalBtn.addEventListener('click', () => {
    rewardModal.classList.remove('show');
});

// İşlemleri Sıfırlama
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm('Tüm ilerlemeyi, kazanılan puanları ve ödülleri sıfırlamak istediğinize emin misiniz?')) {
            // Verileri sıfırla
            currentPoints = 0;
            activities = [];
            ownedRewards = [];
            localStorage.removeItem('milesteenPoints');
            localStorage.removeItem('milesteenActivities');
            localStorage.removeItem('milesteenRewards');
            localStorage.removeItem('milesteenStamps'); // Eski sistemi temizlemek için
            
            // Arayüzü sıfırla
            currentPointsEl.textContent = '0';
            updateStoreButtons();
            renderOwnedRewards();
            
            // Logları temizle ve sıfırlama logu ekle
            activityListEl.innerHTML = '';
            addActivityLog("Sistem sıfırlandı. Yeni hesap oluşturuldu.", false, true);
        }
    });
}

// Sayfa başlarken
initUI();