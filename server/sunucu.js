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
        service: 'gmail',
        // auth kısmını böyle değiştiriyoruz:
        auth: {
            user: process.env.MAIL_ADRESI,
            pass: process.env.MAIL_SIFRESI
        }
    });

    // 2. Mail içeriğini ayarla
    const mailOptions = {
        from: 'mert.kadakal1629@gmail.com',
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
        res.status(500).json({ basari: false, mesaj: 'E-posta gönderilirken bir hata oluştu.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));