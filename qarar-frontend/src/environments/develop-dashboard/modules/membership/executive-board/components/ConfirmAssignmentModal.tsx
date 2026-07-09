import React from 'react';

interface ConfirmAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  volunteerName: string;
  deskLabel: string;
  isLoading: boolean;
}

export const ConfirmAssignmentModal: React.FC<ConfirmAssignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  volunteerName,
  deskLabel,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex justify-center items-center p-4" dir="rtl">
      <div className="bg-[#1C2541] border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center">
        
        {/* أيقونة سؤال تجميلية متناسقة */}
        <div className="w-14 h-14 bg-blue-950/50 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4 shadow-inner">
          ❓
        </div>

        <h3 className="text-base font-bold text-gray-100 mb-2">تأكيد سلطة التعيين</h3>
        
        <p className="text-sm text-gray-300 mb-6 leading-relaxed bg-[#0B132B]/50 p-4 rounded-xl border border-gray-800/60">
          هل أنت متأكد من أنك تريد تعيين المتطوع: <br />
          <span className="text-blue-400 font-bold text-base block my-1.5">[{volunteerName}]</span>
          رئيساً / مسؤولاً عن منصب: <br />
          <span className="text-amber-400 font-bold block mt-1">[{deskLabel}]</span>؟
        </p>

        {/* أزرار اتخاذ القرار النهائي */}
        <div className="flex gap-3 justify-center">
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري تثبيت القرار برمجياً...' : 'نعم، تأكيد التعيين'}
          </button>
          
          <button
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 rounded-xl transition-all"
          >
            تراجع وإلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
