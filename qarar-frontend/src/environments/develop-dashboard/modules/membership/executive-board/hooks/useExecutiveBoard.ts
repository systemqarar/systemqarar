import { useState, useEffect, useMemo } from 'react'; // تم تصحيح import وإضافة useMemo للفرز الذكي
import axios from 'axios';
import { 
  IBoardMember, 
  IAvailableVolunteer, 
  AdminPosition, 
  ADMIN_POSITIONS_CONFIG 
} from '../types/types'; // استيراد الخريطة الرسمية للمناصب

export const useExecutiveBoard = () => {
  const [boardMembers, setBoardMembers] = useState<IBoardMember[]>([]);
  const [availableVolunteers, setAvailableVolunteers] = useState<IAvailableVolunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. جلب البيانات من السيرفر (الهيكل الحالي + بنك المتطوعين المتاحين)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get('/api/developer-zone/membership/executive-board/board-data');
      
      if (res.data.success) {
        setBoardMembers(res.data.data.currentBoard);
        setAvailableVolunteers(res.data.data.availableVolunteers);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب بيانات الهيكل الإداري');
    } finally {
      setLoading(false);
    }
  };

  // 2. دمج وتجهيز الكراسي الـ 16 (المشغولة والشاغرة) وفرزها بصرياً لحماية الواجهة
  const { unitDesks, localityDesks } = useMemo(() => {
    // نمر على الـ 16 منصب المعتمدين ونشوف منو الشاغل المنصب ده
    const allDesks = ADMIN_POSITIONS_CONFIG.map(config => {
      const member = boardMembers.find(m => m.admin_position === config.key) || null;
      return {
        ...config,
        member // حيكون ببيانات العضو أو null لو المنصب شاغر
      };
    });

    // تقسيم الكراسي حسب التصنيف الإداري بكل نظافة
    return {
      unitDesks: allDesks.filter(desk => desk.category === 'unit'),
      localityDesks: allDesks.filter(desk => desk.category === 'locality')
    };
  }, [boardMembers]);

  // 3. إرسال طلب تعيين منصب جديد لمتطوع
  const assignMember = async (volunteerNumber: string, position: AdminPosition) => {
    try {
      const res = await axios.post('/api/developer-zone/membership/executive-board/assign', { 
        volunteerNumber, 
        position 
      });
      if (res.data.success) {
        await fetchData(); // تحديث شاشة العرض فوراً بعد النجاح
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'فشل التعيين' };
    }
  };

  // 4. إرسال طلب إعفاء عضو وإعادته لمرتبة متطوع عادي
  const exemptMember = async (volunteerNumber: string) => {
    try {
      const res = await axios.post('/api/developer-zone/membership/executive-board/exempt', { 
        volunteerNumber 
      });
      if (res.data.success) {
        await fetchData(); // تحديث القوائم لتفريغ الكرسي في نفس اللحظة
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'فشل الإعفاء' };
    }
  };

  // تشغيل الجلب التلقائي للبيانات عند فتح الصفحة لأول مرة
  useEffect(() => {
    fetchData();
  }, []);

  // تصدير البيانات والوظائف والتقسيمات الجاهزة لخدمة شاشة العرض مباشرة
  return { 
    unitDesks,           // كراسي الوحدة الـ 14 جاهزة ومفروزة ومدمجة
    localityDesks,       // كراسي المحلية المنصبين جاهزة ومفروزة ومدمجة
    availableVolunteers, // المتطوعين الفاضيين الجاهزين للتعيين
    loading, 
    error, 
    refreshData: fetchData, // إمكانية التحديث اليدوي إذا دعت الحاجة
    assignMember, 
    exemptMember 
  };
};
