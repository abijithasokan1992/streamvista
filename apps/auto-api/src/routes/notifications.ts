import { Router } from 'express';
import { NotificationService } from '../services/NotificationService';

const router = Router();

router.post('/send', async (req, res) => {
  try {
    const { type, to, subject, message } = req.body; // type: 'email' | 'whatsapp'
    
    if (type === 'whatsapp') {
      await NotificationService.sendWhatsApp(to, message);
    } else {
      await NotificationService.sendEmail(to, subject || 'Update from UNION', message);
    }
    
    res.json({ success: true, message: 'Notification sent' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
