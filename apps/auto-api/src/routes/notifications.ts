import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/send', async (req, res) => {
  try {
    const { type, to, subject, message } = req.body;

    if (type === 'whatsapp') {
      return res.status(410).json({
        success: false,
        error: 'WhatsApp/Twilio notifications are disabled in the production baseline.'
      });
    }

    await emailTransporter.sendMail({
      from: `"StreamVista" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Update from StreamVista',
      text: message,
    });

    res.json({ success: true, message: 'Email notification sent' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
