import { Router } from 'express';
import { askGhaith } from '../../../services/ghaithService';

const router = Router();

// مسار استقبال الأسئلة من الفرونتد
router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'الرجاء كتابة السؤال أولاً' });
    }

    const answer = await askGhaith(prompt);
    
    res.json({ success: true, answer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'حدث خطأ في السيرفر' });
  }
});

export default router;
