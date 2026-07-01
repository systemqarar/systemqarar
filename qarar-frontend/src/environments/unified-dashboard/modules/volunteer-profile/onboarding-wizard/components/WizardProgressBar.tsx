import React from 'react';
import { motion } from 'framer-motion';

export const WizardProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8" dir="rtl">
      {/* النصوص التوضيحية لنسبة التقدم بتنسيق متناسق */}
      <div className="flex justify-between mb-2 text-xs font-bold text-gray-500 select-none">
        <span className="text-[#800020]">الخطوة {currentStep + 1} من {totalSteps}</span>
        <span className="font-mono text-gray-400">{Math.round(progressPercentage)}%</span>
      </div>
      
      {/* مجرى شريط التقدم الخلفي المستدير */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#800020] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          // 🌟 تعديل الحركة لتصبح مطاطية وديناميكية (Elastic Spring) لزيادة متعة التجربة البصرية
          transition={{ type: 'spring', stiffness: 160, damping: 15 }}
        />
      </div>
    </div>
  );
};

export default WizardProgressBar;
