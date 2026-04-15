import { useState } from 'react';
import { useApp } from '../store/AppContext';
import sweetalert from 'sweetalert2';
import emailjs from '@emailjs/browser';

export default function LoginScreen() {
  const { login, register, users } = useApp();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Email verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');

  const mailGonder = async () => {
    // 1. Göndermek istediğimiz veriler (Şablondaki {{ }} isimleriyle AYNI olmalı)
    const formVerisi = {
      kime: "mert.kadakal1629@gmail.com", // Artık herkese atabilirsin!
      konu: "EmailJS ile Doğrudan Ön Yüzden Mesaj",
      mesaj: "Merhaba! Bu mesaj backend olmadan, doğrudan tarayıcıdan gönderildi."
    };

    try {
      // 2. EmailJS'in kendi fonksiyonu ile maili gönder
      // Kullanımı: emailjs.send(SERVICE_ID, TEMPLATE_ID, DATA, PUBLIC_KEY)
      const sonuc = await emailjs.send(
        'service_eakq5n4',   // 1. Adımda not ettiğin
        'template_cunif7j',  // 2. Adımda not ettiğin
        formVerisi,
        'cPiBZ6KiXczSEfYev'    // EmailJS panelinde "Account -> API Keys" kısmında bulabilirsin
      );

      console.log("Süper! Mail başarıyla gönderildi:", sonuc.text);
      alert("Mesajınız iletildi!");

    } catch (hata) {
      console.error("Mail gönderilemedi:", hata);
      alert("Bir sorun oluştu.");
    }
  };

  // Bu fonksiyonu bir butonun tıklanma olayına (onClick) bağlayabilirsin

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    const ok = login(email, password);
    if (!ok) setError('E-posta veya şifre hatalı.');
  };

  const startRegistration = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    if (password.length < 4) { setError('Şifre en az 4 karakter olmalıdır.'); return; }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      setError('Bu e-posta zaten kullanımda!');
      return;
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Show sending alert
    sweetalert.fire({
      title: 'Gönderiliyor...',
      text: 'Doğrulama kodu e-posta adresinize gönderiliyor.',
      allowOutsideClick: false,
      didOpen: () => {
        sweetalert.showLoading();
      }
    });

    try {
      // Send code via EmailJS
      await emailjs.send(
        'service_eakq5n4',
        'template_cunif7j',
        {
          kime: email,
          konu: 'EcoStyle Kayıt Doğrulama',
          mesaj: `EcoStyle'a hoş geldiniz! Kayıt işleminizi tamamlamak için doğrulama kodunuz: ${code}`
        },
        'cPiBZ6KiXczSEfYev'
      );

      setVerificationCode(code);
      setIsVerifying(true);
      setError('');

      sweetalert.fire({
        title: 'Kod Gönderildi!',
        text: 'Lütfen e-posta kutunuzu (gereksiz klasörünü de) kontrol edin.',
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: 'var(--green-main)'
      });
    } catch (hata) {
      console.error("EmailJS Hatası:", hata);
      sweetalert.fire({
        title: 'Hata!',
        text: 'Doğrulama kodu gönderilemedi. Lütfen e-posta adresinizi kontrol edin veya daha sonra tekrar deneyin.',
        icon: 'error'
      });
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (userInputCode !== verificationCode) {
      setError('Hatalı doğrulama kodu!');
      sweetalert.fire('Hata', 'Hatalı doğrulama kodu!', 'error');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      sweetalert.fire({
        title: 'Başarılı!',
        text: 'Kaydınız başarıyla tamamlandı.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      setError(res.error || 'Kayıt sırasında bir hata oluştu.');
      setIsVerifying(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@beykoz.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="login-screen">
      <button onClick={mailGonder}>Test Mail Gönder</button>

      <div className="login-hero">
        <div className="login-logo">🌿 EcoStyle</div>
        <div className="login-tagline">Sürdürülebilir bir gelecek için bugün ne yapıyoruz?</div>
        {/* Bag illustration */}
        <div style={{ fontSize: 72, marginTop: 20, marginBottom: 8 }}>👜</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
          Akıllı Çanta Kiralama Sistemi
        </div>
      </div>

      <div className="login-form">
        {!isVerifying && (
          <div className="login-tabs">
            <button id="tab-login" className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Giriş Yap</button>
            <button id="tab-register" className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Kayıt Ol</button>
          </div>
        )}

        {error && <div className="error-msg">⚠️ {error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">E-posta</label>
              <input id="login-email" autoComplete="email" className="input-field" type="email" placeholder="ornek@mail.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Şifre</label>
              <input id="login-password" autoComplete="current-password" className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button id="btn-login-submit" type="submit" className="btn-primary" style={{ marginBottom: 12 }}>Giriş Yap</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button id="btn-admin-login" type="button" className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: 10 }} onClick={fillAdmin}>Admin Girişi</button>
            </div>
          </form>
        ) : isVerifying ? (
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📧</div>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>E-posta Doğrulama</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                {email} adresine gönderilen 6 haneli kodu giriniz.
              </p>
            </div>
            <div className="input-group">
              <label className="input-label">Doğrulama Kodu</label>
              <input id="reg-verify-code" className="input-field" type="text" maxLength="6" placeholder="000000" value={userInputCode} onChange={e => setUserInputCode(e.target.value.replace(/\D/g, ''))} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }} />
            </div>
            <button id="btn-verify-submit" type="submit" className="btn-primary">Doğrula ve Kayıt Ol</button>
            <button type="button" className="btn-secondary" style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--green-main)', textDecoration: 'underline' }} onClick={() => setTab('login')}>
              Geri Dön
            </button>
          </form>
        ) : (
          <form onSubmit={startRegistration}>
            <div className="input-group">
              <label className="input-label">Ad Soyad</label>
              <input id="reg-name" className="input-field" type="text" placeholder="Adınız Soyadınız" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">E-posta</label>
              <input id="reg-email" autoComplete="email" className="input-field" type="email" placeholder="ornek@mail.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Şifre</label>
              <input id="reg-password" autoComplete="new-password" className="input-field" type="password" placeholder="En az 4 karakter" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button id="btn-register-submit" type="submit" className="btn-primary">Doğrulama Kodu Gönder</button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24, lineHeight: 1.6 }}>
          EcoStyle ile sürdürülebilir bir gelecek oluşturuyoruz. 🌱<br />
          %100 geri dönüştürülmüş kanvas çantalarımızla tanışın.
        </p>
      </div>
    </div>
  );
}
