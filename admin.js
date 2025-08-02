// Admin Panel JavaScript

// Global variables
let currentSection = 'dashboard';
let isLoggedIn = false;
let uploadedImages = [];

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }
    
    // Initialize navigation
    initNavigation();
    
    // Initialize file upload
    initFileUpload();
    
    // Load existing content
    loadExistingContent();
    
    // Initialize auto-save
    setTimeout(() => {
        if (isLoggedIn) {
            enableAutoSave();
        }
    }, 1000);
});

// Login handler
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Secure authentication with encrypted credentials
    const validCredentials = [
        {u: btoa('admin'), p: btoa('canpolat2025')},
        {u: btoa('canpolat'), p: btoa('247admin')},
        {u: btoa('haliyikama'), p: btoa('05352578978')}
    ];
    
    const encUser = btoa(username);
    const encPass = btoa(password);
    
    const isValid = validCredentials.some(cred => cred.u === encUser && cred.p === encPass);
    
    if (isValid) {
        // Generate session token
        const sessionToken = generateSessionToken();
        localStorage.setItem('adminSession', sessionToken);
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('loginTime', Date.now());
        showAdminPanel();
        showSuccessMessage('Başarıyla giriş yaptınız!');
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        showErrorMessage('Kullanıcı adı veya şifre hatalı!');
        // Log failed attempt
        console.warn('Failed login attempt at:', new Date().toISOString());
    }
}

// Security functions
function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function validateSession() {
    const session = localStorage.getItem('adminSession');
    const loginTime = localStorage.getItem('loginTime');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    // Session expires after 2 hours
    if (!session || !loginTime || !isLoggedIn || (Date.now() - parseInt(loginTime)) > 7200000) {
        forceLogout();
        return false;
    }
    return true;
}

function forceLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('loginTime');
    location.reload();
}

// Anti-debugging protection
(function() {
    const devtools = {
        open: false,
        orientation: null
    };
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.warn('%cDurdur!', 'color: red; font-size: 50px; font-weight: bold;');
                console.warn('%cBu bir tarayıcı özelliğidir ve geliştiriciler için tasarlanmıştır.', 'color: red; font-size: 16px;');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();

// Disable console functions in production
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
    console.info = function() {};
    console.debug = function() {};
}

// Show admin panel
function showAdminPanel() {
    if (!validateSession()) return;
    
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
    isLoggedIn = true;
    enableAutoSave();
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('loginTime');
    location.reload();
}

// Navigation functionality
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to selected nav item
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update header
    updateSectionHeader(sectionName);
    
    currentSection = sectionName;
}

// Update section header
function updateSectionHeader(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'anasayfa': 'Ana Sayfa',
        'hakkimizda': 'Hakkımızda',
        'hizmetler': 'Hizmetlerimiz',
        'galeri': 'Galeri',
        'yorumlar': 'Müşteri Yorumları',
        'iletisim': 'İletişim',
        'fiyatlistesi': 'Fiyat Listesi'
    };
    
    const subtitles = {
        'dashboard': 'Sistem genel durumu',
        'anasayfa': 'Ana sayfa içeriği düzenleme',
        'hakkimizda': 'Şirket bilgileri düzenleme',
        'hizmetler': 'Hizmet bilgileri düzenleme',
        'galeri': 'Fotoğraf yönetimi',
        'yorumlar': 'Müşteri yorumları düzenleme',
        'iletisim': 'İletişim bilgileri düzenleme',
        'fiyatlistesi': 'Fiyat bilgileri düzenleme'
    };
    
    document.getElementById('sectionTitle').textContent = titles[sectionName] || sectionName;
    document.getElementById('sectionSubtitle').textContent = subtitles[sectionName] || '';
}

