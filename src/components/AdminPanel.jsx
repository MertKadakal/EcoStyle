import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatElapsed } from '../utils/helpers';
import sweetalert from 'sweetalert2';

function LiveCounter({ startTime, stopTime }) {
  const { tick } = useApp();
  const end = stopTime || Date.now();
  const elapsed = Math.floor((end - startTime) / 1000);
  return <>{formatElapsed(elapsed)}</>;
}

function LiveFee({ startTime, stopTime }) {
  const { tick, calcFee } = useApp();
  const fee = calcFee(startTime, stopTime);
  return <>{fee} TL</>;
}

const STATUS_LABELS = {
  active: 'AKTİF',
  overdue: 'GECİKMİŞ',
  pending_return: 'TESLİM EDİLMEDİ',
  completed: 'TAMAMLANDI',
};

const STATUS_BADGE_CLASS = {
  active: 'badge-active',
  overdue: 'badge-overdue',
  pending_return: 'badge-pending',
  completed: 'badge-completed',
};

export default function AdminPanel() {
  const { rentals, confirmReturn, cancelRental, addLocation, addBag, users, bags, locations, logout, addUser, deleteUser } = useApp();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedDates, setAppliedDates] = useState({ start: '', end: '' });

  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddr, setNewLocAddr] = useState('');

  const [showAddBag, setShowAddBag] = useState(false);
  const [targetLocationForBag, setTargetLocationForBag] = useState(null);
  const [newBagForm, setNewBagForm] = useState({ name: '', type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: 'DAYANIKLI, YIKANABİLİR' });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '' });

  const [confirmedIds, setConfirmedIds] = useState([]);
  const [cancelledIds, setCancelledIds] = useState([]);

  const activeRentals = rentals.filter(r => r.status === 'active');
  const overdueRentals = rentals.filter(r => r.status === 'overdue');
  const pendingRentals = rentals.filter(r => r.status === 'pending_return');
  const completedRentals = rentals.filter(r => r.status === 'completed');

  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const displayRentals = rentals.filter(r => {
    if (filter === 'overdue') return r.status === 'overdue';
    if (filter === 'pending') return r.status === 'pending_return';
    if (filter === 'active') return r.status === 'active';
    if (filter === 'completed') return r.status === 'completed';
    return r.status !== 'completed' && r.status !== 'cancelled';
  }).filter(r => {
    if (!appliedDates.start && !appliedDates.end) return true;
    const rDate = new Date(r.startTime);
    rDate.setHours(0, 0, 0, 0);

    if (appliedDates.start) {
      const sDate = new Date(appliedDates.start);
      sDate.setHours(0, 0, 0, 0);
      if (rDate < sDate) return false;
    }
    if (appliedDates.end) {
      const eDate = new Date(appliedDates.end);
      eDate.setHours(0, 0, 0, 0);
      if (rDate > eDate) return false;
    }
    return true;
  });

  const handleApplyFilter = () => {
    setAppliedDates({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedDates({ start: '', end: '' });
  };

  const handleConfirm = (rentalId) => {
    setConfirmedIds(prev => [...prev, rentalId]);
    setTimeout(() => {
      confirmReturn(rentalId);
    }, 500);
  };

  const handleCancel = (rentalId) => {
    setCancelledIds(prev => [...prev, rentalId]);
    setTimeout(() => {
      cancelRental(rentalId);
    }, 500);
  };

  const handleAddLocation = async () => {
    if (!newLocName || !newLocAddr) return;
    await addLocation(newLocName, newLocAddr);
    setShowAddLocation(false);
    setNewLocName('');
    setNewLocAddr('');
  };

  const handleAddBag = async () => {
    if (!newBagForm.name || !targetLocationForBag) return;
    const parsedFeatures = newBagForm.features.split(',').map(f => f.trim()).filter(Boolean);

    await addBag({
      name: newBagForm.name,
      type: newBagForm.type,
      size: newBagForm.size,
      shape: newBagForm.shape,
      capacity: newBagForm.capacity,
      features: parsedFeatures,
      locationId: targetLocationForBag.id
    });

    setShowAddBag(false);
    setNewBagForm({ name: '', type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: 'DAYANIKLI, YIKANABİLİR' });
    setTargetLocationForBag(null);
  };

  const handleAddUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) return;
    await addUser(newUserForm);
    setShowAddUser(false);
    setNewUserForm({ name: '', email: '', password: '' });
  };

  const handleDeleteUser = (userId, userName) => {
    sweetalert.fire({
      title: 'Kullanıcıyı Sil',
      text: `${userName} isimli kullanıcıyı silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(userId);
        sweetalert.fire('Silindi', 'Kullanıcı başarıyla silindi.', 'success');
      }
    });
  };

  const totalRevenue = completedRentals.reduce((s, r) => s + (r.fee || 0), 0);

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>🌿 Eco-Loop Admin</h2>
          <p>Management Portal</p>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'rentals', icon: '🔄', label: 'Rentals' },
            { id: 'locations', icon: '📍', label: 'Locations' },
            { id: 'users', icon: '👥', label: 'Kullanıcılar' },
            { id: 'reports', icon: '📈', label: 'Reports' },
          ].map(item => (
            <button
              id={`admin-nav-${item.id}`}
              key={item.id}
              className={`admin-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-nav-bottom">
          <button className="admin-nav-item" style={{ color: 'var(--text-muted)' }}>❓ Support</button>
          <button id="admin-logout-btn" className="admin-nav-item" style={{ color: 'var(--danger)' }} onClick={logout}>
            ↪ Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{timeStr}</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
              A
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {activeNav === 'dashboard' && (
            <>
              <div className="admin-page-title">Operasyon Paneli</div>
              <div className="admin-page-subtitle">Canlı kiralama döngülerini ve teslimat durumlarını bu ekrandan takip edebilirsiniz.</div>

              <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--green-dark)' }}>
                  <div className="stat-label">Aktif Kiralamalar</div>
                  <div className="stat-flex">
                    <div className="stat-value">{activeRentals.length}</div>
                    <span style={{ fontSize: 18 }}>📈</span>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <div className="stat-label">Teslim Bekleyen</div>
                  <div className="stat-flex">
                    <div className="stat-value">{pendingRentals.length}</div>
                    <span style={{ fontSize: 18 }}>⏰</span>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <div className="stat-label">Gecikmiş Kiralamalar</div>
                  <div className="stat-flex">
                    <div className="stat-value">{overdueRentals.length}</div>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Canlı Takip Listesi</h2>
                <div className="filter-tabs">
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'active', label: 'Aktif' },
                    { id: 'overdue', label: `Gecikmiş (${overdueRentals.length})` },
                    { id: 'pending', label: `Sorunlu (${pendingRentals.length})` },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`filter-tab ${filter === t.id ? 'active' : ''}`}
                      onClick={() => setFilter(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rentals-grid">
                {displayRentals.map(rental => {
                  const isConfirmed = confirmedIds.includes(rental.id);
                  return (
                    <div key={rental.id} className={`rental-card-admin ${rental.status === 'pending_return' ? 'rental-card-pending' : ''}`}>
                      <div className="rental-card-header">
                        <span className="rental-id">#{rental.id}</span>
                        <span className={`badge ${STATUS_BADGE_CLASS[rental.status] || 'badge-active'}`}>
                          {STATUS_LABELS[rental.status]}
                        </span>
                      </div>

                      <div className="rental-card-body">
                        <div className="rental-user-name">{rental.userName}</div>
                        <div className="rental-meta">
                          ⏰ {new Date(rental.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          <br />
                          📍 {rental.locationName}
                        </div>
                      </div>

                      <div className="counter-row">
                        <div className="counter-cell">
                          <label>CANLI SAYAÇ</label>
                          <div className={rental.status === 'overdue' ? 'warning-text' : ''}>
                            {rental.status === 'completed'
                              ? formatElapsed(Math.floor((rental.endTime - rental.startTime) / 1000))
                              : <LiveCounter startTime={rental.startTime} stopTime={rental.returnRequestTime} />}
                          </div>
                        </div>
                        <div className="counter-cell">
                          <label>ÜCRET</label>
                          <div className="fee-text">
                            {rental.status === 'completed'
                              ? `${rental.fee} TL`
                              : <LiveFee startTime={rental.startTime} stopTime={rental.returnRequestTime} />}
                          </div>
                        </div>
                      </div>

                      <div className="action-row">
                        {rental.status === 'pending_return' && (
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirm(rental.id)}
                            disabled={isConfirmed}
                            style={{ background: isConfirmed ? '#ccc' : 'var(--green-dark)' }}
                          >
                            {isConfirmed ? '✅ Onaylandı' : '✔ Onayla'}
                          </button>
                        )}
                        {(rental.status === 'active' || rental.status === 'overdue') && (
                          <button
                            className="btn-confirm"
                            onClick={() => handleCancel(rental.id)}
                            disabled={cancelledIds.includes(rental.id)}
                            style={{ background: cancelledIds.includes(rental.id) ? '#ccc' : 'var(--danger)' }}
                          >
                            {cancelledIds.includes(rental.id) ? 'İptal Edildi' : 'İptal Et'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeNav === 'rentals' && (
            <>
              <div className="page-header-flex">
                <div>
                  <div className="admin-page-title">Tüm Kiralamalar</div>
                  <div className="admin-page-subtitle">Sistem genelindeki tüm kiralama kayıtları</div>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: 'auto', padding: '10px 20px', background: 'var(--green-accent)' }}
                  onClick={() => {
                    sweetalert.fire({
                      title: 'Tarihe Göre Filtrele',
                      html: `
                        <div style="text-align: left; padding: 10px;">
                          <label style="display: block; font-size: 12px; margin-bottom: 5px; font-weight: 600;">Başlangıç Tarihi:</label>
                          <input type="date" id="swal-start" class="swal2-input" style="margin: 0 0 15px 0; width: 100%;">
                          <label style="display: block; font-size: 12px; margin-bottom: 5px; font-weight: 600;">Bitiş Tarihi:</label>
                          <input type="date" id="swal-end" class="swal2-input" style="margin: 0; width: 100%;">
                        </div>
                      `,
                      focusConfirm: false,
                      showCancelButton: true,
                      confirmButtonText: 'Filtrele',
                      cancelButtonText: 'İptal',
                      confirmButtonColor: 'var(--green-dark)',
                      preConfirm: () => {
                        return {
                          start: document.getElementById('swal-start').value,
                          end: document.getElementById('swal-end').value
                        }
                      }
                    }).then((result) => {
                      if (result.isConfirmed) {
                        const { start, end } = result.value;
                        if (!start && !end) return;

                        const filtered = rentals.filter(r => {
                          const rDate = new Date(r.startTime);
                          rDate.setHours(0, 0, 0, 0);
                          if (start) {
                            const sDate = new Date(start);
                            sDate.setHours(0, 0, 0, 0);
                            if (rDate < sDate) return false;
                          }
                          if (end) {
                            const eDate = new Date(end);
                            eDate.setHours(0, 0, 0, 0);
                            if (rDate > eDate) return false;
                          }
                          return true;
                        });

                        const resultsHtml = filtered.length > 0
                          ? `
                            <div style="max-height: 400px; overflow-y: auto; text-align: left;">
                              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                                <thead style="position: sticky; top: 0; background: white;">
                                  <tr style="border-bottom: 2px solid #eee;">
                                    <th style="padding: 8px;">ID</th>
                                    <th style="padding: 8px;">Kullanıcı</th>
                                    <th style="padding: 8px;">Tarih</th>
                                    <th style="padding: 8px;">Ücret</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${filtered.map(r => `
                                    <tr style="border-bottom: 1px solid #f9f9f9;">
                                      <td style="padding: 8px;">#${r.id}</td>
                                      <td style="padding: 8px;">${r.userName}</td>
                                      <td style="padding: 8px;">${new Date(r.startTime).toLocaleDateString('tr-TR')}</td>
                                      <td style="padding: 8px; font-weight: 700;">${r.fee || 0} TL</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                            </div>
                          `
                          : '<p style="padding: 20px; color: var(--text-muted);">Sonuç bulunamadı.</p>';

                        sweetalert.fire({
                          title: 'Filtre Sonuçları',
                          width: '600px',
                          html: resultsHtml,
                          confirmButtonText: 'Kapat',
                          confirmButtonColor: 'var(--green-dark)'
                        });
                      }
                    });
                  }}
                >
                  🔍 Tarihe Göre Filtrele
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['ID', 'Kullanıcı', 'Çanta', 'Lokasyon', 'Başlangıç', 'Durum', 'Ücret', 'İşlem'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map(rental => (
                      <tr key={rental.id}>
                        <td>#{rental.id}</td>
                        <td style={{ fontWeight: 600 }}>{rental.userName}</td>
                        <td>{rental.bagName}</td>
                        <td>{rental.locationName}</td>
                        <td>{new Date(rental.startTime).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE_CLASS[rental.status]}`}>{STATUS_LABELS[rental.status]}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--green-dark)' }}>
                          {rental.status === 'completed' ? `${rental.fee} TL` : <LiveFee startTime={rental.startTime} stopTime={rental.returnRequestTime} />}
                        </td>
                        <td>
                          {rental.status === 'pending_return' && (
                            <button className="table-btn-green" onClick={() => handleConfirm(rental.id)}>Onayla</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeNav === 'locations' && (
            <>
              <div className="admin-page-title">Lokasyonlar</div>
              <div className="stats-grid">
                {locations.map(loc => (
                  <div key={loc.id} className="stat-card">
                    <div style={{ fontSize: 28 }}>📍</div>
                    <div style={{ fontWeight: 700 }}>{loc.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{loc.address}</div>
                    <div className="loc-footer">
                      <span className="badge badge-active">{bags.filter(b => b.locationId === loc.id && b.available).length} Müsait</span>
                      <button className="btn-small" onClick={() => { setTargetLocationForBag(loc); setShowAddBag(true); }}>➕ Ekle</button>
                    </div>
                  </div>
                ))}
                <div className="empty-add-card" onClick={() => setShowAddLocation(true)}>
                  <div className="add-icon">➕</div>
                  <div>Lokasyon Ekle</div>
                </div>
              </div>

              {showAddLocation && (
                <div className="admin-modal">
                  <div className="modal-content">
                    <h3>Yeni Lokasyon Ekle</h3>
                    <div className="input-group">
                      <label>Lokasyon Adı</label>
                      <input className="input-field" value={newLocName} onChange={e => setNewLocName(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Adres</label>
                      <input className="input-field" value={newLocAddr} onChange={e => setNewLocAddr(e.target.value)} />
                    </div>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleAddLocation}>Kaydet</button>
                      <button className="btn-secondary" onClick={() => setShowAddLocation(false)}>İptal</button>
                    </div>
                  </div>
                </div>
              )}

              {showAddBag && (
                <div className="admin-modal">
                  <div className="modal-content">
                    <h3>Yeni Çanta ({targetLocationForBag?.name})</h3>
                    <div className="input-group"><label>Çanta Adı</label><input className="input-field" value={newBagForm.name} onChange={e => setNewBagForm({ ...newBagForm, name: e.target.value })} /></div>
                    <div className="input-group"><label>Tipi</label><input className="input-field" value={newBagForm.type} onChange={e => setNewBagForm({ ...newBagForm, type: e.target.value })} /></div>
                    <div className="input-group"><label>Özellikler</label><input className="input-field" value={newBagForm.features} onChange={e => setNewBagForm({ ...newBagForm, features: e.target.value })} /></div>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleAddBag}>Kaydet</button>
                      <button className="btn-secondary" onClick={() => { setShowAddBag(false); setTargetLocationForBag(null); }}>İptal</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeNav === 'users' && (
            <>
              <div className="page-header-flex">
                <div className="admin-page-title">Kullanıcılar</div>
                <button className="btn-primary-small" onClick={() => setShowAddUser(true)}>➕ Yeni Kullanıcı</button>
              </div>

              <div className="users-list">
                {users.filter(u => !u.isAdmin).map(user => (
                  <div key={user.id} className="stat-card user-card">
                    <button className="delete-btn" onClick={() => handleDeleteUser(user.id, user.name)}>🗑️</button>
                    <div className="user-header">
                      <div className="user-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-stats">
                      <div>Kiralamalar: <strong>{rentals.filter(r => r.userId === user.id).length}</strong></div>
                      <div>Bakiye: <strong>{user.balance} TL</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {showAddUser && (
                <div className="admin-modal">
                  <div className="modal-content">
                    <h3>Yeni Kullanıcı Ekle</h3>
                    <div className="input-group"><label>Ad Soyad</label><input className="input-field" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} /></div>
                    <div className="input-group"><label>E-posta</label><input className="input-field" type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} /></div>
                    <div className="input-group"><label>Şifre</label><input className="input-field" type="password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} /></div>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleAddUser}>Ekle</button>
                      <button className="btn-secondary" onClick={() => setShowAddUser(false)}>İptal</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeNav === 'reports' && (
            <div className="reports-container">
              <div className="admin-page-title">Sistem Raporları</div>
              <div className="admin-page-subtitle">Kiralama verilerinin detaylı analizi ve performans göstergeleri.</div>

              <div className="stats-grid">
                <div className="stat-card" style={{ borderTop: '4px solid var(--green-dark)' }}>
                  <div className="stat-label">Toplam Gelir</div>
                  <div className="stat-value">{totalRevenue} TL</div>
                  <div style={{ fontSize: 11, color: 'var(--green-mid)', marginTop: 4 }}>↑ %12 geçen aya göre</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid var(--green-accent)' }}>
                  <div className="stat-label">Tamamlanan İşlemler</div>
                  <div className="stat-value">{completedRentals.length}</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid var(--warning)' }}>
                  <div className="stat-label">Toplam Kiralama Süresi</div>
                  <div className="stat-value">
                    {Math.round(completedRentals.reduce((acc, r) => acc + (r.endTime - r.startTime), 0) / (1000 * 60))} Dakika
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 20 }}>
                {/* 1. Location Percentages */}
                <div className="report-section-card">
                  <div className="report-card-header">
                    <span style={{ fontSize: 18 }}>📍</span>
                    <h3>Lokasyon Bazlı Kiralama Dağılımı</h3>
                  </div>
                  <div className="report-list">
                    {(() => {
                      const locMap = {};
                      rentals.forEach(r => {
                        locMap[r.locationName] = (locMap[r.locationName] || 0) + 1;
                      });
                      const total = rentals.length || 1;
                      return Object.entries(locMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={name} className="report-item">
                            <div className="report-item-info">
                              <span>{name}</span>
                              <span style={{ fontWeight: 700 }}>%{pct}</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--green-dark)' }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 2. Peak Hours Analysis */}
                <div className="report-section-card">
                  <div className="report-card-header">
                    <span style={{ fontSize: 18 }}>⏰</span>
                    <h3>En Yoğun Kiralama Saatleri</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, marginTop: 16 }}>
                    {(() => {
                      const hourBuckets = Array(24).fill(0);
                      rentals.forEach(r => {
                        const hour = new Date(r.startTime).getHours();
                        hourBuckets[hour]++;
                      });
                      const max = Math.max(...hourBuckets) || 1;
                      return hourBuckets.map((count, hour) => (
                        <div key={hour} style={{ textAlign: 'center' }}>
                          <div style={{
                            height: 60,
                            background: 'var(--cream-dark)',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: 4
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: `${(count / max) * 100}%`,
                              background: count === max ? 'var(--green-dark)' : 'var(--green-mid)',
                              transition: 'height 0.3s'
                            }}></div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700 }}>{hour.toString().padStart(2, '0')}:00</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 3. Date Distribution */}
                <div className="report-section-card">
                  <div className="report-card-header">
                    <span style={{ fontSize: 18 }}>📅</span>
                    <h3>Son 7 Günlük Kiralama Trendi</h3>
                  </div>
                  <div className="report-list" style={{ marginTop: 10 }}>
                    {(() => {
                      const dayMap = {};
                      const last7Days = [...Array(7)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d.toISOString().split('T')[0];
                      }).reverse();

                      rentals.forEach(r => {
                        const date = new Date(r.startTime).toISOString().split('T')[0];
                        dayMap[date] = (dayMap[date] || 0) + 1;
                      });

                      const totalInLast7 = last7Days.reduce((acc, date) => acc + (dayMap[date] || 0), 0) || 1;

                      return last7Days.map(date => {
                        const count = dayMap[date] || 0;
                        const pct = Math.round((count / totalInLast7) * 100);
                        const label = new Date(date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
                        return (
                          <div key={date} className="report-item">
                            <div className="report-item-info">
                              <span>{label}</span>
                              <span style={{ fontWeight: 600 }}>{count} Kiralama (%{pct})</span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: 6 }}>
                              <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--green-accent)' }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
