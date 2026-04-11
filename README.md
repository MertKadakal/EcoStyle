# 🌿 EcoStyle - Akıllı Çanta Kiralama Sistemi

EcoStyle, kütüphaneler, kafeler ve ortak çalışma alanları gibi toplu kullanım alanları için tasarlanmış, çevre dostu ve modern bir çanta kiralama yönetim sistemidir. Kullanıcıların ihtiyaç duydukları anlarda çanta kiralamalarını sağlarken, işletmelerin kiralama süreçlerini kolayca yönetmesine olanak tanır.

## ✨ Temel Özellikler

### 👤 Kullanıcı Paneli
- **Hızlı Kayıt ve Giriş:** Firebase Auth tabanlı güvenli kimlik doğrulama.
- **Canlı Kiralama Takibi:** Kiralama süresini ve biriken ücreti anlık olarak gösteren canlı sayaç (Live Counter).
- **Lokasyon Bazlı Seçim:** Farklı noktalardaki (Kütüphane, Kafe vb.) müsait çantaları görüntüleme ve kiralama.
- **Dinamik Fiyatlandırma:** Her 30 dakikada bir güncellenen otomatik ücret hesaplama (Standart: 15 TL / 30 dk).
- **Dijital Cüzdan:** Kullanıcı bakiyesi üzerinden kiralama sonu otomatik tahsilat sistemi.

### 🛠️ Admin (Yönetici) Paneli
- **Operasyonel Dashboard:** Aktif, gecikmiş ve teslim bekleyen kiralamaların gerçek zamanlı takibi.
- **Kullanıcı Yönetimi:** Yeni kullanıcı ekleme, mevcut kullanıcıları silme ve bakiye kontrolü.
- **Envanter ve Lokasyon Yönetimi:** Yeni çanta tanımlama ve kiralama noktaları oluşturma.
- **Gelişmiş Filtreleme:** Tarih aralığına göre kiralama geçmişi sorgulama ve raporlama.
- **Gelir Takibi:** Toplam ve dönemsel gelir raporları.

## 🚀 Teknoloji Yığını

- **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **State Yönetimi:** React Context API
- **Backend/Database:** [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **UI & UX:** Custom Vanilla CSS (Modern, Premium & Responsive Design)
- **Bildirimler:** [SweetAlert2](https://sweetalert2.github.io/)

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/MertKadakal/EcoStyle.git
   cd EcoStyle
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme modunda çalıştırın:**
   ```bash
   npm run dev
   ```

4. **Üretim (Production) build'i oluşturun:**
   ```bash
   npm run build
   ```

## 📱 Mobil Uyumluluk (Capacitor)

Proje, Capacitor entegrasyonu sayesinde native mobil uygulama olarak da çalışabilmektedir.

- **Android için:** `npm run cap:android`
- **iOS için:** `npm run cap:ios`
- **Senkronizasyon:** Değişikliklerden sonra `npm run cap:build` komutunu kullanarak web build'ini mobil platformlara aktarabilirsiniz.

## 🎨 Tasarım Anlayışı

EcoStyle, "Eco-Friendly" (Çevre Dostu) bir estetik ile tasarlanmıştır:
- **Renk Paleti:** Koyu yeşil tonları (`var(--green-dark)`), krem rengi arka planlar (`var(--cream)`) ve dikkat çekici vurgu renkleri.
- **Animasyonlar:** Pürüzsüz geçişler, `fadeInUp` animasyonları ve interaktif buton efektleri.
- **Responsive:** Tüm ekran boyutlarıyla tam uyumlu, mobile-first yaklaşımı.

---
*Geliştiren: [Mert Kadakal](https://github.com/MertKadakal)*
