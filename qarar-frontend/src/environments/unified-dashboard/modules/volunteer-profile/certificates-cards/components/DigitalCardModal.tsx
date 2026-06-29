import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard } from 'lucide-react';
import { VolunteerCertificatesData } from '../types/certificates.types';
// 🎯 الاستدعاء الحقيقي والموجه لكرتك الأصلي في الـ src
import { VolunteerCard, VolunteerCardData } from '../../../../../../components/VolunteerCard';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerData: VolunteerCertificatesData | null;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({ isOpen, onClose, volunteerData }) => {
  if (!isOpen || !volunteerData) return null;

  // 🔄 عملية المواءمة (Mapping) لتحويل البيانات للمظهر الذي يتوقعه كرتك الأصلي
  const mappedVolunteerForCard: VolunteerCardData = {
    id: 0, // معرف افتراضي للواجهة
    volunteerId: volunteerData.volunteerId,
    fullName: volunteerData.fullName,
    phone: volunteerData.phone || '-----------',
    unitId: 0,
    unitName: volunteerData.unitName || 'مكتب الطوارئ المركزي',
    photoUrl: volunteerData.profileImageUrl, // تحويل الاسم من profileImageUrl إلى photoUrl ليطابق الكرت
    status: 'approved',
    approvedAt: volunteerData.approvedAt,
    createdAt: volunteerData.approvedAt || ''
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 z-10 flex flex-col"
        >
          {/* الرأس */}
          <div className="flex justify-between items-center bg-slate-50 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800">
              <CreditCard className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-black text-slate-900">بطاقتي الرقمية الرسمية</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ⚡ منطقة العرض الحية وبداخلها كرتك الأصلي الفخم! */}
          <div className="p-4 bg-slate-50 flex flex-col items-center justify-center max-h-[75vh] overflow-y-auto">
            <VolunteerCard volunteer={mappedVolunteerForCard} />
          </div>

          <div className="px-5 py-3 bg-slate-100/50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold">
            منظومة قرار الإدارية الموحدة
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
