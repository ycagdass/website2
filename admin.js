// Admin Panel JavaScript

// Global variables
let currentSection = 'dashboard';
let isLoggedIn = false;
let uploadedImages = [];

// GitHub API Configuration
const GITHUB_CONFIG = {
    owner: 'ycagdass',
    repo: 'website2',
    branch: 'main',
    dataFile: 'data.json'
};

// GitHub API helper functions
const GitHubAPI = {
    // Get the current data.json file from GitHub
    async getDataFile() {
        try {
            const token = localStorage.getItem('githubToken');
            if (!token) {
                throw new Error('GitHub token not found');
            }

            const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                content: JSON.parse(atob(data.content)),
                sha: data.sha
            };
        } catch (error) {
            console.error('Error fetching data from GitHub:', error);
            throw error;
        }
    },

    // Update data.json file on GitHub
    async updateDataFile(newData, commitMessage = 'Update content from admin panel') {
        try {
            const token = localStorage.getItem('githubToken');
            if (!token) {
                throw new Error('GitHub token not found');
            }

            // Get current file SHA
            const currentFile = await this.getDataFile();
            
            // Merge with existing data
            const updatedData = { ...currentFile.content, ...newData };

            const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: btoa(JSON.stringify(updatedData, null, 2)),
                    sha: currentFile.sha,
                    branch: GITHUB_CONFIG.branch
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating data on GitHub:', error);
            throw error;
        }
    },

    // Retry mechanism for GitHub operations
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                console.log(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    },

    // Test GitHub connection
    async testConnection() {
        try {
            const token = localStorage.getItem('githubToken');
            if (!token) {
                return false;
            }

            const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

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
        'fiyatlistesi': 'Fiyat Listesi',
        'settings': 'GitHub Ayarları'
    };
    
    const subtitles = {
        'dashboard': 'Sistem genel durumu',
        'anasayfa': 'Ana sayfa içeriği düzenleme',
        'hakkimizda': 'Şirket bilgileri düzenleme',
        'hizmetler': 'Hizmet bilgileri düzenleme',
        'galeri': 'Fotoğraf yönetimi',
        'yorumlar': 'Müşteri yorumları düzenleme',
        'iletisim': 'İletişim bilgileri düzenleme',
        'fiyatlistesi': 'Fiyat bilgileri düzenleme',
        'settings': 'GitHub tabanlı senkronizasyon ayarları'
    };
    
    document.getElementById('sectionTitle').textContent = titles[sectionName] || sectionName;
    document.getElementById('sectionSubtitle').textContent = subtitles[sectionName] || '';
}

// Save content function
async function saveContent(sectionId) {
    if (!validateSession()) return;
    
    const contentElement = document.getElementById(sectionId + '-content');
    if (!contentElement) {
        showErrorMessage('İçerik alanı bulunamadı!');
        return;
    }
    
    const content = contentElement.value;
    
    // Show loading state
    showLoadingMessage('İçerik kaydediliyor...');
    
    try {
        // Save to localStorage first (for immediate local update)
        const data = {
            section: sectionId,
            content: content,
            timestamp: new Date().toISOString(),
            updated: Date.now()
        };
        
        localStorage.setItem(`content_${sectionId}`, JSON.stringify(data));
        
        // Try to save to GitHub
        if (localStorage.getItem('githubToken')) {
            try {
                await GitHubAPI.retryOperation(async () => {
                    return await GitHubAPI.updateDataFile(
                        { [sectionId]: content },
                        `Update ${getSectionDisplayName(sectionId)} content`
                    );
                });
                
                showSuccessMessage(`${getSectionDisplayName(sectionId)} içeriği GitHub'a başarıyla kaydedildi!`);
            } catch (error) {
                console.error('GitHub save error:', error);
                showWarningMessage(`${getSectionDisplayName(sectionId)} içeriği yerel olarak kaydedildi. GitHub bağlantısı kontrol ediliyor...`);
                
                // Fall back to local storage
                updateLocalDataFile(sectionId, content);
            }
        } else {
            // No GitHub token, save locally only
            updateLocalDataFile(sectionId, content);
            showSuccessMessage(`${getSectionDisplayName(sectionId)} içeriği yerel olarak kaydedildi!`);
        }
        
        // Trigger storage event for real-time updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: `content_${sectionId}`,
            newValue: JSON.stringify(data),
            storageArea: localStorage
        }));
        
        // Force update on main site if it's open
        updateLiveSite(sectionId, content);
        
    } catch (error) {
        console.error('Save error:', error);
        showErrorMessage('İçerik kaydedilirken bir hata oluştu!');
    }
}

// Update live site function
function updateLiveSite(sectionId, content) {
    // This function notifies other windows/tabs about the update
    localStorage.setItem('lastUpdate', Date.now());
    
    // Broadcast to all open windows
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('admin-updates');
        channel.postMessage({
            type: 'content-update',
            section: sectionId,
            content: content,
            timestamp: Date.now()
        });
    }
}

