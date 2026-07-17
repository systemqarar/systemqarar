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
    <div className="bg-white p-8 md:p-12 rounded-lg shadow-md max-w-3xl mx-auto my-6 border border-gray-100 flex flex-col min-h-[600px] justify-between text-right dir-rtl">
      {/* 🏛️ الترويسة الإدارية العلوية */}
      <div>
        <div className="flex flex-row-reverse justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">منظومة قرار الإدارية</h2>
          <div className="text-sm text-gray-500 text-left">
            <p>الرقم المتسلسل: <span className="font-mono text-gray-700">{letter.serial_number}</span></p>
            <p>التاريخ: <span className="text-gray-750">{formattedDate}</span></p>
          </div>
        </div>

        {/* خط فاصل أنيق يعكس طابع الأوراق الرسمية */}
        <div className="h-0.5 bg-blue-600 w-full mb-8 rounded-full" />

        {/* ✉️ عنوان الخطاب الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 border-b-2 border-gray-100 pb-2 inline-block px-6">
            {letter.title}
          </h1>
        </div>

        {/* 📄 متن ومحتوى الخطاب الصافي */}
        <div className="text-gray-700 text-base leading-loose whitespace-pre-wrap mb-12">
          {letter.content}
        </div>
      </div>

      {/* 👤 ذيل الخطاب: اسم المسؤول ومنصبه الإداري */}
      <div>
        <div className="flex flex-col items-start pl-8 mb-8 text-left">
          <p className="text-lg font-bold text-gray-900">{letter.sender_name || 'اسم المرسل'}</p>
          <p className="text-sm text-gray-500">{letter.sender_position || 'المنصب الإداري'}</p>
        </div>

        {/* 🔒 التذييل النظامي الصارم بالخط الصغير */}
        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-400 italic">
            هذا الخطاب صادر من النظام تلقائياً ولا يحتاج لختم أو توقيع.
          </p>
        </div>
      </div>
    </div>
  );
};
