// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/components/GhaithFeedbackModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GhaithFeedbackModalProps {
  message: string | null;
  onClose: () => void;
}

export const GhaithFeedbackModal: React.FC<GhaithFeedbackModalProps> = ({ message, onClose }) => {
  // إعدادات حركة نافذة غيث (تظهر من الأسفل للأعلى بنظام Spring مطاطي)
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  };

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-50 p-6 text-center overflow-hidden relative"
          >
            {/* الهوية البصرية العلوية للمساعد الذكي */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-teal-400" />
            
            {/* أيقونة غيث */}
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-blue-100/60 shadow-inner">
              🤖
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">تنبيه من المساعد الرقمي (غيث)</h3>
            
            {/* نص الرسالة السودانية اللطيفة */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50/70 p-4 rounded-2xl border border-gray-100/40">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-2xl transition-colors duration-200 shadow-sm text-sm"
            >
              حاضر، غالي والطلب رخيص 👍
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