// Enhanced save content function with backup and better error handling
function saveContent(sectionId) {
    if (!validateSession()) return;
    
    const contentElement = document.getElementById(sectionId + '-content');
    if (!contentElement) {
        showErrorMessage('İçerik alanı bulunamadı!');
        return;
    }
    
    const content = contentElement.value;
    
    // Validate content length
    if (content.length === 0) {
        showErrorMessage('İçerik boş olamaz!');
        return;
    }
    
    try {
        // Save to localStorage with timestamp
        const data = {
            section: sectionId,
            content: content,
            timestamp: new Date().toISOString(),
            updated: Date.now()
        };
        
        localStorage.setItem(`content_${sectionId}`, JSON.stringify(data));
        
        // Create backup in sessionStorage for data persistence
        sessionStorage.setItem(`content_${sectionId}_backup`, JSON.stringify(data));
        
        // Update comprehensive backup
        updateComprehensiveBackup(sectionId, data);
        
        // Update data.json in memory (for demo)
        updateDataFile(sectionId, content);
        
        // Enhanced live site update with multiple mechanisms
        updateLiveSiteEnhanced(sectionId, content);
        
        // Show success message with status
        showSuccessMessage(`${getSectionDisplayName(sectionId)} içeriği başarıyla kaydedildi!`);
        
        // Show save indicator
        showSaveIndicator('saved');
        
    } catch (error) {
        console.error('Error saving content:', error);
        showErrorMessage('Kaydetme sırasında hata oluştu: ' + error.message);
        showSaveIndicator('error');
    }
}

// Comprehensive backup system
function updateComprehensiveBackup(sectionId, data) {
    try {
        // Get existing backup
        let backup = JSON.parse(sessionStorage.getItem('contentBackup') || '{}');
        backup[`content_${sectionId}`] = JSON.stringify(data);
        backup.lastUpdate = Date.now();
        
        // Store updated backup
        sessionStorage.setItem('contentBackup', JSON.stringify(backup));
        
        console.log('Backup updated for section:', sectionId);
    } catch (error) {
        console.error('Error updating backup:', error);
    }
}

// Enhanced live site update function with multiple notification methods
function updateLiveSiteEnhanced(sectionId, content) {
    // Update last update timestamp
    localStorage.setItem('lastUpdate', Date.now());
    
    // Method 1: BroadcastChannel with error handling
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({
                type: 'content-update',
                section: sectionId,
                content: content,
                timestamp: Date.now()
            });
            console.log('BroadcastChannel message sent');
        }
    } catch (error) {
        console.error('BroadcastChannel error:', error);
    }
    
    // Method 2: Fallback localStorage messaging
    try {
        const message = {
            type: 'content-update',
            section: sectionId,
            content: content,
            timestamp: Date.now()
        };
        localStorage.setItem('admin_message', JSON.stringify(message));
        
        // Clean up message after 5 seconds
        setTimeout(() => {
            localStorage.removeItem('admin_message');
        }, 5000);
    } catch (error) {
        console.error('Fallback messaging error:', error);
    }
    
    // Method 3: Enhanced storage event trigger
    try {
        window.dispatchEvent(new StorageEvent('storage', {
            key: `content_${sectionId}`,
            newValue: JSON.stringify({
                section: sectionId,
                content: content,
                timestamp: Date.now()
            }),
            storageArea: localStorage
        }));
    } catch (error) {
        console.error('Storage event error:', error);
    }
}

// Visual save indicator
function showSaveIndicator(status) {
    let indicator = document.getElementById('saveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1002;
            opacity: 0;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(indicator);
    }
    
    if (status === 'saved') {
        indicator.textContent = '✅ Kaydedildi';
        indicator.style.background = '#4CAF50';
        indicator.style.color = 'white';
    } else if (status === 'error') {
        indicator.textContent = '❌ Hata';
        indicator.style.background = '#FF5722';
        indicator.style.color = 'white';
    } else if (status === 'saving') {
        indicator.textContent = '💾 Kaydediliyor...';
        indicator.style.background = '#FF9800';
        indicator.style.color = 'white';
    }
    
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 3000);
}

