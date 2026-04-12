import { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import sweetalert from 'sweetalert2';

export default function QRScanner({ onClose }) {
  const { bags, locations, setSelectedBag, setSelectedLocation, setView } = useApp();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Html5Qrcode is loaded via CDN in index.html
    if (!window.Html5Qrcode) {
      console.error('Html5Qrcode library not found');
      sweetalert.fire('Hata', 'QR okuyucu yüklenemedi. Lütfen internet bağlantınızı kontrol edin.', 'error');
      onClose();
      return;
    }

    const html5QrCode = new window.Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText) => {
      // Logic for bag identification
      // We expect decodedText to be the bag ID (e.g., "bag1")
      const bag = bags.find(b => b.id === decodedText);

      if (bag) {
        // Also find related location to prevent null issues in detail screen
        const location = locations.find(l => l.id === bag.locationId);
        
        html5QrCode.stop().then(() => {
          setSelectedLocation(location);
          setSelectedBag(bag);
          setView('rental-detail');
          onClose();
        }).catch(err => {
          console.error('Stop error', err);
          onClose();
        });
      } else {
        sweetalert.fire('Bilinmeyen Çanta', `Okutulan kod (${decodedText}) sistemde kayıtlı bir çantaya ait değil.`, 'warning');
      }
    };

    const config = { 
      fps: 15, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      qrCodeSuccessCallback
    ).catch(err => {
      console.error('Kamera başlatılamadı', err);
      sweetalert.fire('Kamera Hatası', 'Kameraya erişilemedi. Lütfen izinleri kontrol edin.', 'error');
      onClose();
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(e => console.error(e));
      }
    };
  }, [bags, locations, onClose, setSelectedBag, setSelectedLocation, setView]);

  return (
    <div className="qr-scanner-overlay animate-fadeInUp">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <button className="qr-close-btn" onClick={onClose}>✕</button>
          <h3>QR Kodu Okut</h3>
          <p>Çanta üzerindeki kodu tarayın</p>
        </div>
        
        <div className="qr-reader-wrapper">
          <div id="qr-reader" className="qr-reader-view"></div>
          <div className="qr-target-guide"></div>
        </div>
        
        <div className="qr-scanner-footer">
          <span>💡</span>
          <p>Çanta üzerindeki QR kodu çerçevenin içine hizalayarak otomatik olarak taratabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
