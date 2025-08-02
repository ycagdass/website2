// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');
}

// Load content from GitHub or data.json
async function loadContent() {
    try {
        // Priority 1: Try to load from GitHub if possible
        const githubData = await loadFromGitHub();
        if (githubData) {
            updateContent(githubData);
            // Cache to localStorage for offline access
            cacheDataLocally(githubData);
            return;
        }
        
        // Priority 2: Load from admin panel (localStorage)
        const hasAdminData = loadFromLocalStorage();
        
        // Priority 3: Load contact info from admin panel
        loadContactInfo();
        
        // Priority 4: Try to load from JSON file (fallback)
        if (!hasAdminData) {
            try {
                const response = await fetch(`data.json?t=${Date.now()}`);
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

// Load content from GitHub
async function loadFromGitHub() {
    try {
        // Use cache-busting timestamp
        const timestamp = Date.now();
        const response = await fetch(`https://raw.githubusercontent.com/ycagdass/website2/main/data.json?t=${timestamp}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Content loaded from GitHub');
            return data;
        }
    } catch (error) {
        console.log('GitHub fetch failed:', error);
    }
    return null;
}

// Cache data locally for offline access
function cacheDataLocally(data) {
    try {
        // Cache the entire data object
        localStorage.setItem('github_cache', JSON.stringify(data));
        localStorage.setItem('github_cache_timestamp', Date.now().toString());
        
        // Also cache individual sections for compatibility
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
                const sectionData = {
                    section: key,
                    content: data[key],
                    timestamp: new Date().toISOString(),
                    fromGitHub: true
                };
                localStorage.setItem(`content_${key}`, JSON.stringify(sectionData));
            }
        });
        
        // Cache contact info separately if it exists
        if (data.contactInfo) {
            localStorage.setItem('contactInfo', JSON.stringify(data.contactInfo));
        }
        
        // Cache gallery if it exists
        if (data.gallery && Array.isArray(data.gallery)) {
            localStorage.setItem('gallery_images', JSON.stringify(data.gallery));
        }
        
    } catch (error) {
        console.error('Error caching data locally:', error);
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

// Load content when page loads
window.addEventListener('load', function() {
    loadContent();
    loadContactInfo();
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

// Auto-refresh content every 5 seconds for real-time updates
setInterval(async () => {
    // Try to load from GitHub first
    try {
        const githubData = await loadFromGitHub();
        if (githubData) {
            updateContent(githubData);
            cacheDataLocally(githubData);
            return;
        }
    } catch (error) {
        console.log('GitHub auto-refresh failed, using localStorage');
    }
    
    // Fallback to localStorage
    loadContent();
    loadContactInfo();
    
    // Check for gallery updates
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
}, 5000);

// Listen for localStorage changes (for real-time updates)
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.startsWith('content_') || e.key === 'contactInfo' || e.key === 'gallery_images')) {
        // Reload content when admin panel updates
        setTimeout(() => {
            loadContent();
            loadContactInfo();
        }, 100);
    }
});

// Listen for BroadcastChannel messages (cross-tab communication)
if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('admin-updates');
    channel.addEventListener('message', function(e) {
        if (e.data.type === 'content-update') {
            // Update specific section
            setTimeout(() => {
                loadContent();
            }, 100);
        } else if (e.data.type === 'contact-update') {
            // Update contact information
            setTimeout(() => {
                loadContactInfo();
            }, 100);
        } else if (e.data.type === 'gallery-update') {
            // Update gallery
            setTimeout(() => {
                loadContent();
            }, 100);
        }
    });
}

// Force update when window gets focus (user switches back to main site)
window.addEventListener('focus', function() {
    loadContent();
    loadContactInfo();
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