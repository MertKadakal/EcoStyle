import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatElapsed, calcFee } from '../utils/helpers';
import sweetalert from 'sweetalert2';
import QRScanner from './QRScanner';

export default function HomeScreen() {
  const { currentUser, setView, rentals, activeRentalId, tick, addBalance } = useApp();
  const [isScanning, setIsScanning] = useState(false);

  const activeRental = rentals.find(r => r.id === activeRentalId);
  const isPending = activeRental?.status === 'pending_return';
  const stopTime = isPending ? activeRental.returnRequestTime : undefined;
  const end = stopTime || Date.now();
  const elapsed = activeRental ? Math.floor((end - activeRental.startTime) / 1000) : 0;
  const currentFee = activeRental ? calcFee(activeRental.startTime, stopTime) : 0;

  const today = new Date();
  const timeStr = today.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const greeting = today.getHours() < 12 ? 'Günaydın' : today.getHours() < 18 ? 'İyi günler' : 'İyi akşamlar';

  const handleAddBalance = () => {
    sweetalert.fire({
      title: 'Bakiye Yükle',
      text: 'Yüklenecek tutarı (TL) girin:',
      input: 'number',
      inputAttributes: {
        min: 0,
        step: 0.01
      },
      showCancelButton: true,
      confirmButtonText: 'Yükle',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#0e5a12ff',
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return 'Lütfen geçerli bir tutar giriniz!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const amount = parseFloat(result.value);
        addBalance(amount);
        sweetalert.fire('Başarılı!', `${amount} TL bakiyenize eklendi.`, 'success');
      }
    });
  };

  return (
    <div className="screen animate-fadeInUp">
      {isScanning && <QRScanner onClose={() => setIsScanning(false)} />}

      <div className="home-header">
        <div className="home-app-bar">
          <div className="app-logo">
            <span>🌿</span>
            <span>EcoStyle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              id="home-qr-header-btn" 
              onClick={() => setIsScanning(true)}
              style={{ background: 'var(--green-pale)', border: 'none', cursor: 'pointer', fontSize: 18, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}
            >
              📷
            </button>
            <button id="home-notif-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>🔔</button>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sürdürülebilir bir gelecek için bugün ne yapıyoruz?</p>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {/* Wallet */}
        <div className="wallet-card">
          <div className="wallet-label">
            <span>💳</span> CÜZDAN BAKİYESİ
          </div>
          <div className="wallet-amount">{currentUser.balance} TL</div>
        </div>

        {/* Active Rental Alert */}
        {activeRental && activeRental.status !== 'completed' && activeRental.status !== 'cancelled' && (
          <div
            id="home-active-rental-banner"
            onClick={() => setView('active-rental')}
            style={{
              background: 'linear-gradient(135deg, #FF8A00, #FF5733)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              marginBottom: 12,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginBottom: 2 }}>AKTİF KİRALAMA</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{activeRental.bagName}</div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, marginTop: 2 }}>{formatElapsed(elapsed)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Biriken Ücret</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{currentFee} TL</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Görüntüle →</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-btn-row">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button id="home-scan-btn" className="action-btn-green" onClick={() => setIsScanning(true)} style={{ justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📷</span>
              <span>QR TARA</span>
            </button>
            <button id="home-rent-btn" className="action-btn-green" onClick={() => setView('bags')} style={{ justifyContent: 'center', gap: 10, background: 'var(--green-dark)' }}>
              <span style={{ fontSize: 18 }}>👜</span>
              <span>LİSTELE</span>
            </button>
          </div>
          <button id="home-balance-btn" className="action-btn-cream" onClick={handleAddBalance}>
            <span>➕</span>
            <span>BAKİYE YÜKLE</span>
          </button>
        </div>

        {/* Bag Model Showcase */}
        <div className="section-header" style={{ marginTop: 8 }}>
          <span className="section-title">Çanta Modeli</span>
          <button id="home-see-all-btn" className="see-all" onClick={() => setView('bags')}>Tümünü Gör</button>
        </div>

        <div className="bag-showcase">
          <div className="bag-image">
            <span style={{ fontSize: 80 }}>👜</span>
            <div className="bag-type-badge">STANDART</div>
          </div>
          <div className="bag-info">
            <div className="bag-name">Dayanıklı Kanvas Çanta</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              %100 geri dönüştürülmüş pamuktan üretilen günlük kullanım dostu.
            </p>
            <div className="bag-features">
              <span className="feature-chip">DAYANIKLI</span>
              <span className="feature-chip">LEKE TUTMAZ</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🌱</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>
              {currentUser.rentalHistory?.length || 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Toplam Kiralama</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>♻️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>
              {(currentUser.rentalHistory?.length || 0) * 2} kg
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CO₂ Tasarrufu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
