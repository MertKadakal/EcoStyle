import { useState } from 'react';
import { useApp } from '../store/AppContext';

const LOCATION_ICONS = {
  loc1: '📚',
  loc2: '☕',
  loc3: '🏛️',
  loc4: '🌿',
};

export default function BagsScreen() {
  const { locations, bags, selectedLocation, setSelectedLocation, setSelectedBag, setView, activeRentalId, currentUser, setCanStartRental } = useApp();
  const [step, setStep] = useState('location'); // location | bags
  const isNegativeBalance = currentUser.balance < 0;

  const handleLocationSelect = (loc) => {
    if (isNegativeBalance) return;
    setSelectedLocation(loc);
    setStep('bags');
  };

  const handleBagSelect = (bag) => {
    if (!bag.available || isNegativeBalance) return;
    setCanStartRental(false);
    setSelectedBag(bag);
    setView('rental-detail');
  };

  const locationBags = bags.filter(b => b.locationId === selectedLocation?.id);

  if (step === 'location') {
    return (
      <div className="screen animate-fadeInUp">
        <div className="page-header">
          <div>
            <div className="page-title">Lokasyon Seç</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Size en yakın noktayı seçin</div>
          </div>
        </div>

        <div className="page-content">
          {activeRentalId && (
            <div className="error-msg" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              ⚠️ Zaten aktif bir kiralamanız bulunuyor.
            </div>
          )}
          {isNegativeBalance && (
            <div className="error-msg" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)' }}>
              Bakiyeniz yetersiz. Lütfen bakiye yükleyin.
            </div>
          )}

          <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mevcut Noktalar
          </div>

          {locations.map(loc => (
            <div
              id={`location-card-${loc.id}`}
              key={loc.id}
              className={`location-card ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
              onClick={() => !activeRentalId && handleLocationSelect(loc)}
              style={{ opacity: activeRentalId ? 0.6 : 1, cursor: activeRentalId ? 'not-allowed' : 'pointer' }}
            >
              <div className="location-icon">{LOCATION_ICONS[loc.id] || '📍'}</div>
              <div>
                <div className="location-name">{loc.name}</div>
                <div className="location-address">📍 {loc.address}</div>
              </div>
              <div className="location-bags">{loc.availableBags} çanta</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="screen animate-fadeInUp">
      <div className="page-header">
        <button id="bags-back-btn" className="back-btn" onClick={() => setStep('location')}>
          ‹ Geri
        </button>
        <div className="page-title">Çanta Seç</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        {isNegativeBalance && (
          <div className="error-msg" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', marginBottom: 14 }}>
            Bakiyeniz yetersiz. Lütfen bakiye yükleyin.
          </div>
        )}
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-dark)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>SEÇİLEN LOKASYON</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{LOCATION_ICONS[selectedLocation?.id]}</span>
            <span>{selectedLocation?.name}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
          Mevcut Çantalar
        </div>

        {locationBags.map(bag => (
          <div
            id={`bag-card-${bag.id}`}
            key={bag.id}
            className={`bag-list-card ${!bag.available ? 'unavailable' : ''}`}
            onClick={() => handleBagSelect(bag)}
          >
            <div className="bag-list-img">👜</div>
            <div className="bag-list-info">
              <div className="bag-list-type">{bag.type}</div>
              <div className="bag-list-name">{bag.name}</div>
              <div className="bag-list-meta">{bag.size} • {bag.capacity}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {bag.features.map(f => (
                  <span key={f} className="feature-chip">{f}</span>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600 }}>
                {bag.available ? (
                  <><span className="bag-available-dot" />Müsait • 15 TL/30dk</>
                ) : (
                  <span style={{ color: 'var(--danger)' }}>• Kirada</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {locationBags.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
            <div style={{ fontWeight: 600 }}>Bu lokasyonda çanta bulunamadı</div>
          </div>
        )}
      </div>
    </div>
  );
}