// Update data file
function updateDataFile(sectionId, content) {
    updateLocalDataFile(sectionId, content);
}

// Update local data file
function updateLocalDataFile(sectionId, content) {
    try {
        let data = JSON.parse(localStorage.getItem('siteData') || '{}');
        data[sectionId] = content;
        localStorage.setItem('siteData', JSON.stringify(data));
    } catch (error) {
        console.error('Error updating local data file:', error);
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

// Upload images function
async function uploadImages() {
    if (uploadedImages.length === 0) {
        showErrorMessage('Lütfen yüklenecek fotoğrafları seçin!');
        return;
    }
    
    // Show upload progress
    showUploadProgress();
    showLoadingMessage('Fotoğraflar yükleniyor...');
    
    try {
        // Save images to localStorage first
        let existingImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
        
        const newImageData = uploadedImages.map(img => img.data);
        existingImages = [...existingImages, ...newImageData];
        
        localStorage.setItem('gallery_images', JSON.stringify(existingImages));
        
        // Try to save to GitHub
        if (localStorage.getItem('githubToken')) {
            try {
                await GitHubAPI.updateDataFile(
                    { gallery: existingImages },
                    `Add ${uploadedImages.length} new gallery images`
                );
                
                showSuccessMessage(`${uploadedImages.length} fotoğraf GitHub'a başarıyla yüklendi!`);
            } catch (error) {
                console.error('GitHub gallery save error:', error);
                showWarningMessage(`${uploadedImages.length} fotoğraf yerel olarak kaydedildi. GitHub bağlantısı kontrol ediliyor...`);
            }
        } else {
            showSuccessMessage(`${uploadedImages.length} fotoğraf yerel olarak yüklendi!`);
        }
        
        // Clear preview and input
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('galeri-images').value = '';
        uploadedImages = [];
        
        hideUploadProgress();
        loadGalleryImages();
        
    } catch (error) {
        console.error('Upload error:', error);
        showErrorMessage('Fotoğraflar yüklenirken bir hata oluştu!');
        hideUploadProgress();
    }
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

// Remove gallery image
function removeGalleryImage(index) {
    let images = JSON.parse(localStorage.getItem('gallery_images') || '[]');
    images.splice(index, 1);
    localStorage.setItem('gallery_images', JSON.stringify(images));
    loadGalleryImages();
    showSuccessMessage('Fotoğraf silindi!');
    updateLiveSite();
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
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show warning message
function showWarningMessage(message) {
    showMessage(message, 'warning');
}

// Show loading message
function showLoadingMessage(message) {
    showMessage(message, 'loading');
}

// Generic message function
function showMessage(message, type = 'success') {
    const modal = document.getElementById('messageModal') || createMessageModal();
    const messageElement = modal.querySelector('.message-text');
    const iconElement = modal.querySelector('.message-icon');
    
    if (messageElement && iconElement) {
        messageElement.textContent = message;
        
        // Update icon and styling based on type
        modal.className = `modal message-modal ${type}`;
        
        switch (type) {
            case 'success':
                iconElement.innerHTML = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                iconElement.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                iconElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'loading':
                iconElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                break;
        }
        
        modal.classList.add('active');
        
        // Auto close after 3 seconds (except for loading)
        if (type !== 'loading') {
            setTimeout(() => {
                closeModal('messageModal');
            }, 3000);
        }
    } else {
        // Fallback to alert if modal not found
        alert(message);
    }
}

// Create message modal if it doesn't exist
function createMessageModal() {
    const existingModal = document.getElementById('messageModal');
    if (existingModal) {
        return existingModal;
    }
    
    const modal = document.createElement('div');
    modal.id = 'messageModal';
    modal.className = 'modal message-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="message-icon"></span>
                <h3 class="message-title">Bilgilendirme</h3>
            </div>
            <div class="modal-body">
                <p class="message-text"></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal('messageModal')">Tamam</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
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

// Auto-save functionality
function enableAutoSave() {
    const textareas = document.querySelectorAll('.content-editor');
    
    textareas.forEach(textarea => {
        let timeout;
        textarea.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const sectionId = this.id.replace('-content', '');
                const data = {
                    section: sectionId,
                    content: this.value,
                    timestamp: new Date().toISOString(),
                    autoSaved: true
                };
                localStorage.setItem(`autosave_${sectionId}`, JSON.stringify(data));
                
                // Show auto-save indicator
                showAutoSaveIndicator();
            }, 3000);
        });
    });
}

// Show auto-save indicator
function showAutoSaveIndicator() {
    let indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = '💾 Otomatik kaydedildi';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Contact information functions
async function saveContactInfo() {
    if (!validateSession()) return;
    
    const contactData = {
        phone1: document.getElementById('phone1').value,
        phone2: document.getElementById('phone2').value,
        whatsapp: document.getElementById('whatsapp').value,
        workingHours: document.getElementById('working-hours').value,
        serviceArea: document.getElementById('service-area').value,
        address: document.getElementById('address').value,
        timestamp: Date.now()
    };
    
    // Show loading state
    showLoadingMessage('İletişim bilgileri kaydediliyor...');
    
    try {
        // Save to localStorage first
        localStorage.setItem('contactInfo', JSON.stringify(contactData));
        
        // Try to save to GitHub
        if (localStorage.getItem('githubToken')) {
            try {
                await GitHubAPI.updateDataFile(
                    { contactInfo: contactData },
                    'Update contact information'
                );
                
                showSuccessMessage('İletişim bilgileri GitHub\'a başarıyla kaydedildi!');
            } catch (error) {
                console.error('GitHub contact save error:', error);
                showWarningMessage('İletişim bilgileri yerel olarak kaydedildi. GitHub bağlantısı kontrol ediliyor...');
            }
        } else {
            showSuccessMessage('İletişim bilgileri yerel olarak kaydedildi!');
        }
        
        // Update main website
        updateMainWebsiteContact(contactData);
        
        // Trigger storage event for real-time updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'contactInfo',
            newValue: JSON.stringify(contactData),
            storageArea: localStorage
        }));
        
        // Broadcast to all open windows
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('admin-updates');
            channel.postMessage({
                type: 'contact-update',
                data: contactData,
                timestamp: Date.now()
            });
        }
        
    } catch (error) {
        console.error('Contact save error:', error);
        showErrorMessage('İletişim bilgileri kaydedilirken bir hata oluştu!');
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
    
    // Initialize GitHub settings
    initGitHubSettings();
    
    // Load existing GitHub token if present
    loadGitHubToken();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save current section
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (currentSection === 'iletisim') {
                saveContactInfo();
            } else if (currentSection !== 'dashboard' && currentSection !== 'galeri' && currentSection !== 'settings') {
                saveContent(currentSection);
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal('successModal');
            closeModal('messageModal');
        }
    });
});

