# Canpolat Halı ve Koltuk Yıkama

🌐 **Live Website:** https://www.canpolathaliyikamakayseri.com.tr/

Profesyonel halı ve koltuk yıkama hizmeti sunan Canpolat firması için geliştirilmiş **dinamik web sitesi**.

## 🚀 Yeni Özellikler (v2.0)

- ✅ **Dinamik İçerik Yönetimi** - Admin paneli olmadan direkt sayfa üzerinde düzenleme
- ✅ **Inline Editing** - İçeriklere tıklayarak anında düzenleme
- ✅ **Otomatik Kaydetme** - Değişiklikler otomatik olarak kaydedilir
- ✅ **Gerçek Zamanlı Önizleme** - Düzenlemeler anında görünür
- ✅ **Modern Kullanıcı Arayüzü** - Temiz ve kullanıcı dostu editing interface
- ✅ **LocalStorage Tabanlı** - Güvenli ve hızlı veri saklama
- ✅ **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- ✅ **SEO Optimizasyonu** - Arama motorları için optimize edilmiş

## 📝 Dinamik İçerik Yönetimi

### İçerik Düzenleme:
1. **Sağ üst köşedeki "Düzenleme Modu" butonuna tıklayın**
2. **Düzenlemek istediğiniz içeriğe tıklayın**
3. **İçeriği düzenleyin**
4. **Otomatik olarak kaydedilir veya "Tümünü Kaydet" butonunu kullanın**

### Düzenlenebilir Alanlar:
- 📄 **Hakkımızda** - Firma bilgileri ve açıklamalar
- 💬 **Müşteri Yorumları** - Müşteri deneyimleri ve değerlendirmeler
- 💰 **Fiyat Listesi** - Hizmet fiyatları ve paket bilgileri
- 📍 **Hizmet Alanı** - Hizmet verilen bölgeler
- 📞 **İletişim Bilgileri** - Telefon, adres ve çalışma saatleri

## 🔧 Teknik Özellikler

- **Framework:** Vanilla JavaScript ES6+
- **Veri Saklama:** LocalStorage API
- **Editing:** ContentEditable API
- **UI/UX:** Modern CSS3 with animations
- **Performance:** Optimize edilmiş, hızlı yükleme
- **Security:** Client-side veri şifreleme
- **Hosting:** cPanel hosting desteği

## 🎛️ Kullanım Kılavuzu

### İçerik Düzenleme:
```
1. Ana sayfayı açın
2. Sağ üstteki "Düzenleme Modu" butonuna tıklayın
3. Düzenlemek istediğiniz alana tıklayın
4. İçeriği değiştirin
5. Otomatik olarak kaydedilir
```

### Düzenleme Modundan Çıkma:
```
1. "Çıkış" butonuna tıklayın
2. Veya "Düzenleme Modu" butonuna tekrar tıklayın
```

### Tüm Değişiklikleri Kaydetme:
```
1. "Tümünü Kaydet" butonuna tıklayın
2. Tüm değişiklikler LocalStorage'a kaydedilir
```

## 📁 Dosya Yapısı

```
public_html/
├── .htaccess              # Apache konfigürasyonu
├── index.html             # Ana sayfa (dinamik içerik)
├── style.css              # Ana stil dosyası + inline editing stilleri
├── script.js              # Dinamik içerik yönetimi sistemi
├── data.json              # Statik veri dosyası (fallback)
├── logo.svg               # Site logosu
├── CNAME                  # Domain konfigürasyonu
├── robots.txt             # SEO robots dosyası
├── sitemap.xml            # SEO sitemap
└── package.json           # Proje bilgileri
```

## 🛠️ Kurulum

### 1. Dosyaları Sunucuya Yükleme
```bash
# Tüm dosyaları web sunucusunun kök dizinine yükleyin
# cPanel: public_html/
# Apache: /var/www/html/
# Nginx: /usr/share/nginx/html/
```

### 2. Gereksinimler
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript etkin
- LocalStorage desteği

### 3. Test Etme
```bash
# Local development için:
python3 -m http.server 8000

# Veya Node.js ile:
npx http-server . -p 8000

# Browser'da açın: http://localhost:8000
```

## 🔒 Güvenlik

### Veri Güvenliği:
- İçerik verileri browser'da LocalStorage ile saklanır
- Client-side şifreleme
- XSS korunması
- CSRF korunması

### .htaccess Güvenlik:
```apache
# Güvenlik başlıkları
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

## 📱 Responsive Design

- **Desktop:** Full editing experience
- **Tablet:** Touch-optimized editing
- **Mobile:** Simplified editing interface
- **Auto-adapt:** Screen size'a göre otomatik uyarlama

## ⚡ Performans Optimizasyonları

- 🗜️ **Gzip Compression** - %70 daha hızlı yükleme
- 🗂️ **Browser Caching** - Statik dosya cache
- 🚀 **Lazy Loading** - Görsel lazy loading
- 📦 **Minified CSS/JS** - Optimize edilmiş kod
- 🔄 **Auto-save Throttling** - Optimal kaydetme

## 🌐 SEO & Analytics

### SEO Özellikleri:
- Structured data (JSON-LD)
- Meta tags optimization
- OpenGraph tags
- Twitter Cards
- Canonical URLs
- XML Sitemap

### Schema.org Markup:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Canpolat Halı ve Koltuk Yıkama",
  "serviceArea": "İstanbul",
  "openingHours": "Mo-Su 00:00-23:59"
}
```

## 🔄 Versiyon Geçmişi

### v2.0.0 (Güncel) - Dinamik Sistem
- ❌ Admin panel kaldırıldı
- ✅ Inline editing sistemi eklendi
- ✅ Otomatik kaydetme
- ✅ Modern UI/UX
- ✅ Performance optimizasyonu

### v1.0.0 - Admin Panel Sistemi
- Admin panel ile içerik yönetimi
- GitHub entegrasyonu
- cPanel hosting desteği

## 🆘 Sorun Giderme

### İçerik Kaydetme Problemi:
```javascript
// Browser console'da test edin:
localStorage.setItem('test', 'working');
console.log(localStorage.getItem('test'));
```

### Düzenleme Modu Açılmıyor:
```javascript
// Console'da kontrol edin:
console.log('JavaScript enabled:', typeof window !== 'undefined');
```

### Veriler Kayboldu:
```javascript
// LocalStorage'ı kontrol edin:
Object.keys(localStorage).filter(key => key.startsWith('dynamic_content_'));
```

## 📞 Destek

**Teknik Destek:**
- Email: destek@canpolathaliyikama.com.tr
- Telefon: 0535 257 89 78

**İşletme Bilgileri:**
- Firma: Canpolat Halı ve Koltuk Yıkama
- Hizmet: 7/24 Profesyonel Temizlik
- Alan: İstanbul ve çevre ilçeler

---

© 2025 Canpolat Halı ve Koltuk Yıkama - Tüm hakları saklıdır.

**Dinamik Website v2.0** - Modern inline editing sistemli web sitesi.
