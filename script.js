// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');
}

// ==========================================
// DYNAMIC INLINE EDITING SYSTEM
// ==========================================

// Editing state management
const editingState = {
    isEditing: false,
    currentElement: null,
    originalContent: '',
    editingMode: false
};

// Initialize inline editing system
function initializeInlineEditing() {
    // Add editing controls to the page
    createEditingInterface();
    
    // Make content areas editable
    setupEditableAreas();
    
    // Load saved content
    loadSavedContent();
    
    // Set up auto-save
    setupAutoSave();
    
    console.log('✅ Dynamic inline editing system initialized');
}

// Create editing interface
function createEditingInterface() {
    // Create editing toggle button
    const editToggle = document.createElement('button');
    editToggle.id = 'edit-toggle-btn';
    editToggle.className = 'edit-toggle-btn';
    editToggle.innerHTML = `
        <i class="fas fa-edit"></i>
        <span>Düzenleme Modu</span>
    `;
    editToggle.onclick = toggleEditingMode;
    
    // Create editing toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'editing-toolbar';
    toolbar.className = 'editing-toolbar hidden';
    toolbar.innerHTML = `
        <div class="toolbar-content">
            <button onclick="saveAllContent()" class="toolbar-btn save-btn">
                <i class="fas fa-save"></i> Tümünü Kaydet
            </button>
            <button onclick="exitEditingMode()" class="toolbar-btn cancel-btn">
                <i class="fas fa-times"></i> Çıkış
            </button>
            <div class="toolbar-status">
                <span id="save-status">Otomatik kaydetme aktif</span>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(editToggle);
    document.body.appendChild(toolbar);
}

// Setup editable areas
function setupEditableAreas() {
    const editableSelectors = [
        '#hakkimizda-content',
        '#yorumlar-content', 
        '#fiyatlistesi-content',
        '.hero-subtitle',
        '#iletisim-content .contact-item:nth-child(4) p' // Service area
    ];
    
    editableSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            makeElementEditable(element);
        }
    });
}

// Make individual element editable
function makeElementEditable(element) {
    // Add editable attributes and classes
    element.setAttribute('data-editable', 'true');
    element.addEventListener('click', handleEditableClick);
    element.addEventListener('blur', handleEditableBlur);
    element.addEventListener('input', handleEditableInput);
    
    // Add visual indicator when editing mode is active
    element.classList.add('editable-area');
}

// Handle click on editable elements
function handleEditableClick(event) {
    if (!editingState.editingMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    startEditing(element);
}

// Handle blur (when element loses focus)
function handleEditableBlur(event) {
    if (!editingState.editingMode) return;
    
    const element = event.target;
    saveElementContent(element);
}

// Handle input changes
function handleEditableInput(event) {
    if (!editingState.editingMode) return;
    
    const element = event.target;
    // Auto-save after 2 seconds of no typing
    clearTimeout(element.saveTimeout);
    element.saveTimeout = setTimeout(() => {
        saveElementContent(element);
        showSaveStatus('Otomatik kaydedildi', 'success');
    }, 2000);
}

// Start editing an element
function startEditing(element) {
    if (editingState.currentElement) {
        finishEditing(editingState.currentElement);
    }
    
    editingState.currentElement = element;
    editingState.originalContent = element.innerHTML;
    
    element.contentEditable = true;
    element.classList.add('editing-active');
    element.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Finish editing an element
function finishEditing(element) {
    if (!element) return;
    
    element.contentEditable = false;
    element.classList.remove('editing-active');
    saveElementContent(element);
    
    editingState.currentElement = null;
    editingState.originalContent = '';
}

// Toggle editing mode
function toggleEditingMode() {
    editingState.editingMode = !editingState.editingMode;
    
    const toolbar = document.getElementById('editing-toolbar');
    const toggleBtn = document.getElementById('edit-toggle-btn');
    
    if (editingState.editingMode) {
        // Enter editing mode
        toolbar.classList.remove('hidden');
        toggleBtn.classList.add('active');
        document.body.classList.add('editing-mode');
        
        // Add visual indicators to editable areas
        document.querySelectorAll('[data-editable="true"]').forEach(el => {
            el.classList.add('editable-highlighted');
        });
        
        showSaveStatus('Düzenleme modu aktif - İçeriklere tıklayarak düzenleyin', 'info');
    } else {
        exitEditingMode();
    }
}

// Exit editing mode
function exitEditingMode() {
    // Finish any active editing
    if (editingState.currentElement) {
        finishEditing(editingState.currentElement);
    }
    
    editingState.editingMode = false;
    
    const toolbar = document.getElementById('editing-toolbar');
    const toggleBtn = document.getElementById('edit-toggle-btn');
    
    toolbar.classList.add('hidden');
    toggleBtn.classList.remove('active');
    document.body.classList.remove('editing-mode');
    
    // Remove visual indicators
    document.querySelectorAll('[data-editable="true"]').forEach(el => {
        el.classList.remove('editable-highlighted', 'editing-active');
        el.contentEditable = false;
    });
    
    showSaveStatus('Düzenleme modu kapatıldı', 'success');
}

// Save element content to localStorage
function saveElementContent(element) {
    const content = element.innerHTML.trim();
    const elementId = getElementIdentifier(element);
    
    if (elementId && content !== editingState.originalContent) {
        localStorage.setItem(`dynamic_content_${elementId}`, content);
        localStorage.setItem(`dynamic_content_${elementId}_timestamp`, new Date().toISOString());
        
        console.log(`💾 Saved content for ${elementId}`);
    }
}

// Get unique identifier for element
function getElementIdentifier(element) {
    if (element.id) return element.id;
    
    // Generate identifier based on element's position and content
    const parent = element.closest('section');
    if (parent && parent.id) {
        const index = Array.from(parent.querySelectorAll('[data-editable="true"]')).indexOf(element);
        return `${parent.id}_content_${index}`;
    }
    
    return null;
}

// Save all content
function saveAllContent() {
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
        saveElementContent(element);
    });
    
    showSaveStatus('Tüm içerik kaydedildi', 'success');
}

// Load saved content
function loadSavedContent() {
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
        const elementId = getElementIdentifier(element);
        if (elementId) {
            const savedContent = localStorage.getItem(`dynamic_content_${elementId}`);
            if (savedContent) {
                element.innerHTML = savedContent;
            }
        }
    });
    
    // Also load contact info and other dynamic content
    loadContactInfo();
    loadGalleryImages();
}

// Show save status
function showSaveStatus(message, type = 'info') {
    const statusElement = document.getElementById('save-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-${type}`;
        
        // Clear status after 3 seconds
        setTimeout(() => {
            if (editingState.editingMode) {
                statusElement.textContent = 'Otomatik kaydetme aktif';
                statusElement.className = '';
            }
        }, 3000);
    }
}

