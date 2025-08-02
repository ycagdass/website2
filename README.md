# Canpolat Halı ve Koltuk Yıkama

🌐 **Live Website:** https://www.canpolathaliyikamakayseri.com.tr/

Profesyonel halı ve koltuk yıkama hizmeti sunan Canpolat firması için geliştirilmiş modern web sitesi.

## 🚀 Özellikler

- ✅ **Modern ve Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- ✅ **Admin Panel** - İçerik yönetim sistemi
- ✅ **Anlık Güncellemeler** - Admin panelinden yapılan değişiklikler 5 saniyede sitede görünür
- ✅ **SEO Optimizasyonu** - Arama motorları için optimize edilmiş
- ✅ **WhatsApp Entegrasyonu** - Direkt iletişim
- ✅ **Güvenli Admin Sistemi** - Şifreli giriş ve oturum yönetimi
- ✅ **cPanel Hosting Desteği** - cPanel hosting ortamı için optimize edilmiş

## 🏗️ cPanel Hosting Kurulumu

### Gereksinimler:
- cPanel hosting hesabı
- SSL sertifikası (önerilen)
- Apache web server
- PHP desteği (opsiyonel)

### 1. Dosyaları cPanel'e Yükleme

1. **File Manager'a Git**
   - cPanel → File Manager
   - public_html klasörüne git

2. **Dosyaları Yükle**
   ```
   - Tüm proje dosyalarını public_html'e yükle
   - .htaccess dosyasının yüklendiğinden emin ol
   - Dosya izinlerini kontrol et (644 for files, 755 for folders)
   ```

3. **Subdomain Oluşturma** (İsteğe bağlı)
   ```
   - cPanel → Subdomains
   - www.canpolathaliyikamakayseri.com.tr subdomain oluştur
   - Document Root: public_html/website2 (proje klasörü)
   ```

### 2. DNS Konfigürasyonu

```
Domain: canpolathaliyikamakayseri.com.tr
A Record: @ → Hosting IP'niz
CNAME Record: www → canpolathaliyikamakayseri.com.tr
```

### 3. SSL Sertifikası Kurulumu

1. **cPanel → SSL/TLS**
2. **Let's Encrypt** sertifikası aktifleştir
3. **Force HTTPS Redirect** aktifleştir

### 4. .htaccess Konfigürasyonu

Proje ile gelen `.htaccess` dosyası aşağıdaki özellikleri içerir:
- HTTPS yönlendirmesi
- WWW yönlendirmesi
- Gzip sıkıştırma
- Browser cache
- Güvenlik başlıkları
- Admin panel koruması

## 🎛️ Admin Panel

### Giriş Bilgileri:
- **URL:** https://www.canpolathaliyikamakayseri.com.tr/admin.html
- **Kullanıcı Adı:** admin
- **Şifre:** [Güvenlik için değiştirilmeli]

## 🔄 cPanel + GitHub Workflow

### Admin Panel → Site Güncellemesi

Admin panelinden yapılan değişiklikler hem cPanel hosting'de hem GitHub'da güncellenir:

1. **Admin panelinde değişiklik yap**
2. **"Kaydet" butonuna bas**
3. **cPanel site anında güncellenir**
4. **GitHub'a otomatik sync (token varsa)**
5. **Tüm açık sekmeler senkronize olur**

### Deployment İş Akışı

```
1. Development (Local) → Test
2. cPanel Upload → Production
3. GitHub Sync → Backup & Version Control
4. Admin Panel → Live Content Updates
```

## 📁 Dosya Yapısı (cPanel)

```
public_html/
├── .htaccess              # Apache konfigürasyonu
├── index.html             # Ana sayfa
├── admin.html             # Admin panel
├── style.css              # Ana stil dosyası
├── admin.css              # Admin panel stilleri
├── script.js              # Ana JavaScript (cPanel optimize)
├── admin.js               # Admin panel JavaScript
├── github-api.js          # GitHub entegrasyon API
├── data.json              # İçerik verisi
├── logo.svg               # Site logosu
├── CNAME                  # Domain konfigürasyonu
├── robots.txt             # SEO robots dosyası
├── sitemap.xml            # SEO sitemap
└── package.json           # Proje bilgileri
```

## 🔒 Güvenlik (cPanel)

### Admin Panel Koruması:
```apache
# .htaccess ile IP kısıtlaması
<Files "admin.html">
    Require ip YOUR_IP_ADDRESS
</Files>
```

### Şifre Koruması:
```apache
# .htpasswd ile şifre koruması
AuthType Basic
AuthName "Admin Area"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

## 🛠️ Teknik Detaylar

- **Framework:** Vanilla HTML5, CSS3, JavaScript
- **Hosting:** cPanel Apache Server
- **Backup:** GitHub Integration
- **Security:** .htaccess protection, encrypted credentials
- **Performance:** Gzip, caching, optimized assets
- **SEO:** Meta tags, structured data, sitemap
- **Mobile:** Responsive design, touch optimized

---

© 2025 Canpolat Halı ve Koltuk Yıkama - Tüm hakları saklıdır.

**cPanel Hosting Version** - Optimized for professional web hosting environments.

### GitHub Entegrasyonu (İsteğe Bağlı)

cPanel hosting ile GitHub senkronizasyonu için:

1. **GitHub Personal Access Token Oluştur**
   - GitHub → Settings → Developer settings → Personal access tokens
   - "repo" izni ile yeni token oluştur

2. **Admin Panelinde Token Ayarla**
   - Admin Panel → GitHub Ayarları
   - Token'ı yapıştır ve kaydet
   - Bağlantıyı test et

3. **Otomatik Senkronizasyon**
   - Admin panelinden yapılan değişiklikler GitHub'a da senkronize olur
   - Diğer kullanıcılar güncellemeleri anında görür

## ⚡ Hosting-Specific Optimizasyonlar

### cPanel Optimizasyonları:
- 📦 **Gzip Compression** - Sayfa yükleme hızı
- 🗂️ **Browser Caching** - Statik dosya cache
- 🔒 **Security Headers** - Güvenlik artırımı
- 🌐 **CORS Headers** - API erişim desteği
- 🚫 **Hotlink Protection** - Bant genişliği koruması

### Performans İyileştirmeleri:
```
- HTML/CSS/JS sıkıştırma
- Image optimization
- Lazy loading
- CDN ready structure
- Mobile-first design
```

## 🔧 Local Development (Test Ortamı)

```bash
# Repository'yi clone et
git clone https://github.com/ycagdass/website2.git
cd website2

# Local server başlat (Python)
python -m http.server 3000

# Veya Node.js ile
npx http-server . -p 3000

# Admin panel test:
# http://localhost:3000/admin.html
```