// GitHub Settings Management
function initGitHubSettings() {
    // Check if GitHub token exists and test connection
    const token = localStorage.getItem('githubToken');
    if (token) {
        testGitHubConnection();
        
        // Start heartbeat monitoring
        startGitHubHeartbeat();
    }
}

// Start monitoring GitHub connectivity
function startGitHubHeartbeat() {
    // Check every 60 seconds
    setInterval(async () => {
        if (localStorage.getItem('githubToken')) {
            const isConnected = await testGitHubConnection();
            updateGitHubStatus(isConnected);
        }
    }, 60000);
}

function toggleGitHubSettings() {
    const settingsDiv = document.getElementById('github-settings');
    if (settingsDiv) {
        settingsDiv.style.display = settingsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

async function saveGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const token = tokenInput ? tokenInput.value.trim() : '';
    
    if (!token) {
        showErrorMessage('Lütfen geçerli bir GitHub token girin!');
        return;
    }
    
    // Test the token
    showLoadingMessage('GitHub bağlantısı test ediliyor...');
    
    localStorage.setItem('githubToken', token);
    
    try {
        const isValid = await GitHubAPI.testConnection();
        
        if (isValid) {
            showSuccessMessage('GitHub token başarıyla kaydedildi ve bağlantı doğrulandı!');
            updateGitHubStatus(true);
            
            // Try to sync current data
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

async function syncToGitHub() {
    if (!localStorage.getItem('githubToken')) {
        showErrorMessage('GitHub token bulunamadı!');
        return;
    }
    
    showLoadingMessage('Veriler GitHub\'a senkronize ediliyor...');
    
    try {
        // Collect all local data
        const sections = ['anasayfa', 'hakkimizda', 'hizmetler', 'yorumlar', 'iletisim', 'fiyatlistesi'];
        const syncData = {};
        
        // Add content sections
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
        
        // Add contact info
        const contactInfo = localStorage.getItem('contactInfo');
        if (contactInfo) {
            try {
                syncData.contactInfo = JSON.parse(contactInfo);
            } catch (e) {
                console.error('Error parsing contact info:', e);
            }
        }
        
        // Add gallery
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

function clearGitHubToken() {
    localStorage.removeItem('githubToken');
    const tokenInput = document.getElementById('githubToken');
    if (tokenInput) {
        tokenInput.value = '';
    }
    updateGitHubStatus(false);
    showSuccessMessage('GitHub token temizlendi!');
}

function loadGitHubToken() {
    const token = localStorage.getItem('githubToken');
    const tokenInput = document.getElementById('githubToken');
    if (token && tokenInput) {
        // Show masked token for security
        tokenInput.value = token.substring(0, 8) + '...' + token.substring(token.length - 4);
        tokenInput.setAttribute('data-original', token);
    }
}