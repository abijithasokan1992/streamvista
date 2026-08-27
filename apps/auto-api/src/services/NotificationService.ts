import nodemailer from 'nodemailer';
import twilio from 'twilio';

const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class NotificationService {
  static async sendWhatsApp(to: string, message: string) {
    if (!twilioClient) throw new Error('Twilio not configured');
    
    return await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
  }

  static async sendEmail(to: string, subject: string, text: string) {
    return await emailTransporter.sendMail({
      from: `"UNION Auto Spares" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  }
}
