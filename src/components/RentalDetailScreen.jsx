import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatElapsed, calcFee } from '../utils/helpers';

export default function RentalDetailScreen() {
  const { selectedBag, selectedLocation, setView, startRental, tick, activeRentalId, currentUser, canStartRental } = useApp();
  const [confirming, setConfirming] = useState(false);

  if (!selectedBag) {
    setView('bags');
    return null;
  }

  const previewFee = 15; // first 30 min
  const UNIT_RATE = 15;

  const handleStart = () => {
    if (activeRentalId) return;
    setConfirming(true);
    setTimeout(() => {
      startRental(selectedBag.id);
    }, 600);
  };

  return (
    <div className="screen animate-fadeInUp">
      {/* Header */}
      <div className="page-header" style={{ background: 'var(--cream)' }}>
        <button id="detail-back-btn" className="back-btn" onClick={() => setView(canStartRental ? 'home' : 'bags')}>‹ Geri</button>
        <div className="page-title">Kiralama Detayı</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Bag Hero */}
      <div className="detail-image-hero">
        <span style={{ fontSize: 90, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>👜</span>
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
          height: 60
        }} />
        <div className="bag-type-badge">{selectedBag.type}</div>
      </div>

      <div className="detail-content">
        <div className="detail-name">{selectedBag.name}</div>

        {/* Specs */}
        <div className="specs-grid">
          <div className="spec-cell">
            <div className="spec-label">BOYUT / ÖLÇÜ</div>
            <div className="spec-value">{selectedBag.size}</div>
          </div>
          <div className="spec-cell">
            <div className="spec-label">ŞEKİL</div>
            <div className="spec-value">{selectedBag.shape}</div>
          </div>
          <div className="spec-cell">
            <div className="spec-label">KAPASİTE</div>
            <div className="spec-value">{selectedBag.capacity}</div>
          </div>
          <div className="spec-cell">
            <div className="spec-label">LOKASYON</div>
            <div className="spec-value" style={{ fontSize: 12 }}>{selectedLocation?.name?.split(' ').slice(0, 2).join(' ')}</div>
          </div>
        </div>

        {/* Counter Preview */}
        <div className="counter-block">
          <div className="counter-label">ANLIK SAYAÇ</div>
          <div className="counter-value">00:00:00</div>
          <div className="counter-info-row">
            <div className="counter-info-cell">
              <div className="counter-info-label">30DK ÜCRET</div>
              <div className="counter-info-value">{UNIT_RATE} TL</div>
            </div>
            <div className="counter-info-cell">
              <div className="counter-info-label">TAHMİNİ</div>
              <div className="counter-info-value">0 TL</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 12, fontStyle: 'italic' }}>
            Süre durduğunda toplam tutar otomatik tahsil edilir.
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {selectedBag.features.map(f => (
            <span key={f} className="feature-chip">{f}</span>
          ))}
        </div>

        {/* CTA */}
        {activeRentalId ? (
          <div className="error-msg" style={{ textAlign: 'center' }}>
            Zaten aktif bir kiralamanız bulunuyor.
          </div>
        ) : currentUser.balance < 0 ? (
          <div className="error-msg" style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>
            Bakiyeniz yetersiz. Lütfen bakiye yükleyin.
          </div>
        ) : !canStartRental ? (
          <div style={{
            background: 'var(--green-pale)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            border: '2px dashed var(--green-mid)',
            marginTop: 20
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>
              QR Kodu
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Kiralamak için lütfen çanta üzerindeki QR kodu taratın.
            </div>
          </div>
        ) : (
          <>
            <button
              id="btn-start-rental"
              className="btn-primary"
              onClick={handleStart}
              disabled={confirming}
              style={{ marginBottom: 8 }}
            >
              {confirming ? '⏳ Başlatılıyor...' : <><span>Kiralamayı Başlat</span><span>▶</span></>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
              KİRALAMA BUTONA BASTIĞINIZ AN BAŞLAR.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