// Setup auto-save
function setupAutoSave() {
    // Save content every 30 seconds
    setInterval(() => {
        if (editingState.editingMode) {
            saveAllContent();
        }
    }, 30000);
}
// ==========================================
// CONTENT MANAGEMENT SYSTEM
// ==========================================

// Load content with fallback system
async function loadContent() {
    try {
        // Load from localStorage first (dynamic content)
        loadSavedContent();
        
        // Load contact information
        loadContactInfo();
        
        // Load gallery images
        loadGalleryImages();
        
        // Try to load from JSON file as fallback for static content
        try {
            const response = await fetch(`./data.json?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                updateStaticContent(data);
                showNetworkStatus('local');
            }
        } catch (error) {
            console.log('JSON file not found, using defaults');
            showNetworkStatus('offline');
        }
        
    } catch (error) {
        console.log('Loading content from localStorage');
        showNetworkStatus('offline');
    }
}

// Update static content (for non-editable areas)
function updateStaticContent(data) {
    // Update services section (static content)
    if (data.hizmetler && typeof data.hizmetler === 'string' && data.hizmetler.includes('<div class="service-card">')) {
        const servicesElement = document.getElementById('hizmetler-content');
        if (servicesElement && !servicesElement.hasAttribute('data-editable')) {
            servicesElement.innerHTML = data.hizmetler;
        }
    }
}

// Show network status indicator
function showNetworkStatus(mode) {
    let indicator = document.getElementById('networkStatusIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'networkStatusIndicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            opacity: 0.8;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        document.body.appendChild(indicator);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (indicator) {
                indicator.style.opacity = '0.3';
            }
        }, 3000);
    }
    
    switch (mode) {
        case 'local':
            indicator.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
            indicator.style.color = 'white';
            indicator.textContent = '💾 Dinamik İçerik';
            indicator.title = 'İçerik dinamik olarak yüklendi';
            break;
        case 'offline':
            indicator.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
            indicator.style.color = 'white';
            indicator.textContent = '📱 Çevrimdışı';
            indicator.title = 'Çevrimdışı mod - yerel veriler kullanılıyor';
            break;
    }
}

// Load contact information
function loadContactInfo() {
    const contactInfo = localStorage.getItem('contactInfo');
    if (contactInfo) {
        try {
            const data = JSON.parse(contactInfo);
            updateContactDisplay(data);
        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    }
}

// Update contact display
function updateContactDisplay(data) {
    // Update header phone
    const headerPhone = document.querySelector('.header-contact .phone-btn');
    if (headerPhone && data.phone2) {
        headerPhone.href = `tel:${data.phone2.replace(/\s/g, '')}`;
        headerPhone.querySelector('span').textContent = data.phone2;
    }
    
    // Update hero section
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && data.phone1 && data.phone2) {
        heroSubtitle.textContent = `7/24 ${data.phone2} & ${data.phone1} hizmetinizde! Profesyonel halı ve koltuk yıkama hizmeti.`;
    }
    
    // Update hero buttons
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons && data.phone1 && data.phone2) {
        heroButtons.innerHTML = `
            <a href="tel:${data.phone2.replace(/\s/g, '')}" class="btn btn-primary">
                <i class="fas fa-phone"></i> GSM Ara
            </a>
            <a href="tel:${data.phone1.replace(/\s/g, '')}" class="btn btn-primary">
                <i class="fas fa-phone"></i> Sabit Hat
            </a>
            <a href="#hizmetler" class="btn btn-secondary">
                <i class="fas fa-arrow-down"></i> Hizmetlerimiz
            </a>
        `;
    }
    
    // Update footer
    const footerContact = document.querySelector('.footer-contact');
    if (footerContact && data.phone1 && data.phone2) {
        footerContact.innerHTML = `
            <h4>İletişim</h4>
            <p><i class="fas fa-phone"></i> ${data.phone1}</p>
            <p><i class="fas fa-mobile-alt"></i> ${data.phone2}</p>
            <p><i class="fas fa-clock"></i> ${data.workingHours || '7/24 Hizmet'}</p>
        `;
    }
    
    // Update WhatsApp button
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn && data.whatsapp) {
        whatsappBtn.href = `https://wa.me/${data.whatsapp.replace(/\s/g, '')}`;
    }
}

// Load gallery images
function loadGalleryImages() {
    const galleryData = localStorage.getItem('gallery_images');
    if (galleryData) {
        try {
            const images = JSON.parse(galleryData);
            const gallery = document.getElementById('gallery-images');
            if (gallery && images.length > 0) {
                gallery.innerHTML = images.map(img => 
                    `<img src="${img}" alt="Canpolat Halı Yıkama Galeri" loading="lazy" onclick="openLightbox('${img}')">`
                ).join('');
            }
        } catch (e) {
            console.error('Error loading gallery:', e);
        }
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Lightbox functionality
function openLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
            <img src="${imageSrc}" alt="Galeri Görseli">
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        document.body.removeChild(lightbox);
        document.body.style.overflow = 'auto';
    }
}

// ==========================================
// PAGE INTERACTION HANDLERS
// ==========================================

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = 95;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const nav = document.querySelector('.main-nav');
                nav.classList.remove('active');
            }
        });
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]').value;
            const phone = this.querySelector('input[type="tel"]').value;
            const message = this.querySelector('textarea').value;
            
            // Create WhatsApp message
            const whatsappMessage = `Merhaba! Randevu talep ediyorum.%0A%0AAdım: ${name}%0ATelefon: ${phone}%0AMesajım: ${message}`;
            const whatsappUrl = `https://wa.me/902471400?text=${whatsappMessage}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('WhatsApp üzerinden mesajınız gönderilecek!');
            this.reset();
        });
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.service-card, .content-card, .contact-item, .review-card, .price-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize everything when page loads
window.addEventListener('load', function() {
    // Load content first
    loadContent();
    
    // Initialize inline editing system
    initializeInlineEditing();
    
    console.log('🚀 Dynamic website system initialized');
});

// Handle page focus (when user returns to tab)
window.addEventListener('focus', function() {
    loadContent();
});

// Handle visibility change for better mobile support
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadContent();
    }
});

// Clean up any old admin panel references from localStorage
function cleanupOldAdminData() {
    // Remove old admin panel keys
    const keysToRemove = ['github_cache', 'github_cache_timestamp', 'githubToken'];
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
}