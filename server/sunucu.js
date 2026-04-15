// sunucu.js
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();

// Gelen JSON verilerini okuyabilmek ve ön yüzden gelen isteklere izin vermek için
app.use(express.json());
app.use(cors());

// İstek atacağın uç nokta (API)
app.post('/api/mail-gonder', async (req, res) => {
    // İstemciden gelen verileri al
    const { kime, konu, mesaj } = req.body;

    // 1. E-posta gönderici ayarlarını yapılandır
    // ÖNEMLİ: Gerçek projelerde şifreleri doğrudan koda yazma, .env dosyası kullan!
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // 465 yerine güvenli iletişim portunu kullanıyoruz
        secure: false, // 587 portu için 'false' olmalıdır
        auth: {
            user: process.env.MAIL_ADRESI,
            pass: process.env.MAIL_SIFRESI
        },
        tls: {
            // Render gibi bulut platformlarındaki sertifika çakışmalarını önler
            rejectUnauthorized: false
        }
    });

    // 2. Mail içeriğini ayarla
    const mailOptions = {
        from: process.env.MAIL_ADRESI,
        to: kime,
        subject: konu,
        text: mesaj
    };

    // 3. Maili gönder ve ön yüze cevap dön
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ basari: true, mesaj: 'E-posta başarıyla gönderildi!' });
    } catch (hata) {
        console.error(hata);
        res.status(500).json({
            basari: false,
            mesaj: 'E-posta gönderilirken bir hata oluştu.',
            hata: hata.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));