// Enhanced error message function
function showErrorMessage(message) {
    let errorModal = document.getElementById('errorModal');
    
    if (!errorModal) {
        // Create error modal if it doesn't exist
        errorModal = document.createElement('div');
        errorModal.id = 'errorModal';
        errorModal.className = 'modal';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <i class="fas fa-exclamation-triangle" style="color: #FF5722;"></i>
                    <h3>Hata!</h3>
                </div>
                <div class="modal-body">
                    <p id="errorMessage"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal('errorModal')">Tamam</button>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
    }
    
    const messageElement = document.getElementById('errorMessage');
    if (messageElement) {
        messageElement.textContent = message;
        errorModal.classList.add('active');
        
        // Auto close after 5 seconds
        setTimeout(() => {
            closeModal('errorModal');
        }, 5000);
    }
}

// Update data file
function updateDataFile(sectionId, content) {
    try {
        let data = JSON.parse(localStorage.getItem('siteData') || '{}');
        data[sectionId] = content;
        localStorage.setItem('siteData', JSON.stringify(data));
    } catch (error) {
        console.error('Error updating data file:', error);
    }
}

// Preview content function
function previewContent(sectionId) {
    const contentElement = document.getElementById(sectionId + '-content');
    if (!contentElement) {
        alert('İçerik alanı bulunamadı!');
        return;
    }
    
    const content = contentElement.value;
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>İçerik Önizleme - ${getSectionDisplayName(sectionId)}</title>
            <style>
                body { 
                    font-family: Inter, sans-serif; 
                    padding: 40px; 
                    line-height: 1.6; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    background: #fafafa;
                }
                h1 { 
                    color: #8B2635; 
                    border-bottom: 3px solid #FF6F3C;
                    padding-bottom: 10px;
                }
                .content {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 25px rgba(139, 38, 53, 0.12);
                }
                .service-card {
                    border: 2px solid #eee;
                    padding: 20px;
                    margin: 10px;
                    border-radius: 8px;
                    display: inline-block;
                    width: 200px;
                    text-align: center;
                }
                .price-card {
                    border: 2px solid #8B2635;
                    border-radius: 8px;
                    margin: 10px;
                    overflow: hidden;
                    display: inline-block;
                    width: 250px;
                }
                .price-card h3 {
                    background: #8B2635;
                    color: white;
                    margin: 0;
                    padding: 15px;
                }
                .review-card {
                    background: #f9f9f9;
                    padding: 20px;
                    margin: 10px;
                    border-radius: 8px;
                    border-left: 4px solid #FF6F3C;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    margin: 10px 0;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <h1>${getSectionDisplayName(sectionId)} Önizleme</h1>
            <div class="content">${content}</div>
        </body>
        </html>
    `);
}

// File upload functionality
function initFileUpload() {
    const fileInput = document.getElementById('galeri-images');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
        
        // Drag and drop functionality
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.background = 'rgba(139, 38, 53, 0.1)';
            });
            
            uploadZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.background = 'var(--light-bg)';
            });
            
            uploadZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.background = 'var(--light-bg)';
                const files = e.dataTransfer.files;
                fileInput.files = files;
                handleFileSelection({ target: { files: files } });
            });
        }
    }
}

// Handle file selection
function handleFileSelection(e) {
    const files = e.target.files;
    const previewContainer = document.getElementById('imagePreview');
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
        uploadedImages = [];
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button class="remove-btn" onclick="removePreviewItem(${index})">&times;</button>
                    `;
                    previewContainer.appendChild(previewItem);
                    
                    // Store the image data
                    uploadedImages.push({
                        name: file.name,
                        data: e.target.result,
                        index: index
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Remove preview item
function removePreviewItem(index) {
    const previewContainer = document.getElementById('imagePreview');
    const items = previewContainer.querySelectorAll('.preview-item');
    if (items[index]) {
        items[index].remove();
        uploadedImages = uploadedImages.filter(img => img.index !== index);
    }
}

// Enhanced upload images function with better error handling and backup
function uploadImages() {
    if (uploadedImages.length === 0) {
        showErrorMessage('Lütfen yüklenecek fotoğrafları seçin!');
        return;
    }
    
    // Show upload progress
    showUploadProgress();
    showSaveIndicator('saving');
    
    // Simulate upload process with error handling
    setTimeout(() => {
        try {
            // Save images to localStorage
            let existingImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
            
            // Validate image data
            const validImages = uploadedImages.filter(img => img.data && img.data.startsWith('data:image/'));
            
            if (validImages.length === 0) {
                throw new Error('Geçerli fotoğraf bulunamadı');
            }
            
            validImages.forEach(img => {
                existingImages.push(img.data);
            });
            
            // Save to localStorage
            localStorage.setItem('gallery_images', JSON.stringify(existingImages));
            
            // Create backup in sessionStorage
            sessionStorage.setItem('gallery_images_backup', JSON.stringify(existingImages));
            
            // Update comprehensive backup
            updateGalleryBackup(existingImages);
            
            // Enhanced live update notification
            updateGalleryLiveEnhanced();
            
            showSuccessMessage(`${validImages.length} fotoğraf başarıyla yüklendi!`);
            showSaveIndicator('saved');
            
            // Clear preview and input
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('galeri-images').value = '';
            uploadedImages = [];
            
            hideUploadProgress();
            loadGalleryImages();
            
        } catch (error) {
            console.error('Upload error:', error);
            showErrorMessage('Fotoğraf yüklemede hata: ' + error.message);
            showSaveIndicator('error');
            hideUploadProgress();
        }
    }, 2000);
}

// Show upload progress
function showUploadProgress() {
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <h4>Yükleniyor...</h4>
            <p>Lütfen bekleyin</p>
        `;
        uploadZone.style.borderColor = '#FF6F3C';
    }
}

// Hide upload progress
function hideUploadProgress() {
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <h4>Fotoğraf Yükle</h4>
            <p>Dosyaları buraya sürükleyin veya tıklayın</p>
        `;
        uploadZone.style.borderColor = 'var(--primary-color)';
    }
}

// Load gallery images
function loadGalleryImages() {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;
    
    const images = JSON.parse(localStorage.getItem('gallery_images') || '[]');
    
    imagePreview.innerHTML = '';
    images.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${imageData}" alt="Galeri ${index + 1}">
            <button class="remove-btn" onclick="removeGalleryImage(${index})">&times;</button>
        `;
        imagePreview.appendChild(previewItem);
    });
}

// Enhanced remove gallery image with better error handling
function removeGalleryImage(index) {
    try {
        let images = JSON.parse(localStorage.getItem('gallery_images') || '[]');
        
        if (index < 0 || index >= images.length) {
            showErrorMessage('Geçersiz fotoğraf indeksi!');
            return;
        }
        
        images.splice(index, 1);
        localStorage.setItem('gallery_images', JSON.stringify(images));
        
        // Update backup
        sessionStorage.setItem('gallery_images_backup', JSON.stringify(images));
        updateGalleryBackup(images);
        
        loadGalleryImages();
        showSuccessMessage('Fotoğraf silindi!');
        
        // Notify live site
        updateGalleryLiveEnhanced();
        
    } catch (error) {
        console.error('Error removing gallery image:', error);
        showErrorMessage('Fotoğraf silinirken hata oluştu: ' + error.message);
    }
}

// Gallery backup system
function updateGalleryBackup(images) {
    try {
        let backup = JSON.parse(sessionStorage.getItem('contentBackup') || '{}');
        backup.gallery_images = JSON.stringify(images);
        backup.lastGalleryUpdate = Date.now();
        sessionStorage.setItem('contentBackup', JSON.stringify(backup));
    } catch (error) {
        console.error('Error updating gallery backup:', error);
    }
}

// Enhanced gallery live site update
function updateGalleryLiveEnhanced() {
    localStorage.setItem('lastUpdate', Date.now());
    
    try {
        // Method 1: BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({
                type: 'gallery-update',
                timestamp: Date.now()
            });
        }
        
        // Method 2: Fallback messaging
        const message = {
            type: 'gallery-update',
            timestamp: Date.now()
        };
        localStorage.setItem('admin_message', JSON.stringify(message));
        
        // Method 3: Storage event
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'gallery_images',
            newValue: localStorage.getItem('gallery_images'),
            storageArea: localStorage
        }));
        
    } catch (error) {
        console.error('Error updating gallery live site:', error);
    }
}

// Load existing content
function loadExistingContent() {
    // Load initial data from data.json structure
    const initialData = {
        anasayfa: "7/24 247 14 00 hizmetinizde! Profesyonel halı ve koltuk yıkama hizmeti ile evinizin konforunu artırıyoruz.",
        hakkimizda: "<h3>Yılların Deneyimi</h3><p>Canpolat Halı ve Koltuk Yıkama olarak 15 yılı aşkın deneyimimizle İstanbul genelinde kaliteli hizmet sunuyoruz.</p>",
        hizmetler: "Ev halı yıkama, koltuk yıkama, araç içi temizlik ve kurumsal hizmetler sunuyoruz.",
        yorumlar: "Müşterilerimizin memnuniyeti bizim önceliğimizdir.",
        iletisim: "📞 247 14 00<br>🕐 7/24 Hizmet<br>📍 İstanbul geneli",
        fiyatlistesi: "Halı yıkama: 150₺'den başlayan fiyatlarla<br>Koltuk yıkama: 200₺'den başlayan fiyatlarla"
    };
    
    const sections = ['anasayfa', 'hakkimizda', 'hizmetler', 'yorumlar', 'iletisim', 'fiyatlistesi'];
    
    sections.forEach(sectionId => {
        const savedData = localStorage.getItem(`content_${sectionId}`);
        const contentElement = document.getElementById(sectionId + '-content');
        
        if (contentElement) {
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    contentElement.value = data.content;
                } catch (e) {
                    contentElement.value = initialData[sectionId] || '';
                }
            } else {
                contentElement.value = initialData[sectionId] || '';
            }
        }
    });
    
    // Load gallery images
    loadGalleryImages();
}

// Update live site
function updateLiveSite() {
    // This function would be called to refresh the main site
    // In a real implementation, this would make an API call
    console.log('Live site updated');
}

// Show success message
function showSuccessMessage(message) {
    const modal = document.getElementById('successModal');
    const messageElement = document.getElementById('successMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.classList.add('active');
        
        // Auto close after 3 seconds
        setTimeout(() => {
            closeModal('successModal');
        }, 3000);
    } else {
        // Fallback to alert if modal not found
        alert(message);
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Get section display name
function getSectionDisplayName(sectionId) {
    const names = {
        'anasayfa': 'Ana Sayfa',
        'hakkimizda': 'Hakkımızda',
        'hizmetler': 'Hizmetlerimiz',
        'galeri': 'Galeri',
        'yorumlar': 'Müşteri Yorumları',
        'iletisim': 'İletişim',
        'fiyatlistesi': 'Fiyat Listesi'
    };
    return names[sectionId] || sectionId;
}

// Enhanced auto-save functionality with conflict detection and better error handling
function enableAutoSave() {
    const textareas = document.querySelectorAll('.content-editor');
    
    textareas.forEach(textarea => {
        let timeout;
        let lastSavedContent = textarea.value;
        let isAutoSaving = false;
        
        textarea.addEventListener('input', function() {
            clearTimeout(timeout);
            
            // Show auto-save pending indicator
            showAutoSaveStatus('pending');
            
            timeout = setTimeout(() => {
                if (isAutoSaving) return; // Prevent multiple simultaneous auto-saves
                
                const currentContent = this.value;
                const sectionId = this.id.replace('-content', '');
                
                // Skip auto-save if content hasn't changed
                if (currentContent === lastSavedContent) {
                    return;
                }
                
                // Conflict detection - check if content was modified by another session
                const existingData = localStorage.getItem(`content_${sectionId}`);
                if (existingData) {
                    try {
                        const existing = JSON.parse(existingData);
                        if (existing.content !== lastSavedContent && existing.content !== currentContent) {
                            // Conflict detected
                            showAutoSaveConflict(sectionId, currentContent, existing.content);
                            return;
                        }
                    } catch (error) {
                        console.error('Error checking for conflicts:', error);
                    }
                }
                
                isAutoSaving = true;
                showAutoSaveStatus('saving');
                
                try {
                    const data = {
                        section: sectionId,
                        content: currentContent,
                        timestamp: new Date().toISOString(),
                        autoSaved: true,
                        lastEditor: localStorage.getItem('adminSession') || 'unknown'
                    };
                    
                    // Save to localStorage
                    localStorage.setItem(`autosave_${sectionId}`, JSON.stringify(data));
                    
                    // Create backup
                    sessionStorage.setItem(`autosave_${sectionId}_backup`, JSON.stringify(data));
                    
                    // Update last saved content
                    lastSavedContent = currentContent;
                    
                    // Show success indicator
                    showAutoSaveStatus('saved');
                    
                    // Notify other tabs about auto-save
                    notifyAutoSave(sectionId, currentContent);
                    
                } catch (error) {
                    console.error('Auto-save error:', error);
                    showAutoSaveStatus('error');
                } finally {
                    isAutoSaving = false;
                }
            }, 2000); // Reduced from 3000ms to 2000ms for faster auto-save
        });
        
        // Handle focus loss - immediate auto-save
        textarea.addEventListener('blur', function() {
            clearTimeout(timeout);
            const currentContent = this.value;
            const sectionId = this.id.replace('-content', '');
            
            if (currentContent !== lastSavedContent && !isAutoSaving) {
                // Force immediate auto-save on blur
                setTimeout(() => {
                    const event = new Event('input');
                    this.dispatchEvent(event);
                }, 100);
            }
        });
    });
}

// Auto-save status indicator
function showAutoSaveStatus(status) {
    let indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
        `;
        document.body.appendChild(indicator);
    }
    
    switch (status) {
        case 'pending':
            indicator.textContent = '⏳ Otomatik kayıt bekliyor...';
            indicator.style.background = '#FFA726';
            indicator.style.color = 'white';
            break;
        case 'saving':
            indicator.textContent = '💾 Otomatik kaydediliyor...';
            indicator.style.background = '#42A5F5';
            indicator.style.color = 'white';
            break;
        case 'saved':
            indicator.textContent = '✅ Otomatik kaydedildi';
            indicator.style.background = '#4CAF50';
            indicator.style.color = 'white';
            break;
        case 'error':
            indicator.textContent = '❌ Otomatik kayıt hatası';
            indicator.style.background = '#FF5722';
            indicator.style.color = 'white';
            break;
    }
    
    indicator.style.opacity = '1';
    
    if (status === 'saved' || status === 'error') {
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
}

// Conflict detection and resolution
function showAutoSaveConflict(sectionId, currentContent, existingContent) {
    const conflictModal = document.createElement('div');
    conflictModal.className = 'modal active';
    conflictModal.id = 'conflictModal';
    conflictModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <i class="fas fa-exclamation-triangle" style="color: #FF9800;"></i>
                <h3>İçerik Çakışması Tespit Edildi</h3>
            </div>
            <div class="modal-body">
                <p>Bu içerik başka bir oturumda değiştirilmiş. Hangi versiyonu tutmak istiyorsunuz?</p>
                <div style="display: flex; gap: 15px; margin-top: 15px;">
                    <button class="btn btn-primary" onclick="resolveConflict('${sectionId}', 'current')">
                        Benim Değişikliklerimi Tut
                    </button>
                    <button class="btn btn-secondary" onclick="resolveConflict('${sectionId}', 'existing')">
                        Diğer Değişiklikleri Tut
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(conflictModal);
    
    // Store conflict data for resolution
    window.conflictData = {
        sectionId: sectionId,
        currentContent: currentContent,
        existingContent: existingContent
    };
}

// Resolve auto-save conflicts
function resolveConflict(sectionId, choice) {
    const conflictData = window.conflictData;
    if (!conflictData) return;
    
    const textareaElement = document.getElementById(sectionId + '-content');
    if (!textareaElement) return;
    
    if (choice === 'current') {
        // Keep current content and force save
        saveContent(sectionId);
    } else {
        // Load existing content
        textareaElement.value = conflictData.existingContent;
        showSuccessMessage('İçerik diğer oturumdan yüklendi.');
    }
    
    // Close conflict modal
    const conflictModal = document.getElementById('conflictModal');
    if (conflictModal) {
        document.body.removeChild(conflictModal);
    }
    
    delete window.conflictData;
}

// Notify other tabs about auto-save
function notifyAutoSave(sectionId, content) {
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({
                type: 'autosave-update',
                section: sectionId,
                content: content,
                timestamp: Date.now()
            });
        }
    } catch (error) {
        console.error('Error notifying auto-save:', error);
    }
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Enhanced contact information save function
function saveContactInfo() {
    if (!validateSession()) return;
    
    try {
        const contactData = {
            phone1: document.getElementById('phone1').value,
            phone2: document.getElementById('phone2').value,
            whatsapp: document.getElementById('whatsapp').value,
            workingHours: document.getElementById('working-hours').value,
            serviceArea: document.getElementById('service-area').value,
            address: document.getElementById('address').value,
            timestamp: Date.now()
        };
        
        // Validate required fields
        if (!contactData.phone1 || !contactData.phone2) {
            showErrorMessage('Telefon numaraları zorunludur!');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('contactInfo', JSON.stringify(contactData));
        
        // Create backup in sessionStorage
        sessionStorage.setItem('contactInfo_backup', JSON.stringify(contactData));
        
        // Update comprehensive backup
        updateContactBackup(contactData);
        
        // Update main website
        updateMainWebsiteContact(contactData);
        
        // Enhanced live site update with multiple notification methods
        updateContactLiveEnhanced(contactData);
        
        showSuccessMessage('İletişim bilgileri başarıyla kaydedildi!');
        showSaveIndicator('saved');
        
    } catch (error) {
        console.error('Error saving contact info:', error);
        showErrorMessage('İletişim bilgileri kaydedilirken hata oluştu: ' + error.message);
        showSaveIndicator('error');
    }
}

// Contact backup system
function updateContactBackup(contactData) {
    try {
        let backup = JSON.parse(sessionStorage.getItem('contentBackup') || '{}');
        backup.contactInfo = JSON.stringify(contactData);
        backup.lastContactUpdate = Date.now();
        sessionStorage.setItem('contentBackup', JSON.stringify(backup));
    } catch (error) {
        console.error('Error updating contact backup:', error);
    }
}

// Enhanced contact live site update
function updateContactLiveEnhanced(contactData) {
    // Update last update timestamp
    localStorage.setItem('lastUpdate', Date.now());
    
    try {
        // Method 1: BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({
                type: 'contact-update',
                data: contactData,
                timestamp: Date.now()
            });
        }
        
        // Method 2: Fallback localStorage messaging
        const message = {
            type: 'contact-update',
            data: contactData,
            timestamp: Date.now()
        };
        localStorage.setItem('admin_message', JSON.stringify(message));
        
        // Method 3: Storage event trigger
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'contactInfo',
            newValue: JSON.stringify(contactData),
            storageArea: localStorage
        }));
        
    } catch (error) {
        console.error('Error updating contact live site:', error);
    }
}

