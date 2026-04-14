import { AppProvider, useApp } from './store/AppContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import BagsScreen from './components/BagsScreen';
import RentalDetailScreen from './components/RentalDetailScreen';
import ActiveRentalScreen from './components/ActiveRentalScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminPanel from './components/AdminPanel';
import './index.css';

function BottomNav() {
  const { view, setView, activeRentalId } = useApp();

  const items = [
    { id: 'home', icon: '🏠', label: 'ANASAYFA' },
    { id: 'bags', icon: '👜', label: 'ÇANTALAR' },
    { id: 'active-rental', icon: '⏱️', label: 'KİRALAMA', hidden: !activeRentalId },
    { id: 'profile', icon: '👤', label: 'PROFİL' },
  ].filter(i => !i.hidden || i.id === 'active-rental');

  const getActiveId = () => {
    if (view === 'home') return 'home';
    if (view === 'bags' || view === 'rental-detail') return 'bags';
    if (view === 'active-rental') return 'active-rental';
    if (view === 'profile') return 'profile';
    return '';
  };

  return (
    <div className="bottom-nav">
      {items.map(item => (
        <button
          id={`nav-${item.id}`}
          key={item.id}
          className={`nav-item ${getActiveId() === item.id ? 'active' : ''}`}
          onClick={() => setView(item.id)}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          {item.id === 'active-rental' && activeRentalId && (
            <span style={{
              position: 'absolute',
              top: 0,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ff5733',
              animation: 'pulse 1s infinite',
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

function MobileApp() {
  const { view, currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="phone-shell">
        <LoginScreen />
      </div>
    );
  }

  if (currentUser?.email?.toLowerCase().trim() === 'admin@beykoz.com') {
    return (
      <div className="phone-shell">
        <AdminPanel />
      </div>
    );
  }

  const renderScreen = () => {
    switch (view) {
      case 'home': return <HomeScreen />;
      case 'bags': return <BagsScreen />;
      case 'rental-detail': return <RentalDetailScreen />;
      case 'active-rental': return <ActiveRentalScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="phone-shell">
      {renderScreen()}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MobileApp />
    </AppProvider>
  );
}
