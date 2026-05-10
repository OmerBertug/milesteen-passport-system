let currentStamps = parseInt(localStorage.getItem('milesteenStamps')) || 0;
const maxStamps = 2;
let activities = JSON.parse(localStorage.getItem('milesteenActivities')) || [];

const currentStampsEl = document.getElementById('currentStamps');
const stampProgressEl = document.getElementById('stampProgress');
const activityListEl = document.getElementById('activityList');
const simulateBtn = document.getElementById('simulateNfcBtn');
const toast = document.getElementById('toast');
const rewardModal = document.getElementById('rewardModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const viewRewardBtn = document.getElementById('viewRewardBtn');
const rewardActionArea = document.getElementById('rewardActionArea');
const resetBtn = document.getElementById('resetBtn');

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
        // İlk kez giriyorsa varsayılan log
        addActivityLog("Hesap oluşturuldu ve doğrulandı.", false, true);
    } else {
        // Tersten ekliyoruz ki sıralama korunsun
        const rev = [...activities].reverse();
        rev.forEach(act => {
            addActivityLog(act.message, act.isPositive, false, act.time);
        });
    }
}

// Sayfa yüklendiğinde UI'ı ayarla
function initUI() {
    currentStampsEl.textContent = currentStamps;
    stampProgressEl.style.width = `${(currentStamps / maxStamps) * 100}%`;
    
    for (let i = 1; i <= currentStamps; i++) {
        const stampSlot = document.getElementById(`stamp${i}`);
        if (stampSlot) {
            stampSlot.classList.add('filled');
            stampSlot.style.animation = 'none'; // Sayfa yüklenirken pop efekti olmasın
        }
    }
    
    if (currentStamps >= maxStamps) {
        rewardActionArea.style.display = 'block';
        simulateBtn.textContent = "Görev Tamamlandı";
        simulateBtn.disabled = true;
        simulateBtn.style.opacity = "0.5";
    }
    
    renderSavedActivities();
}

// Toast gösterme
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// NFC Okutma Simülasyonu
simulateBtn.addEventListener('click', () => {
    if (currentStamps < maxStamps) {
        currentStamps++;
        localStorage.setItem('milesteenStamps', currentStamps);
        
        // Arayüzü güncelle
        currentStampsEl.textContent = currentStamps;
        stampProgressEl.style.width = `${(currentStamps / maxStamps) * 100}%`;
        
        // Damga görselini aktif et
        const stampSlot = document.getElementById(`stamp${currentStamps}`);
        if (stampSlot) {
            stampSlot.classList.add('filled');
            stampSlot.style.animation = ''; // Animasyonu çalıştır
        }
        
        // Log ve Bildirim
        addActivityLog("Galatasaray Lisesi'nde NFC cihazı ile okutuldu. +1 Damga", true);
        showToast();

        // Ödül kontrolü
        if (currentStamps === maxStamps) {
            setTimeout(() => {
                rewardModal.classList.add('show');
                addActivityLog("Ödül Kazanıldı: Starbucks Kahve!", true);
                
                // Ödülü Göster butonunu görünür yap
                rewardActionArea.style.display = 'block';
                
                // Simülasyon butonunu devre dışı bırak
                simulateBtn.textContent = "Görev Tamamlandı";
                simulateBtn.disabled = true;
                simulateBtn.style.opacity = "0.5";
            }, 1000);
        }
    }
});

// Modal Kapatma
closeModalBtn.addEventListener('click', () => {
    rewardModal.classList.remove('show');
});

// Kazanılan Ödülü Tekrar Açma
if (viewRewardBtn) {
    viewRewardBtn.addEventListener('click', () => {
        rewardModal.classList.add('show');
    });
}

// İşlemleri Sıfırlama
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm('Tüm ilerlemeyi ve geçmişi sıfırlamak istediğinize emin misiniz?')) {
            // Verileri sıfırla
            currentStamps = 0;
            activities = [];
            localStorage.removeItem('milesteenStamps');
            localStorage.removeItem('milesteenActivities');
            
            // Arayüzü sıfırla (Damga, progress bar)
            currentStampsEl.textContent = '0';
            stampProgressEl.style.width = '0%';
            
            for (let i = 1; i <= maxStamps; i++) {
                const stampSlot = document.getElementById(`stamp${i}`);
                if (stampSlot) {
                    stampSlot.classList.remove('filled');
                    stampSlot.style.animation = 'none';
                }
            }
            
            // Butonları ve ödül alanını sıfırla
            rewardActionArea.style.display = 'none';
            simulateBtn.textContent = "NFC Okutmayı Simüle Et";
            simulateBtn.disabled = false;
            simulateBtn.style.opacity = "1";
            
            // Logları temizle ve sıfırlama logu ekle
            activityListEl.innerHTML = '';
            addActivityLog("Sistem sıfırlandı. Yeni hesap oluşturuldu.", false, true);
        }
    });
}

// Sayfa başlarken
initUI();