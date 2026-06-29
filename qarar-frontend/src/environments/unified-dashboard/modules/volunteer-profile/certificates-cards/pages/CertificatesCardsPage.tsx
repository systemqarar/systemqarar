import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, Award, Loader2, ArrowRight, ShieldAlert, FileImage, ExternalLink } from 'lucide-react';
import { useCertificates } from '../hooks/useCertificates';
import { CertificateModal } from '../components/CertificateModal';
import { DigitalCardModal } from '../components/DigitalCardModal';

interface CertificatesCardsPageProps {
  volunteerNumber: string;
  onBack?: () => void;
}

export const CertificatesCardsPage: React.FC<CertificatesCardsPageProps> = ({ volunteerNumber, onBack }) => {
  const { loading, error, certificatesData } = useCertificates(volunteerNumber);
  
  // التحكم في عرض لستة الشهادات تحت الأزرار
  const [showCertificatesList, setShowCertificatesList] = useState(false);

  // التحكم في النوافذ المنبثقة (Modals)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<{ title: string; url: string | null | undefined }>({
    title: '',
    url: null,
  });

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1C2E]" />
        <span className="text-xs font-bold">جاري تحميل السجل الرقمي والشهادات...</span>
      </div>
    );
  }

  if (error || !certificatesData) {
    return (
      <div className="w-full max-w-md mx-auto my-10 bg-red-50 border border-red-100 rounded-2xl p-5 text-center flex flex-col items-center gap-3" dir="rtl">
        <ShieldAlert className="w-10 h-10 text-red-600" />
        <h3 className="text-sm font-black text-red-950">تنبيه من منظومة قرار</h3>
        <p className="text-xs text-red-700 font-medium">{error || 'لم نتمكن من العثور على بيانات المتطوع.'}</p>
        {onBack && (
          <button onClick={onBack} className="text-xs font-bold bg-white text-red-950 px-4 py-2 rounded-xl border border-red-200 shadow-sm active:scale-95 transition-transform">
            عودة للرئيسية
          </button>
        )}
      </div>
    );
  }

  // دالة ذكية لفتح مودال الشهادة المحددة
  const handleOpenCertificate = (title: string, url: string | null | undefined) => {
    setActiveCert({ title, url });
    setIsCertModalOpen(true);
  };

  // تجهيز مصفوفة الشهادات الفعلية المتاحة للمتطوع لعرضها ديناميكياً
  const availableCertificates = [
    ...(certificatesData.isTotTrainer || certificatesData.totCertificateUrl ? [{
      id: 'tot',
      title: `شهادة مدرب TOT المعتمدة (${certificatesData.totYear || '---'})`,
      url: certificatesData.totCertificateUrl,
      icon: '🎖️'
    }] : []),
    ...(certificatesData.otherCertificateUrl ? [{
      id: 'other',
      title: 'وثيقة المرفقات والشهادات الإضافية الأخرى',
      url: certificatesData.otherCertificateUrl,
      icon: '📄'
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full text-right pb-10 max-w-2xl mx-auto px-2"
      dir="rtl"
    >
      {/* الرأس (Header) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-black text-slate-900">البطاقات والشهادات الرقمية</h1>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">إدارة وثائق الهوية والشهادات الصادرة للمتطوع</p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 active:scale-95 transition-transform flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" /> عودة
          </button>
        )}
      </div>

      {/* 🧭 أزرار الخيارات الرئيسية الحرة */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* زر بطاقتي الرقمية المنبثق */}
        <button
          onClick={() => setIsCardModalOpen(true)}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-100 hover:bg-emerald-50/20 active:scale-98 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IdCard className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-xs font-black text-slate-800">بطاقتي الرقمية</span>
          <span className="text-[9px] text-slate-400 font-bold mt-1">عرض بطاقة حصر الذكية</span>
        </button>

        {/* زر شهاداتي لعرض القائمة */}
        <button
          onClick={() => setShowCertificatesList(!showCertificatesList)}
          className={`flex flex-col items-center justify-center p-6 bg-white border rounded-2xl shadow-sm active:scale-98 transition-all group ${showCertificatesList ? 'border-[#7A1C2E] bg-red-50/10' : 'border-slate-100 hover:border-red-100 hover:bg-red-50/20'}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${showCertificatesList ? 'bg-red-100 text-[#7A1C2E]' : 'bg-red-50 text-[#7A1C2E]'}`}>
            <Award className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-xs font-black text-slate-800">شهاداتي المعتمدة</span>
          <span className="text-[9px] text-slate-400 font-bold mt-1">عرض وتحميل ملفات الشهادات</span>
        </button>
      </div>

      {/* 📜 منطقة عرض قائمة الشهادات (تظهر وتختفي ديناميكياً) */}
      <AnimatePresence>
        {showCertificatesList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="text-xs font-black text-slate-500 mb-1 px-1">سجل الشهادات والوثائق المستخرجة:</div>
            
            {availableCertificates.length > 0 ? (
              availableCertificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onClick={() => handleOpenCertificate(cert.title, cert.url)}
                  className="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-4 shadow-2xs hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-slate-50 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 shadow-2xs">{cert.icon}</span>
                    <div className="text-right">
                      <h4 className="text-xs font-black text-slate-800">{cert.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                        <FileImage className="w-3 h-3 text-slate-300" /> اضغط للاستعراض داخل الصفحة
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300" />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold">
                📭 لا توجد شهادات رقمية مرفوعة على هذا الحساب حالياً.
              </div>
            )}

            {/* عرض معلومات إضافية مساعدة كـ سياق إداري */}
            {certificatesData.lastFirstAidRefresher && (
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[11px] text-slate-600 font-medium flex justify-between items-center shadow-3xs">
                <span>آخر دورة تنشيطية للإسعافات الأولية مسجلة:</span>
                <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-3xs">{certificatesData.lastFirstAidRefresher}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📥 النوافذ المنبثقة الذكية (Modals) */}
      <DigitalCardModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        volunteerData={certificatesData}
      />

      <CertificateModal 
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title={activeCert.title}
        certificateUrl={activeCert.url}
      />
    </motion.div>
  );
};
