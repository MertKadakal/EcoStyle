import { useApp } from '../store/AppContext';
import { calcFee, formatElapsed, formatDate } from '../utils/helpers';
import sweetalert from 'sweetalert2';

export default function ProfileScreen() {
  const { currentUser, users, logout, rentals, addBalance, updateUserName } = useApp();

  // Merge runtime history with completed rentals in the global list
  const user = users.find(u => u.id === currentUser.id) || currentUser;
  const completedRentals = rentals.filter(r => r.userId === currentUser.id && r.status === 'completed');
  const allHistory = [...(user.rentalHistory || []), ...completedRentals.filter(
    cr => !(user.rentalHistory || []).find(h => h.id === cr.id)
  )];

  const totalSpent = allHistory.reduce((s, r) => s + (r.fee || 0), 0);

  const handleEditName = () => {
    sweetalert.fire({
      title: 'İsim Değiştir',
      text: 'Yeni adınızı giriniz:',
      input: 'text',
      inputValue: user.name,
      showCancelButton: true,
      confirmButtonText: 'Güncelle',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#0e5a12ff',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'İsim boş bırakılamaz!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserName(result.value);
        sweetalert.fire({
          title: 'Başarılı!',
          text: 'İsminiz güncellendi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
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
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar">
          {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="profile-name">{user.name}</div>
            <button
              onClick={handleEditName}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 12 }}
              title="İsmi Düzenle"
            >
              ✏️
            </button>
          </div>
          <div className="profile-email">{user.email}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 10 }}>🌿 Eko Kullanıcı</span>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>{allHistory.length}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>KİRALAMA</div>
          </div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>{totalSpent} TL</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>HARCAMA</div>
          </div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>{allHistory.length * 2}kg</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>CO₂ TASARRUFU</div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="wallet-card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="wallet-label">CÜZDAN BAKİYESİ</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{user.balance} TL</div>
          </div>
          <button id="profile-add-balance" className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }} onClick={handleAddBalance}>
            ➕ Yükle
          </button>
        </div>

        {/* Logout */}
        <button id="btn-logout" className="btn-outline" style={{ marginBottom: 24 }} onClick={logout}>
          Çıkış Yap
        </button>

        {/* History */}
        <div className="section-header">
          <span className="section-title">Kiralama Geçmişi</span>
        </div>

        {allHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Henüz kiralama yok</div>
            <div style={{ fontSize: 13 }}>İlk kiralamanızı yapın!</div>
          </div>
        ) : (
          allHistory.map((r, i) => (
            <div key={r.id + i} className="history-item">
              <div className="history-item-left">
                <div className="history-rent-id">{r.id}</div>
                <div className="history-bag-name">{r.bagName}</div>
                <div className="history-date">
                  {r.locationName} •{' '}
                  {new Date(r.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </div>
                {r.endTime && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    ⏱ {formatElapsed(Math.floor((r.endTime - r.startTime) / 1000))}
                  </div>
                )}
              </div>
              <div>
                <div className="history-fee">{r.fee} TL</div>
                <span className="badge badge-completed" style={{ marginTop: 4, float: 'right' }}>
                  TAMAMLANDI
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
