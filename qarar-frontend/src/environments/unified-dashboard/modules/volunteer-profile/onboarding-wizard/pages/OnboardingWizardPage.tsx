import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingWizard } from '../hooks/useOnboardingWizard';
import { WizardProgressBar } from '../components/WizardProgressBar';
import { StepPersonalData } from '../components/StepPersonalData';
import { StepAddressDepartment } from '../components/StepAddressDepartment';
import { StepPhotoSecure } from '../components/StepPhotoSecure';

export const OnboardingWizardPage: React.FC<{ onWizardComplete: () => void }> = ({ onWizardComplete }) => {
  const {
    currentStep,
    formData,
    updateFields,
    nextStep,
    prevStep,
    handleFinalSubmit,
    isSubmitting
  } = useOnboardingWizard(onWizardComplete);

  const totalSteps = 3;

  // إعدادات حركة الأنيميشن الاحترافية والمرحة (Slide Up + Fade)
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        
        {/* شريطة تقدم ديناميكية ومطاطية */}
        <WizardProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* احتضان الخطوات بأنيميشن ناعم ومتجاوب بالكامل مع الموبايل */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentStep === 0 && (
              <StepPersonalData 
                formData={formData} updateFields={updateFields} 
                nextStep={nextStep} prevStep={prevStep} 
              />
            )}
            {currentStep === 1 && (
              <StepAddressDepartment 
                formData={formData} updateFields={updateFields} 
                nextStep={nextStep} prevStep={prevStep} 
              />
            )}
            {currentStep === 2 && (
              <StepPhotoSecure 
                formData={formData} updateFields={updateFields} 
                nextStep={nextStep} prevStep={prevStep} 
                isSubmitting={isSubmitting} onFinalSubmit={handleFinalSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
