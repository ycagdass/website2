// Tüm admin panel fonksiyonları global scope'da ve eksiksiz. Ekran görüntüsündeki hatalar çözülür!

// Toggle token visibility
function toggleTokenVisibility() {
    const tokenInput = document.getElementById('githubToken');
    const visibilityIcon = document.getElementById('tokenVisibilityIcon');
    
    if (tokenInput && visibilityIcon) {
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            visibilityIcon.className = 'fas fa-eye-slash';
        } else {
            tokenInput.type = 'password';
            visibilityIcon.className = 'fas fa-eye';
        }
    }
}
window.toggleTokenVisibility = toggleTokenVisibility;

async function saveGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const token = tokenInput ? tokenInput.value.trim() : '';
    if (!token) {
        showErrorMessage('Lütfen geçerli bir GitHub token girin!');
        return;
    }
    
    // Validate token format
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showErrorMessage('GitHub token formatı geçersiz! Token "ghp_" veya "github_pat_" ile başlamalıdır.');
        return;
    }
    
    showLoadingMessage('GitHub bağlantısı test ediliyor...');
    localStorage.setItem('githubToken', token);
    
    try {
        const isValid = await GitHubAPI.testConnection();
        if (isValid) {
            showSuccessMessage('GitHub token başarıyla kaydedildi ve bağlantı doğrulandı!');
            updateGitHubStatus(true);
            updateLastSyncTime();
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
    const token = localStorage.getItem('githubToken');
    if (!token) {
        showErrorMessage('Önce GitHub token\'ı kaydetmelisiniz!');
        return;
    }
    
    showLoadingMessage('GitHub bağlantısı test ediliyor...');
    
    try {
        const isConnected = await GitHubAPI.testConnection();
        updateGitHubStatus(isConnected);
        
        if (isConnected) {
            showSuccessMessage('GitHub bağlantısı başarılı!');
        } else {
            showErrorMessage('GitHub bağlantısı başarısız!');
        }
        
        return isConnected;
    } catch (error) {
        updateGitHubStatus(false);
        showErrorMessage('GitHub bağlantı testi hatası: ' + error.message);
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
    
    // Update sync button state
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
        syncButton.disabled = !isConnected;
        if (!isConnected) {
            syncButton.title = 'GitHub bağlantısı gerekli';
        } else {
            syncButton.title = 'Verileri GitHub\'a senkronize et';
        }
    }
}
window.updateGitHubStatus = updateGitHubStatus;

function updateLastSyncTime(timestamp = null) {
    const lastSyncElement = document.getElementById('lastSyncTime');
    if (lastSyncElement) {
        const time = timestamp || new Date();
        lastSyncElement.textContent = time.toLocaleString('tr-TR');
    }
}
window.updateLastSyncTime = updateLastSyncTime;

async function syncToGitHub() {
    if (!localStorage.getItem('githubToken')) {
        showErrorMessage('GitHub token bulunamadı!');
        return;
    }
    
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
        syncButton.classList.add('syncing');
        syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Senkronize Ediliyor...';
        syncButton.disabled = true;
    }
    
    showLoadingMessage('Veriler GitHub\'a senkronize ediliyor...');
    
    try {
        const sections = ['anasayfa', 'hakkimizda', 'hizmetler', 'yorumlar', 'iletisim', 'fiyatlistesi'];
        const syncData = {
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            lastUpdated: new Date().toISOString()
        };
        
        // Collect content data
        sections.forEach(sectionId => {
            const savedData = localStorage.getItem(`content_${sectionId}`);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    syncData[sectionId] = data.content;
                } catch (e) {
                    console.error(`Error parsing ${sectionId}:`, e);
                    syncData[sectionId] = "";
                }
            } else {
                syncData[sectionId] = "";
            }
        });
        
        // Collect contact info
        const contactInfo = localStorage.getItem('contactInfo');
        if (contactInfo) {
            try {
                syncData.contactInfo = JSON.parse(contactInfo);
            } catch (e) {
                console.error('Error parsing contact info:', e);
                syncData.contactInfo = {};
            }
        }
        
        // Collect gallery images
        const galleryImages = localStorage.getItem('gallery_images');
        if (galleryImages) {
            try {
                syncData.gallery = JSON.parse(galleryImages);
            } catch (e) {
                console.error('Error parsing gallery:', e);
                syncData.gallery = [];
            }
        } else {
            // Keep existing gallery data if no admin gallery is set
            syncData.gallery = [
                "https://via.placeholder.com/400x300/8B2635/ffffff?text=Halı+Yıkama+1",
                "https://via.placeholder.com/400x300/FF6F3C/ffffff?text=Koltuk+Yıkama+1",
                "https://via.placeholder.com/400x300/FF8C42/ffffff?text=Araç+İçi+1",
                "https://via.placeholder.com/400x300/8B2635/ffffff?text=Halı+Yıkama+2",
                "https://via.placeholder.com/400x300/FF6F3C/ffffff?text=Koltuk+Yıkama+2",
                "https://via.placeholder.com/400x300/FF8C42/ffffff?text=Araç+İçi+2"
            ];
        }
        
        await GitHubAPI.updateDataFile(syncData, 'Update website content from admin panel');
        showSuccessMessage('Tüm veriler GitHub\'a başarıyla senkronize edildi!');
        updateLastSyncTime();
        
        // Broadcast update to main site
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({ type: 'github-sync', timestamp: new Date() });
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showErrorMessage('Senkronizasyon hatası: ' + error.message);
    } finally {
        // Reset sync button
        if (syncButton) {
            syncButton.classList.remove('syncing');
            syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Manuel Senkronizasyon';
            syncButton.disabled = false;
        }
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
        
        // Clear last sync time
        const lastSyncElement = document.getElementById('lastSyncTime');
        if (lastSyncElement) {
            lastSyncElement.textContent = '-';
        }
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
    // Could be enhanced with a loading modal in the future
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

// Initialize GitHub settings on page load
function initializeGitHubSettings() {
    const token = localStorage.getItem('githubToken');
    const tokenInput = document.getElementById('githubToken');
    
    if (token && tokenInput) {
        tokenInput.value = token;
        // Test connection on load
        testGitHubConnection();
    } else {
        updateGitHubStatus(false);
    }
    
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('lastGitHubSync');
    if (lastSync) {
        updateLastSyncTime(new Date(lastSync));
    }
}

// Auto-sync functionality
let autoSyncInterval;

function startAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    // Auto-sync every 30 seconds if GitHub token is available
    autoSyncInterval = setInterval(async () => {
        const token = localStorage.getItem('githubToken');
        if (token) {
            try {
                const isConnected = await GitHubAPI.testConnection();
                if (isConnected) {
                    await syncToGitHub();
                }
            } catch (error) {
                console.log('Auto-sync failed:', error);
                // Don't show error messages for auto-sync failures
            }
        }
    }, 30000); // 30 seconds
}

