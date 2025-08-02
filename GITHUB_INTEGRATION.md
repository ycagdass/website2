# GitHub API Integration - Admin Panel

Bu dokümantasyon, Canpolat Halı ve Koltuk Yıkama web sitesi için GitHub API entegrasyonunun nasıl kullanılacağını açıklamaktadır.

## Özellikler

### ✅ Tamamlanan Özellikler

- **Admin Panel GitHub Ayarları**: Tam fonksiyonel GitHub entegrasyon arayüzü
- **GitHub API Bağlantısı**: Personal Access Token ile güvenli bağlantı
- **Otomatik Senkronizasyon**: 30 saniyede bir otomatik güncelleme
- **Manuel Senkronizasyon**: İsteğe bağlı anında senkronizasyon
- **Akıllı Cache Sistemi**: GitHub + localStorage hibrit yaklaşımı
- **Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı bildirimleri
- **Rate Limiting**: GitHub API limit kontrolü ve retry mantığı
- **Cross-tab İletişim**: Sekmeler arası gerçek zamanlı güncelleme

## Kullanım

### 1. Admin Panel Erişimi

```
URL: yoursite.com/admin.html
Demo Kullanıcı: admin / admin
```

### 2. GitHub Token Oluşturma

1. GitHub hesabınıza giriş yapın
2. Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
3. "Generate new token" butonuna tıklayın
4. **Gerekli izinler**: `repo` (tüm repository izinleri)
5. Token'ı kopyalayın

### 3. GitHub Entegrasyonu Kurulumu

1. Admin panelde "GitHub Ayarları" menüsüne gidin
2. GitHub Personal Access Token alanına token'ı yapıştırın
3. "Token Kaydet & Test Et" butonuna tıklayın
4. Bağlantı durumunu kontrol edin

### 4. İçerik Güncelleme İş Akışı

```
Admin Panel → Değişiklik → localStorage (anında) → GitHub (30s içinde) → Tüm Kullanıcılar (5-10s)
```

## Teknik Detaylar

### Dosya Yapısı

```
github-api.js      - GitHub API bağlantı sınıfı
admin.js          - Admin panel fonksiyonları
script.js         - Ana site güncellemek sistemi
data.json         - Merkezi veri dosyası
admin.html        - Admin panel arayüzü
```

### Veri Akışı

1. **Admin Panel**: Kullanıcı içerik değiştirir → localStorage'a anında kaydedilir
2. **Auto-sync**: 30 saniyede bir localStorage → GitHub API → data.json güncellenir
3. **Ana Site**: 5 saniyede bir GitHub'dan güncel veri kontrol edilir
4. **Fallback**: GitHub erişilemezse localStorage kullanılır

### API Limitleri

- **GitHub API**: 5000 istek/saat (autenticated)
- **Rate Limiting**: Otomatik kontrol ve bekleme
- **Retry Logic**: Exponential backoff (1s, 2s, 4s)

## Güvenlik

### Token Güvenliği

- Token'lar localStorage'da şifrelenmemiş saklanır (client-side only)
- Prodüksiyonda HTTPS kullanılmalıdır
- Token'lar minimum izinlerle oluşturulmalıdır

### İzinler

- **repo**: Repository'ye okuma/yazma erişimi
- **public_repo**: Sadece public repository'ler için alternatif

## Hata Çözümü

### Yaygın Problemler

1. **"GitHub Bağlantısız"**
   - Token'ın doğru olduğunu kontrol edin
   - Repository erişim izinlerini kontrol edin
   - API rate limit aşılmış olabilir

2. **"Senkronizasyon Hatası"**
   - İnternet bağlantısını kontrol edin
   - GitHub API durumunu kontrol edin
   - Token'ın hala geçerli olduğunu kontrol edin

3. **"Content Loading Failed"**
   - Fallback sistemi devreye girer
   - localStorage'dan içerik yüklenir
   - GitHub erişimi düzeldiğinde otomatik olarak sync olur

### Log Kontrolleri

Browser Developer Tools → Console'da aşağıdaki logları kontrol edin:

```javascript
// Başarılı GitHub bağlantısı
"GitHub bağlantısı başarılı: username"

// İçerik yüklenme durumu
"Content loaded from GitHub"
"Using recent GitHub cache"

// Rate limit durumu
"GitHub API Rate Limit - Remaining: 4999, Used: 1"
```

## Performans Optimizasyonları

### Cache Stratejisi

- **GitHub Cache**: 10 saniye cache (API çağrı azaltma)
- **localStorage Cache**: Offline erişim için
- **Metadata Karşılaştırma**: Gereksiz güncellemeler önlenir

### Network Optimizasyonu

- **Intelligent Refresh**: Sadece değişen içerik güncellenir
- **Compression**: Gzip desteği
- **CDN Ready**: Static dosyalar için hazır

## Gelişmiş Kullanım

### Manual API Calls

```javascript
// Bağlantı testi
const isConnected = await GitHubAPI.testConnection();

// Manuel sync
await GitHubAPI.updateDataFile(data, "Custom commit message");

// Health check
const status = await GitHubAPI.healthCheck();
```

### Custom Events

```javascript
// Cross-tab communication
const channel = new BroadcastChannel('admin-updates');
channel.postMessage({ type: 'github-sync', timestamp: new Date() });
```

## Bakım

### Düzenli Kontroller

- [ ] Token süre bitimi (GitHub settings'den kontrol)
- [ ] API usage (rate limit takibi)
- [ ] Log dosyaları (hata analizi)
- [ ] Cache temizliği (localStorage boyutu)

### Güncelleme Planı

- **Haftalık**: İçerik backup'ı
- **Aylık**: Token yenileme kontrolü
- **Çeyrek**: Sistem performans analizi

## Destek

### İletişim

- **GitHub Issues**: Teknik problemler için
- **Documentation**: Bu dosyayı güncel tutun
- **Monitoring**: Google Analytics veya benzeri kullanın

---

**Not**: Bu sistem production-ready durumdadır ancak güvenlik açısından HTTPS kullanımı zorunludur.