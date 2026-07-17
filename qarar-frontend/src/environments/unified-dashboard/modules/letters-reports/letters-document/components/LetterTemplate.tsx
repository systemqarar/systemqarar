import React from 'react';
import { ILetter } from '../types/letters-document.types';

interface LetterTemplateProps {
  letter: ILetter;
}

export const LetterTemplate: React.FC<LetterTemplateProps> = ({ letter }) => {
  const formattedDate = letter.created_at
    ? new Date(letter.created_at).toLocaleDateString('ar-SD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div 
      className="bg-white p-6 md:p-12 rounded-lg shadow-md max-w-3xl mx-auto my-6 border border-gray-100 flex flex-col min-h-[700px] justify-between text-right" 
      dir="rtl"
    >
      {/* 🏛️ القسم العلوي: الترويسة الرسمية وجسم الخطاب */}
      <div>
        {/* الترويسة المؤسسية الموزعة صح بدون تداخل */}
        <div className="flex justify-between items-start mb-6">
          {/* اليمين: الديباجة الإدارية الرسمية للهلال الأحمر */}
          <div className="text-right space-y-1 font-bold text-gray-800 text-sm md:text-base">
            <p className="text-lg text-red-600 font-extrabold">جمعية الهلال الأحمر السوداني</p>
            <p>فرع ولاية الخرطوم</p>
            <p>مكتب إشراف محلية جبل أولياء</p>
            <p className="text-xs text-gray-500 font-medium">وحدة الكلاكلة شرق</p>
          </div>

          {/* اليسار: مكان الشعار وبيانات الصادر القادمة من الباكيند */}
          <div className="text-left flex flex-col items-end space-y-1 text-xs text-gray-500">
            <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 mb-1">
              [ شعار الجمعية ]
            </div>
            <p><span className="font-bold text-gray-700">رقم الخطاب:</span> <span className="font-mono text-gray-900 font-bold">{letter.serial_number}</span></p>
            <p><span className="font-bold text-gray-700">التاريخ:</span> {formattedDate}</p>
          </div>
        </div>

        {/* خط فاصل أحمر يعكس هوية جمعية الهلال الأحمر */}
        <div className="h-0.5 bg-red-600 w-full mb-8 rounded-full" />

        {/* ✉️ عنوان الخطاب الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 inline-block px-6">
            {letter.title}
          </h1>
        </div>

        {/* 📄 متن ومحتوى الخطاب الصافي */}
        <div className="text-gray-800 text-base md:text-lg leading-loose whitespace-pre-wrap mb-12 px-2">
          {letter.content}
        </div>
      </div>

      {/* 👤 القسم السفلي: التوقيع وقائمة التوزيع والتوثيق */}
      <div className="mt-auto space-y-8">
        {/* التوقيع والمنصب (على اليسار تماشياً مع الأعراف الإدارية العربية) */}
        <div className="flex flex-col items-center mr-auto w-64 text-center pl-4">
          <p className="text-base md:text-lg font-black text-gray-950">{letter.sender_name || 'اسم المرسل'}</p>
          <p className="text-xs md:text-sm text-gray-500 font-medium">{letter.sender_position || 'المنصب الإداري'}</p>
          <div className="pt-6 text-2xs text-gray-300 border-t border-dashed border-gray-100 w-full mt-2">
            [ التوقيع الإلكتروني ]
          </div>
        </div>

        {/* 📄 قائمة التوزيع الرسمية (صورة إلى) */}
        <div className="border-t border-gray-100 pt-4 text-right text-xs text-gray-500">
          <p className="font-bold text-gray-700 mb-1">صورة إلى:</p>
          <ul className="list-disc list-inside pr-2 space-y-0.5 text-gray-400">
            <li>الملف العام بالمكتب للمتابعة الحثيثة.</li>
            <li>الجهات ذات الصلة.</li>
          </ul>
        </div>

        {/* 🔒 التذييل النظامي الإلكتروني البسيط بالخط الصغير */}
        <div className="text-center pt-2 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 italic">
            مستند رسمي صادر تلقائياً من النظام الإداري لمتطوعي وحدة الكلاكلة شرق ولا يتطلب ختماً ورقياً.
          </p>
        </div>
      </div>
    </div>
  );
};
