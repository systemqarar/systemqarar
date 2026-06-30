import React from 'react';
import { motion } from 'framer-motion';

export const WizardProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
        <span>الخطوة {currentStep + 1} من {totalSteps}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-red-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </div>
    </div>
  );
};