function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

// Page load initialization
window.addEventListener('load', function() {
    initializeGitHubSettings();
    startAutoSync();
    initializeNavigation();
});

// Initialize navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    
    // Hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update header
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Sistem genel durumu' },
        'anasayfa': { title: 'Ana Sayfa', subtitle: 'Anasayfa içerik yönetimi' },
        'hakkimizda': { title: 'Hakkımızda', subtitle: 'Hakkımızda bölümü düzenleme' },
        'hizmetler': { title: 'Hizmetlerimiz', subtitle: 'Hizmetler bölümü yönetimi' },
        'galeri': { title: 'Galeri', subtitle: 'Görsel galerisi yönetimi' },
        'yorumlar': { title: 'Yorumlar', subtitle: 'Müşteri yorumları yönetimi' },
        'iletisim': { title: 'İletişim', subtitle: 'İletişim bilgileri düzenleme' },
        'fiyatlistesi': { title: 'Fiyat Listesi', subtitle: 'Hizmet fiyatları yönetimi' },
        'settings': { title: 'GitHub Ayarları', subtitle: 'GitHub entegrasyonu ve senkronizasyon' }
    };
    
    if (titles[sectionName]) {
        if (sectionTitle) sectionTitle.textContent = titles[sectionName].title;
        if (sectionSubtitle) sectionSubtitle.textContent = titles[sectionName].subtitle;
    }
}

window.showSection = showSection;
window.initializeNavigation = initializeNavigation;

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    stopAutoSync();
});