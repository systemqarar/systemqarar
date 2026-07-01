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

  // 🌟 تعديل 1: إعدادات حركة مطاطية مرنة وممتعة (Spring Physics) مع إزاحة أفقية ناعمة
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    // 🌟 تعديل 2: تحويل الخلفية إلى [#f8f9fa] لتطابق تماماً هوية الداشبورد
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100/80">
        
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
            // 🌟 تعديل 3: ضبط الانتقال ليكون مطاطياً وسريع الاستجابة (Stiffness & Damping) ليعطي متعة أعلى عند التنقل
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
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

export default OnboardingWizardPage;
