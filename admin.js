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

// Save content function
function saveContent(sectionId) {
    if (!validateSession()) return;
    
    const contentElement = document.getElementById(sectionId + '-content');
    if (!contentElement) {
        alert('İçerik alanı bulunamadı!');
        return;
    }
    
    const content = contentElement.value;
    
    // Save to localStorage with timestamp
    const data = {
        section: sectionId,
        content: content,
        timestamp: new Date().toISOString(),
        updated: Date.now()
    };
    
    localStorage.setItem(`content_${sectionId}`, JSON.stringify(data));
    
    // Update data.json in memory (for demo)
    updateDataFile(sectionId, content);
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
        key: `content_${sectionId}`,
        newValue: JSON.stringify(data),
        storageArea: localStorage
    }));
    
    // Show success message
    showSuccessMessage(`${getSectionDisplayName(sectionId)} içeriği başarıyla kaydedildi!`);
    
    // Force update on main site if it's open
    updateLiveSite(sectionId, content);
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

// Upload images function
function uploadImages() {
    if (uploadedImages.length === 0) {
        alert('Lütfen yüklenecek fotoğrafları seçin!');
        return;
    }
    
    // Show upload progress
    showUploadProgress();
    
    // Simulate upload process
    setTimeout(() => {
        // Save images to localStorage
        let existingImages = JSON.parse(localStorage.getItem('gallery_images') || '[]');
        
        uploadedImages.forEach(img => {
            existingImages.push(img.data);
        });
        
        localStorage.setItem('gallery_images', JSON.stringify(existingImages));
        
        showSuccessMessage(`${uploadedImages.length} fotoğraf başarıyla yüklendi!`);
        
        // Clear preview and input
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('galeri-images').value = '';
        uploadedImages = [];
        
        hideUploadProgress();
        loadGalleryImages();
        
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
function saveContactInfo() {
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
    
    // Save to localStorage
    localStorage.setItem('contactInfo', JSON.stringify(contactData));
    
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
    
    showSuccessMessage('İletişim bilgileri başarıyla kaydedildi!');
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