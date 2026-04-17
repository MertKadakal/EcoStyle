import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatElapsed, calcFee } from '../utils/helpers';

export default function ActiveRentalScreen() {
  const { getActiveRental, requestReturn, setView, tick, setActiveRentalId } = useApp();
  const [returning, setReturning] = useState(false);
  const [returned, setReturned] = useState(false);

  const rental = getActiveRental();

  if (!rental) {
    return (
      <div className="screen animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, height: '100vh', background: 'var(--cream)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎒</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>Aktif Kiralama Bulunmamakta</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          Şu anda kullanmakta olduğunuz bir çanta görünmüyor. Hemen yeni bir çanta kiralayabilirsiniz.
        </div>
        <button id="btn-go-bags" className="btn-primary" onClick={() => setView('bags')}>Çantalara Göz At</button>
      </div>
    );
  }

  if (rental.status === 'completed') {
    return (
      <div className="screen animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, height: '100vh', background: 'var(--cream)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-dark)', marginBottom: 8, textAlign: 'center' }}>Kiralama Tamamlandı</div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          Çantanız yetkili personel tarafından teslim alındı. Teşekkürler!
        </div>
        <div className="card" style={{ width: '100%', marginBottom: 24, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ÖDENEN TUTAR</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{rental?.fee || 0} TL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>KİRALAMA BİTİŞ</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {rental?.endTime ? new Date(rental.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </span>
          </div>
        </div>
        <button id="btn-go-profile" className="btn-primary" onClick={() => { setActiveRentalId(null); setView('profile'); }}>Profilime Git</button>
      </div>
    );
  }

  if (rental.status === 'cancelled') {
    return (
      <div className="screen animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, height: '100vh', background: 'var(--cream)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)', marginBottom: 8, textAlign: 'center' }}>İptal Edildi</div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          Kiralamanız yetkili personel tarafından iptal edilmiştir. Herhangi bir ücret tahsilatı yapılmadı.
        </div>
        <button id="btn-go-profile-cancel" className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => { setActiveRentalId(null); setView('profile'); }}>Profilime Dön</button>
      </div>
    );
  }

  const isOverdue = rental.status === 'overdue';
  const isPending = rental.status === 'pending_return';
  
  const stopTime = undefined; // Counter runs until the admin approves (status changes to completed)
  const end = stopTime || Date.now();
  const elapsed = Math.floor((end - rental.startTime) / 1000);
  const currentFee = calcFee(rental.startTime, stopTime);
  const unitRate = 15;

  const handleReturn = () => {
    setReturning(true);
    setTimeout(() => {
      requestReturn(rental.id);
      setReturned(true);
      setReturning(false);
    }, 800);
  };

  return (
    <div className="screen animate-fadeInUp">
      {/* Hero Header */}
      <div className="active-rental-hero">
        <div className="active-rental-title">AKTİF KİRALAMA</div>
        <div className="active-bag-name">{rental.bagName}</div>
        <div className="active-location">📍 {rental.locationName}</div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span
            className={`badge ${isOverdue ? 'badge-overdue' : isPending ? 'badge-pending' : 'badge-active'}`}
            style={{ fontSize: 11 }}
          >
            {isOverdue ? '⚠️ GECİKMİŞ' : isPending ? '🔄 TESLİM BEKLİYOR' : '🟢 AKTİF'}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{rental.id}</span>
        </div>
      </div>

      {/* Live Counter Card */}
      <div style={{ padding: '0 20px' }}>
        <div className="live-counter" style={{ marginTop: -20 }}>
          <div className="live-badge">
            <span className="eco-dot" />
            <span>CANLI SAYAÇ</span>
          </div>
          <div className="live-counter-value" style={{ color: isOverdue ? 'var(--warning)' : 'var(--green-dark)' }}>
            {formatElapsed(elapsed)}
          </div>
          <div className="fee-row">
            <div className="fee-cell">
              <div className="fee-cell-label">30DK ÜCRETİ</div>
              <div className="fee-cell-value" style={{ fontSize: 18 }}>{unitRate} TL</div>
            </div>
            <div className="fee-cell">
              <div className="fee-cell-label">BİRİKEN ÜCRET</div>
              <div className="fee-cell-value" style={{ color: isOverdue ? 'var(--warning)' : 'var(--text-primary)' }}>
                {currentFee} TL
              </div>
            </div>
          </div>
          <p className="return-note">Süre durduğunda toplam tutar otomatik tahsil edilir.</p>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
          <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>BAŞLANGIÇ</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Date(rental.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>SONRAKI ÜCRET</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>
              +{unitRate} TL / 30dk'da
            </div>
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue && (
          <div style={{
            background: 'var(--warning-light)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 14,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>Kiralama Süresi Aşıldı</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Lütfen çantayı en kısa sürede teslim edin.
              </div>
            </div>
          </div>
        )}

        {/* Pending Return Info */}
        {(isPending || returned) && (
          <div style={{
            background: 'var(--green-pale)',
            border: '1px solid var(--green-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 14,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20 }}>🔄</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>Teslim Talebi Gönderildi</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Yetkili personel teslimatı onaylayacaktır.
              </div>
            </div>
          </div>
        )}

        {/* Return Button */}
        {!isPending && !returned ? (
          <button
            id="btn-return-rental"
            className="btn-primary"
            onClick={handleReturn}
            disabled={returning}
            style={{ background: isOverdue ? 'var(--warning)' : 'var(--green-dark)', marginBottom: 8 }}
          >
            {returning ? '⏳ Teslim Ediliyor...' : '📦 Teslim Et'}
          </button>
        ) : (
          <button id="btn-go-home-pending" className="btn-secondary" onClick={() => setView('home')}>
            Ana Sayfaya Dön
          </button>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          Teslimat, yetkili personel tarafından onaylanacaktır.
        </p>
      </div>
    </div>
  );
}
