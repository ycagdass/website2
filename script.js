// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');
}

// Load content from data.json
async function loadContent() {
    try {
        // Priority 1: Load from admin panel (localStorage)
        const hasAdminData = loadFromLocalStorage();
        
        // Priority 2: Load contact info from admin panel
        loadContactInfo();
        
        // Priority 3: Try to load from JSON file (fallback)
        if (!hasAdminData) {
            try {
                const response = await fetch('data.json');
                if (response.ok) {
                    const data = await response.json();
                    updateContent(data);
                }
            } catch (error) {
                console.log('JSON file not found, using defaults');
            }
        }
    } catch (error) {
        console.log('Loading from localStorage due to:', error);
        loadFromLocalStorage();
    }
}

// Update content on page
function updateContent(data) {
    // Ana sayfa içeriği
    if (data.anasayfa) {
        const element = document.getElementById('anasayfa-content');
        if (element) element.innerHTML = data.anasayfa;
    }
    
    // Hakkımızda içeriği
    if (data.hakkimizda) {
        const element = document.getElementById('hakkimizda-content');
        if (element) element.innerHTML = data.hakkimizda;
    }
    
    // Hizmetler içeriği
    if (data.hizmetler) {
        const element = document.getElementById('hizmetler-content');
        if (element) element.innerHTML = data.hizmetler;
    }
    
    // Yorumlar içeriği
    if (data.yorumlar) {
        const element = document.getElementById('yorumlar-content');
        if (element) element.innerHTML = data.yorumlar;
    }
    
    // İletişim içeriği - Admin panelinden kontrol et
    const adminContactInfo = localStorage.getItem('contactInfo');
    if (adminContactInfo) {
        // Admin panelinden gelen iletişim bilgilerini kullan
        loadContactInfo();
    } else if (data.iletisim) {
        // Yoksa JSON'dan yükle
        const element = document.getElementById('iletisim-content');
        if (element) element.innerHTML = data.iletisim;
    }
    
    // Fiyat listesi içeriği
    if (data.fiyatlistesi) {
        const element = document.getElementById('fiyatlistesi-content');
        if (element) element.innerHTML = data.fiyatlistesi;
    }
    
    // Galeri görsellerini yükle
    if (data.gallery && Array.isArray(data.gallery)) {
        const gallery = document.getElementById('gallery-images');
        if (gallery) {
            gallery.innerHTML = data.gallery.map(img => 
                `<img src="${img}" alt="Canpolat Halı Yıkama Galeri" loading="lazy" onclick="openLightbox('${img}')">`
            ).join('');
        }
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    const sections = ['anasayfa', 'hakkimizda', 'hizmetler', 'yorumlar', 'iletisim', 'fiyatlistesi'];
    let hasData = false;
    
    sections.forEach(sectionId => {
        const savedData = localStorage.getItem(`content_${sectionId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                const element = document.getElementById(sectionId + '-content');
                if (element && data.content) {
                    // For services section, check if it's custom HTML or default
                    if (sectionId === 'hizmetler' && data.content.includes('<div class="service-card">')) {
                        element.innerHTML = data.content;
                    } else if (sectionId === 'hizmetler') {
                        // If it's not custom HTML, keep the default service cards
                        console.log('Using default service cards');
                    } else {
                        element.innerHTML = data.content;
                    }
                    hasData = true;
                }
            } catch (e) {
                console.error('Error loading content for', sectionId, e);
            }
        }
    });
    
    // Load gallery from localStorage
    const galleryData = localStorage.getItem('gallery_images');
    if (galleryData) {
        try {
            const images = JSON.parse(galleryData);
            const gallery = document.getElementById('gallery-images');
            if (gallery && images.length > 0) {
                gallery.innerHTML = images.map(img => 
                    `<img src="${img}" alt="Canpolat Halı Yıkama Galeri" loading="lazy" onclick="openLightbox('${img}')">`
                ).join('');
                hasData = true;
            }
        } catch (e) {
            console.error('Error loading gallery:', e);
        }
    }
    
    return hasData;
}

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

// Initialize enhanced monitoring system when page loads
window.addEventListener('load', function() {
    console.log('Page loaded - initializing enhanced update system');
    loadContent();
    loadContactInfo();
    initializeConnectionMonitoring();
    
    // Show initial connection status
    showConnectionStatus('Sistem hazır', 'connected');
});

// Load contact information from admin panel
function loadContactInfo() {
    const contactInfo = localStorage.getItem('contactInfo');
    if (contactInfo) {
        try {
            const data = JSON.parse(contactInfo);
            
            // Update header phone
            const headerPhone = document.querySelector('.header-contact .phone-btn');
            if (headerPhone && data.phone2) {
                headerPhone.href = `tel:${data.phone2.replace(/\s/g, '')}`;
                headerPhone.querySelector('span').textContent = data.phone2;
            }
            
            // Update hero section
            const heroSubtitle = document.getElementById('anasayfa-content');
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
            
            // Update contact section
            const contactSection = document.getElementById('iletisim-content');
            if (contactSection) {
                let contactHTML = '';
                
                if (data.phone1) {
                    contactHTML += `
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <div>
                                <h4>Ana Telefon</h4>
                                <p>${data.phone1}</p>
                            </div>
                        </div>
                    `;
                }
                
                if (data.phone2) {
                    contactHTML += `
                        <div class="contact-item">
                            <i class="fas fa-mobile-alt"></i>
                            <div>
                                <h4>GSM</h4>
                                <p>${data.phone2}</p>
                            </div>
                        </div>
                    `;
                }
                
                if (data.workingHours) {
                    contactHTML += `
                        <div class="contact-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <h4>Çalışma Saatleri</h4>
                                <p>${data.workingHours}</p>
                            </div>
                        </div>
                    `;
                }
                
                if (data.serviceArea) {
                    contactHTML += `
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <h4>Hizmet Alanı</h4>
                                <p>${data.serviceArea}</p>
                            </div>
                        </div>
                    `;
                }
                
                if (data.address) {
                    contactHTML += `
                        <div class="contact-item">
                            <i class="fas fa-home"></i>
                            <div>
                                <h4>Adres</h4>
                                <p>${data.address}</p>
                            </div>
                        </div>
                    `;
                }
                
                contactSection.innerHTML = contactHTML;
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
            
        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    }
}

// Enhanced real-time update system - faster refresh for better responsiveness
let updateInterval;
let connectionStatus = 'connected';
let lastUpdateTime = 0;

// Connection monitoring and status management
function initializeConnectionMonitoring() {
    // Check connection status
    updateConnectionStatus();
    
    // Monitor admin panel updates more frequently
    updateInterval = setInterval(() => {
        const currentTime = Date.now();
        const lastAdminUpdate = localStorage.getItem('lastUpdate');
        
        if (lastAdminUpdate && parseInt(lastAdminUpdate) > lastUpdateTime) {
            // Admin panel has new updates - refresh immediately
            refreshContent();
            lastUpdateTime = currentTime;
        } else {
            // Regular refresh for any missed updates
            refreshContent();
        }
    }, 1500); // Reduced from 5000ms to 1500ms for faster updates
}

// Enhanced content refresh function with error handling
function refreshContent() {
    try {
        loadContent();
        loadContactInfo();
        
        // Check for gallery updates with improved error handling
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
                recoverGalleryData();
            }
        }
        
        // Update connection status indicator
        updateConnectionStatus();
        
    } catch (error) {
        console.error('Error refreshing content:', error);
        handleUpdateError(error);
    }
}

// Connection status monitoring
function updateConnectionStatus() {
    const adminSession = localStorage.getItem('adminSession');
    const isAdminActive = adminSession && localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isAdminActive) {
        connectionStatus = 'admin-active';
        showConnectionStatus('Admin panel aktif', 'connected');
    } else {
        connectionStatus = 'connected';
        showConnectionStatus('Bağlantı iyi', 'connected');
    }
}

// Visual connection status indicator
function showConnectionStatus(message, status) {
    let indicator = document.getElementById('connectionStatus');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connectionStatus';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${status === 'connected' ? '#4CAF50' : '#FF5722'};
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0.8;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = `🔗 ${message}`;
    indicator.style.background = status === 'connected' ? '#4CAF50' : '#FF5722';
    
    // Auto-hide after 3 seconds
    clearTimeout(indicator.hideTimeout);
    indicator.hideTimeout = setTimeout(() => {
        if (indicator.parentNode) {
            indicator.style.opacity = '0.3';
        }
    }, 3000);
}

// Error handling and recovery
function handleUpdateError(error) {
    console.error('Update error:', error);
    showConnectionStatus('Güncelleme hatası', 'error');
    
    // Try to recover from sessionStorage backup
    recoverFromBackup();
}

// Data recovery mechanism
function recoverFromBackup() {
    try {
        const backupData = sessionStorage.getItem('contentBackup');
        if (backupData) {
            const backup = JSON.parse(backupData);
            Object.keys(backup).forEach(key => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, backup[key]);
                }
            });
            console.log('Data recovered from backup');
            refreshContent();
        }
    } catch (error) {
        console.error('Error recovering from backup:', error);
    }
}

// Gallery data recovery
function recoverGalleryData() {
    try {
        const backupGallery = sessionStorage.getItem('gallery_images_backup');
        if (backupGallery) {
            localStorage.setItem('gallery_images', backupGallery);
            refreshContent();
        }
    } catch (error) {
        console.error('Error recovering gallery data:', error);
    }
}

// Enhanced storage event handling with better reliability
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.startsWith('content_') || e.key === 'contactInfo' || e.key === 'gallery_images')) {
        console.log('Storage event detected:', e.key);
        
        // Create backup in sessionStorage for data persistence
        try {
            if (e.newValue) {
                sessionStorage.setItem(e.key + '_backup', e.newValue);
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        }
        
        // Immediate content refresh
        setTimeout(() => {
            refreshContent();
            showConnectionStatus('İçerik güncellendi', 'connected');
        }, 100);
    }
});

// Enhanced BroadcastChannel with fallback mechanism
let broadcastChannel;
let broadcastFallback = false;

try {
    if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel('admin-updates');
        
        broadcastChannel.addEventListener('message', function(e) {
            console.log('BroadcastChannel message received:', e.data);
            
            if (e.data.type === 'content-update') {
                // Update specific section immediately
                updateContentSection(e.data.section, e.data.content);
                showConnectionStatus('İçerik anında güncellendi', 'connected');
            } else if (e.data.type === 'contact-update') {
                // Update contact information immediately
                setTimeout(() => {
                    loadContactInfo();
                }, 50);
                showConnectionStatus('İletişim bilgileri güncellendi', 'connected');
            } else if (e.data.type === 'gallery-update') {
                // Update gallery immediately
                setTimeout(() => {
                    refreshContent();
                }, 50);
                showConnectionStatus('Galeri güncellendi', 'connected');
            }
        });
        
        // Monitor channel connection
        broadcastChannel.addEventListener('messageerror', function(e) {
            console.error('BroadcastChannel error:', e);
            broadcastFallback = true;
            showConnectionStatus('Kanal hatası - yedek sistem aktif', 'error');
        });
    } else {
        broadcastFallback = true;
        console.log('BroadcastChannel not supported, using fallback');
    }
} catch (error) {
    console.error('BroadcastChannel initialization error:', error);
    broadcastFallback = true;
}

// Fallback mechanism for browsers without BroadcastChannel support
if (broadcastFallback) {
    // Use localStorage as communication channel
    let lastMessageTime = 0;
    
    setInterval(() => {
        const messageData = localStorage.getItem('admin_message');
        if (messageData) {
            try {
                const message = JSON.parse(messageData);
                if (message.timestamp > lastMessageTime) {
                    lastMessageTime = message.timestamp;
                    
                    // Process message similar to BroadcastChannel
                    if (message.type === 'content-update') {
                        updateContentSection(message.section, message.content);
                        showConnectionStatus('İçerik güncellendi (yedek sistem)', 'connected');
                    } else if (message.type === 'contact-update') {
                        setTimeout(() => {
                            loadContactInfo();
                        }, 50);
                        showConnectionStatus('İletişim bilgileri güncellendi (yedek sistem)', 'connected');
                    }
                }
            } catch (error) {
                console.error('Error processing fallback message:', error);
            }
        }
    }, 500); // Check every 500ms for fallback
}

// Direct content section update function
function updateContentSection(sectionId, content) {
    const element = document.getElementById(sectionId + '-content');
    if (element) {
        if (sectionId === 'hizmetler' && content.includes('<div class="service-card">')) {
            element.innerHTML = content;
        } else if (sectionId === 'hizmetler') {
            // Keep default service cards if content is not custom HTML
            console.log('Keeping default service cards');
        } else {
            element.innerHTML = content;
        }
        
        // Add visual feedback for immediate update
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 1000);
    }
}

// Enhanced window focus handling with immediate updates
window.addEventListener('focus', function() {
    console.log('Window focused - checking for updates');
    refreshContent();
    updateConnectionStatus();
});

// WhatsApp button click tracking
document.addEventListener('DOMContentLoaded', function() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            console.log('WhatsApp button clicked');
        });
    }
});

// Service phone call tracking
document.addEventListener('DOMContentLoaded', function() {
    const phoneButtons = document.querySelectorAll('a[href^="tel:"]');
    phoneButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Phone call initiated:', this.href);
        });
    });
});