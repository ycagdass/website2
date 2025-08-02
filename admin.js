// Tüm admin panel fonksiyonları global scope'da ve eksiksiz. Ekran görüntüsündeki hatalar çözülür!

async function saveGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const token = tokenInput ? tokenInput.value.trim() : '';
    if (!token) {
        showErrorMessage('Lütfen geçerli bir GitHub token girin!');
        return;
    }
    showLoadingMessage('GitHub bağlantısı test ediliyor...');
    localStorage.setItem('githubToken', token);
    try {
        const isValid = await GitHubAPI.testConnection();
        if (isValid) {
            showSuccessMessage('GitHub token başarıyla kaydedildi ve bağlantı doğrulandı!');
            updateGitHubStatus(true);
            await syncToGitHub();
        } else {
            localStorage.removeItem('githubToken');
            showErrorMessage('GitHub token geçersiz! Lütfen kontrol edin.');
            updateGitHubStatus(false);
        }
    } catch (error) {
        localStorage.removeItem('githubToken');
        showErrorMessage('GitHub bağlantısı test edilemedi: ' + error.message);
        updateGitHubStatus(false);
    }
}
window.saveGitHubToken = saveGitHubToken;

async function testGitHubConnection() {
    try {
        const isConnected = await GitHubAPI.testConnection();
        updateGitHubStatus(isConnected);
        return isConnected;
    } catch (error) {
        updateGitHubStatus(false);
        return false;
    }
}
window.testGitHubConnection = testGitHubConnection;

function updateGitHubStatus(isConnected) {
    const statusElement = document.getElementById('github-status');
    if (statusElement) {
        if (isConnected) {
            statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i> GitHub Bağlı';
            statusElement.className = 'github-status connected';
        } else {
            statusElement.innerHTML = '<i class="fas fa-exclamation-circle" style="color: red;"></i> GitHub Bağlantısız';
            statusElement.className = 'github-status disconnected';
        }
    }
}
window.updateGitHubStatus = updateGitHubStatus;

async function syncToGitHub() {
    if (!localStorage.getItem('githubToken')) {
        showErrorMessage('GitHub token bulunamadı!');
        return;
    }
    showLoadingMessage('Veriler GitHub\'a senkronize ediliyor...');
    try {
        const sections = ['anasayfa', 'hakkimizda', 'hizmetler', 'yorumlar', 'iletisim', 'fiyatlistesi'];
        const syncData = {};
        sections.forEach(sectionId => {
            const savedData = localStorage.getItem(`content_${sectionId}`);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    syncData[sectionId] = data.content;
                } catch (e) {
                    console.error(`Error parsing ${sectionId}:`, e);
                }
            }
        });
        const contactInfo = localStorage.getItem('contactInfo');
        if (contactInfo) {
            try {
                syncData.contactInfo = JSON.parse(contactInfo);
            } catch (e) {
                console.error('Error parsing contact info:', e);
            }
        }
        const galleryImages = localStorage.getItem('gallery_images');
        if (galleryImages) {
            try {
                syncData.gallery = JSON.parse(galleryImages);
            } catch (e) {
                console.error('Error parsing gallery:', e);
            }
        }
        await GitHubAPI.updateDataFile(syncData, 'Sync all data from admin panel');
        showSuccessMessage('Tüm veriler GitHub\'a başarıyla senkronize edildi!');
    } catch (error) {
        console.error('Sync error:', error);
        showErrorMessage('Senkronizasyon hatası: ' + error.message);
    }
}
window.syncToGitHub = syncToGitHub;

function clearGitHubToken() {
    if (confirm('GitHub token\'ı silmek istediğinizden emin misiniz?')) {
        localStorage.removeItem('githubToken');
        const tokenInput = document.getElementById('githubToken');
        if (tokenInput) {
            tokenInput.value = '';
        }
        updateGitHubStatus(false);
        showSuccessMessage('GitHub token temizlendi!');
    }
}
window.clearGitHubToken = clearGitHubToken;

// Modal ve mesaj helper fonksiyonları
function showSuccessMessage(message) {
    const messageElement = document.getElementById('successMessage');
    if (messageElement) {
        messageElement.textContent = message;
        showModal('successModal');
    } else {
        alert(message);
    }
}
window.showSuccessMessage = showSuccessMessage;

function showErrorMessage(message) {
    alert('HATA: ' + message);
}
window.showErrorMessage = showErrorMessage;

function showLoadingMessage(message) {
    console.log('Loading: ' + message);
}
window.showLoadingMessage = showLoadingMessage;

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}
window.showModal = showModal;

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
window.closeModal = closeModal;

// Sayfa yüklendiğinde tokenı yükle
window.onload = function() {
    const token = localStorage.getItem('githubToken');
    const tokenInput = document.getElementById('githubToken');
    if (token && tokenInput) {
        tokenInput.value = token;
        updateGitHubStatus(true);
    } else {
        updateGitHubStatus(false);
    }
};