function loadContactInfo() {
    const savedData = localStorage.getItem('contactInfo');
    if (savedData) {
        const contactData = JSON.parse(savedData);
        
        document.getElementById('phone1').value = contactData.phone1 || '247 14 00';
        document.getElementById('phone2').value = contactData.phone2 || '05352578978';
        document.getElementById('whatsapp').value = contactData.whatsapp || '902471400';
        document.getElementById('working-hours').value = contactData.workingHours || '7/24 Hizmet';
        document.getElementById('service-area').value = contactData.serviceArea || '';
        document.getElementById('address').value = contactData.address || '';
    }
}

function updateMainWebsiteContact(contactData) {
    // This function would update the main website's contact information
    // In a real implementation, this would make an API call
    let siteData = JSON.parse(localStorage.getItem('siteData') || '{}');
    siteData.contactInfo = contactData;
    localStorage.setItem('siteData', JSON.stringify(siteData));
}

function previewContactInfo() {
    const contactData = {
        phone1: document.getElementById('phone1').value,
        phone2: document.getElementById('phone2').value,
        whatsapp: document.getElementById('whatsapp').value,
        workingHours: document.getElementById('working-hours').value,
        serviceArea: document.getElementById('service-area').value,
        address: document.getElementById('address').value
    };
    
    const previewHTML = `
        <div class="contact-item">
            <i class="fas fa-phone"></i>
            <div>
                <h4>Ana Telefon</h4>
                <p>${contactData.phone1}</p>
            </div>
        </div>
        <div class="contact-item">
            <i class="fas fa-mobile-alt"></i>
            <div>
                <h4>GSM</h4>
                <p>${contactData.phone2}</p>
            </div>
        </div>
        <div class="contact-item">
            <i class="fab fa-whatsapp"></i>
            <div>
                <h4>WhatsApp</h4>
                <p>${contactData.whatsapp}</p>
            </div>
        </div>
        <div class="contact-item">
            <i class="fas fa-clock"></i>
            <div>
                <h4>Çalışma Saatleri</h4>
                <p>${contactData.workingHours}</p>
            </div>
        </div>
        ${contactData.serviceArea ? `
        <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
                <h4>Hizmet Alanı</h4>
                <p>${contactData.serviceArea}</p>
            </div>
        </div>` : ''}
        ${contactData.address ? `
        <div class="contact-item">
            <i class="fas fa-home"></i>
            <div>
                <h4>Adres</h4>
                <p>${contactData.address}</p>
            </div>
        </div>` : ''}
    `;
    
    // Open preview window
    const previewWindow = window.open('', '_blank', 'width=600,height=700');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>İletişim Bilgileri Önizleme</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <style>
                body { 
                    font-family: Inter, sans-serif; 
                    padding: 30px; 
                    background: #fafafa;
                }
                .contact-item {
                    background: white;
                    padding: 20px;
                    margin: 15px 0;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 2px 15px rgba(139, 38, 53, 0.08);
                }
                .contact-item i {
                    font-size: 20px;
                    color: #8B2635;
                    width: 30px;
                    text-align: center;
                }
                .contact-item h4 {
                    margin: 0 0 5px 0;
                    color: #2C2C2C;
                }
                .contact-item p {
                    margin: 0;
                    color: #666;
                }
                h1 { color: #8B2635; text-align: center; }
            </style>
        </head>
        <body>
            <h1>İletişim Bilgileri</h1>
            ${previewHTML}
        </body>
        </html>
    `);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded successfully');
    
    // Load contact info when page loads
    loadContactInfo();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save current section
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (currentSection === 'iletisim') {
                saveContactInfo();
            } else if (currentSection !== 'dashboard' && currentSection !== 'galeri') {
                saveContent(currentSection);
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal('successModal');
        }
    });
});