import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  certificateUrl: string | null | undefined;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, title, certificateUrl }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
        {/* الخلفية لإغلاق المودال عند الضغط عليها */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* جسم النافذة */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[85vh]"
        >
          {/* الرأس */}
          <div className="flex justify-between items-center bg-slate-50 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-[#7A1C2E]" />
              <h3 className="text-sm font-black text-slate-900">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوى العرض */}
          <div className="p-5 flex-1 bg-slate-50/50 flex items-center justify-center overflow-y-auto">
            {certificateUrl ? (
              <img 
                src={certificateUrl} 
                alt={title} 
                className="max-w-full max-h-[55vh] object-contain rounded-lg border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-bold">
                ⚠️ لم يتم رفع وثيقة هذه الشهادة بعد في النظام.
              </div>
            )}
          </div>

          {/* أسفل النافذة (التحكم) */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
            {certificateUrl && (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#7A1C2E] px-4 py-2 rounded-xl active:scale-95 transition-transform shadow-sm"
              >
                <Download className="w-4 h-4" /> تحميل المستند المعتمد
              </a>
            )}
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
