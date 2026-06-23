import axios from 'axios';

export interface IHasrVolunteerSnapshot {
  volunteer_id: string;
  national_id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  photo_url: string | null;
  is_tot_trainer: boolean;
  current_status_in_khartoum: string;
}

export const hasrApiClient = {
  // دالة فحص المعرف وجلب لقطة البيانات من نظام الحصر
  getVolunteerSnapshot = async (volunteerId: string): Promise<IHasrVolunteerSnapshot | null> => {
    const isDev = process.env.DEVELOPMENT_MODE === 'true';

    if (isDev) {
      // وضع المحاكاة الصارم لتوفير الحصص وتسريع البناء والرفع
      console.log(`[🤖 DEVELOPMENT_MODE] Mocking Al-Hasr API response for ID: ${volunteerId}`);
      
      if (volunteerId.startsWith("VOL-")) {
        return {
          volunteer_id: volunteerId,
          national_id: "123456789012",
          full_name: "المتطوع الرقمي المحاكي",
          phone: "0912345678",
          whatsapp: "249912345678", 
          photo_url: "https://api.dicebear.com/7.x/bottts/svg?seed=qarar",
          is_tot_trainer: true, // مدرب TOT لتجربة فصل الصلاحيات تلقائياً
          current_status_in_khartoum: "داخل الولاية"
        };
      }
      return null;
    }

    // هنا يتم الربط الفعلي مستقبلاً مع نظام الحصر الخارجي
    try {
      const response = await axios.get(`https://api.alhasr.org/v1/volunteers/${volunteerId}`, {
        headers: { 'Authorization': `Bearer ${process.env.HASR_API_KEY}` }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
