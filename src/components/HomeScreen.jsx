import { useState } from 'react';
import { useApp } from '../store/AppContext';
import sweetalert from 'sweetalert2';

export default function HomeScreen() {
  const { currentUser, setView, rentals, activeRentalId, requestReturn, addBalance } = useApp();

  const activeRental = rentals.find(r => r.id === activeRentalId);
  const isPending = activeRental?.status === 'pending_return';

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Günaydın' : today.getHours() < 18 ? 'İyi günler' : 'İyi akşamlar';

  const handleToggleRental = () => {
    if (activeRentalId) {
      if (isPending) {
        setView('active-rental');
      } else {
        requestReturn(activeRentalId);
        sweetalert.fire({
          title: 'Teslim Talebi',
          text: 'Teslim talebiniz oluşturuldu. Yetkili onayı bekleniyor.',
          icon: 'success',
          confirmButtonColor: '#0e5a12ff'
        });
      }
    } else {
      setView('bags');
    }
  };

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
      <div className="home-header">
        <div className="home-app-bar">
          <div className="app-logo">
            <span>🌿</span>
            <span>LockNest</span>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
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


        {/* Action Buttons */}
        <div className="action-btn-row">
          <button 
            id="home-toggle-rental-btn" 
            className="action-btn-green" 
            onClick={() => setView('bags')} 
            style={{ 
              justifyContent: 'center', 
              gap: 12, 
              background: 'var(--green-dark)',
              height: 70,
              fontSize: 18
            }}
          >
            <span style={{ fontSize: 24 }}>👜</span>
            <span>KİRALAMAYI BAŞLAT</span>
          </button>
          
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
            <div className="bag-name">LockNest Güvenli Çanta</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Masaya sabitlenebilen, eşyalarınızı koruyan akıllı kiralama çözümü.
            </p>
            <div className="bag-features">
              <span className="feature-chip">DAYANIKLI</span>
              <span className="feature-chip">LEKE TUTMAZ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
