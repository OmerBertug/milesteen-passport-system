let currentStamps = 0;
const maxStamps = 2;

const currentStampsEl = document.getElementById('currentStamps');
const stampProgressEl = document.getElementById('stampProgress');
const activityListEl = document.getElementById('activityList');
const simulateBtn = document.getElementById('simulateNfcBtn');
const toast = document.getElementById('toast');
const rewardModal = document.getElementById('rewardModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const viewRewardBtn = document.getElementById('viewRewardBtn');
const rewardActionArea = document.getElementById('rewardActionArea');

// Saat formatlayıcı
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// Yeni aktivite ekleme fonksiyonu
function addActivityLog(message, isPositive = true) {
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
            <span class="activity-time">Bugün, ${getCurrentTime()}</span>
        </div>
    `;
    
    // Listenin en başına ekle
    activityListEl.insertBefore(li, activityListEl.firstChild);
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
        
        // Arayüzü güncelle
        currentStampsEl.textContent = currentStamps;
        stampProgressEl.style.width = `${(currentStamps / maxStamps) * 100}%`;
        
        // Damga görselini aktif et
        const stampSlot = document.getElementById(`stamp${currentStamps}`);
        if (stampSlot) {
            stampSlot.classList.add('filled');
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