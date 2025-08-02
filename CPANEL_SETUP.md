# cPanel Hosting Kurulum Rehberi
Canpolat Halı ve Koltuk Yıkama Web Sitesi

## 🏗️ Hızlı Kurulum Adımları

### 1. Dosya Yükleme
1. **cPanel → File Manager'a git**
2. **public_html klasörüne git**
3. **Tüm proje dosyalarını yükle**
4. **Dosya izinlerini kontrol et:**
   - Dosyalar: 644
   - Klasörler: 755
   - .htaccess: 644

### 2. Domain Konfigürasyonu
```
Ana Domain: canpolathaliyikamakayseri.com.tr
Subdomain: www.canpolathaliyikamakayseri.com.tr
```

**DNS Ayarları:**
```
A Record: @ → [Hosting IP'niz]
CNAME Record: www → canpolathaliyikamakayseri.com.tr
```

### 3. SSL Sertifikası
1. **cPanel → SSL/TLS**
2. **Let's Encrypt Free SSL** seç
3. **Domain seç ve sertifikayı aktifleştir**
4. **Force HTTPS Redirect** aktifleştir

### 4. Test ve Doğrulama
- ✅ https://www.canpolathaliyikamakayseri.com.tr/ → Ana site
- ✅ https://www.canpolathaliyikamakayseri.com.tr/admin.html → Admin panel
- ✅ HTTPS yönlendirmesi çalışıyor
- ✅ WWW yönlendirmesi çalışıyor

## 🔧 .htaccess Özellikleri

Projedeki `.htaccess` dosyası aşağıdaki özellikleri sağlar:

### Güvenlik:
- ✅ Security headers (XSS, CSRF koruması)
- ✅ Admin panel koruması
- ✅ Sensitive file blocking
- ✅ Git files blocking

### Performans:
- ✅ Gzip compression
- ✅ Browser caching
- ✅ Image hotlink protection

### SEO:
- ✅ HTTPS redirect
- ✅ WWW redirect
- ✅ Clean URLs (.html extension removal)

## 🎛️ Admin Panel Erişimi

### Güvenlik Seçenekleri:

#### Seçenek 1: IP Kısıtlaması
`.htaccess` dosyasında bu satırları aktifleştir:
```apache
<Files "admin.html">
    Require ip YOUR_IP_ADDRESS
</Files>
```

#### Seçenek 2: Şifre Koruması
1. **cPanel → Password Protect Directories**
2. **Admin.html dosyasını koru**
3. **Kullanıcı adı/şifre oluştur**

### Admin Panel URL:
- **Production:** https://www.canpolathaliyikamakayseri.com.tr/admin.html
- **Giriş:** admin / [şifre]

## 🔄 GitHub Entegrasyonu

### Otomatik Senkronizasyon:
1. **Admin Panel → GitHub Ayarları**
2. **Personal Access Token gir**
3. **Test bağlantı**
4. **Otomatik sync aktif olacak**

### Manuel Güncellemeler:
```bash
# Local değişiklikleri GitHub'a push et
git add .
git commit -m "cPanel hosting updates"
git push origin main

# Admin paneli GitHub'dan çeker ve siteyi günceller
```

## 📞 İletişim Bilgileri Güncellemesi

Admin panelinden güncellenebilir:
- **Ana Telefon:** 247 14 00
- **GSM:** 0535 257 89 78
- **WhatsApp:** 0535 257 89 78
- **Çalışma Saatleri:** 7/24 Hizmet
- **Hizmet Alanı:** [Admin panelinden ayarlanabilir]

## 🚨 Sorun Giderme

### Common Issues:

#### 1. 500 Internal Server Error
- `.htaccess` dosyasını kontrol et
- Dosya izinlerini kontrol et
- Error logs'u incele (cPanel → Error Logs)

#### 2. SSL Sertifikası Sorunu
- Domain'in nameserver'larını kontrol et
- SSL sertifikasını yeniden yükle
- HTTPS redirect'i geçici olarak kapat

#### 3. Admin Panel Erişim Sorunu
- Browser cache'i temizle
- IP restrictions'ı kontrol et
- Password protection ayarlarını kontrol et

#### 4. GitHub Sync Çalışmıyor
- Personal Access Token'ın geçerli olduğunu kontrol et
- Repository permissions'ı kontrol et
- Network bağlantısını test et

## 📈 Performans Optimizasyonu

### Otomatik Aktif:
- ✅ Gzip compression
- ✅ Browser caching
- ✅ Image optimization
- ✅ CSS/JS minification (production için)

### Manuel Optimizasyon:
1. **cPanel → File Manager**
2. **Large image files'ı compress et**
3. **Unused files'ı sil**
4. **Regular backups al**

---

## 📞 Destek İletişim

**Teknik Destek:**
- Email: [your-email@domain.com]
- Telefon: [support-phone]

**Hosting Destek:**
- cPanel hosting sağlayıcınızla iletişime geçin

---

© 2025 Canpolat Halı ve Koltuk Yıkama - cPanel Hosting Kurulum Rehberi