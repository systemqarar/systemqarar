import React, { useState, useEffect } from 'react';
import { useLetters } from '../hooks/useLetters';
import { LetterTemplate } from '../components/LetterTemplate';
import { LetterType, LetterPriority, ILetter } from '../types/letters-document.types';

export const LettersScreen: React.FC = () => {
  const {
    inboxLetters,
    sentLetters,
    loading,
    aiLoading,
    error,
    fetchInbox,
    fetchSent,
    createLetter,
    generateAIDraft
  } = useLetters();

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<ILetter | null>(null);

  // حقول النموذج
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [letterType, setLetterType] = useState<LetterType>('administrative');
  const [priority, setPriority] = useState<LetterPriority>('normal');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchInbox();
    } else {
      fetchSent();
    }
  }, [activeTab, fetchInbox, fetchSent]);

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) {
      alert('يرجى كتابة مسودة أو فكرة عامة ليقوم غيث بصياغتها.');
      return;
    }
    const draftedText = await generateAIDraft(aiPrompt, letterType);
    if (draftedText) {
      setContent(draftedText);
    } else {
      alert('عذراً، فشل غيث في صياغة النص حالياً.');
    }
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !recipientsInput.trim()) {
      alert('جميع الحقول الأساسية مطلوبة.');
      return;
    }

    const recipientIds = recipientsInput.split(',').map(id => id.trim()).filter(id => id.length > 0);

    const success = await createLetter({
      title,
      content,
      letter_type: letterType,
      priority,
      recipient_ids: recipientIds
    });

    if (success) {
      alert('تم إرسال الخطاب وتوثيقه وتنبيه المستلمين فوراً!');
      setTitle('');
      setContent('');
      setRecipientsInput('');
      setAiPrompt('');
      setIsCreateModalOpen(false);
    } else {
      alert(error || 'فشل في إرسال الخطاب الإداري.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-right" dir="rtl">
      {/* رأس الصفحة مع زر الإضافة */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">إدارة الخطابات والوثائق الرسمية</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
        >
          تحرير خطاب جديد +
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 ${activeTab === 'inbox' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-550 hover:text-gray-700'}`}
          onClick={() => setActiveTab('inbox')}
        >
          صندوق الوارد
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 ${activeTab === 'sent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-550 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sent')}
        >
          صندوق الصادر
        </button>
      </div>

      {/* عرض القائمة */}
      {loading ? (
        <div className="flex justify-center my-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === 'inbox' ? inboxLetters : sentLetters).map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedLetter(item)}
              className="bg-white p-5 rounded-xl border border-gray-150 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.priority === 'urgent' ? 'bg-red-50 text-red-650' : 'bg-gray-100 text-gray-655'}`}>
                    {item.priority === 'urgent' ? 'عاجل' : 'عادي'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-mono mb-2">رقم: {item.serial_number}</p>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
          {(activeTab === 'inbox' ? inboxLetters : sentLetters).length === 0 && (
            <p className="text-center text-gray-400 col-span-2 my-12">لا توجد خطابات رسمية في هذا الصندوق حالياً.</p>
          )}
        </div>
      )}

      {/* 📋 1. مودال عرض الخطاب بالتفصيل */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 left-4 text-red-500 font-bold hover:text-red-700"
            >
              إغلاق المعاينة ×
            </button>
            <div className="mt-8">
              <LetterTemplate letter={selectedLetter} />
            </div>
          </div>
        </div>
      )}

      {/* 📝 2. مودال تحرير وإنشاء خطاب جديد */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">تحرير خطاب رسمي جديد</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-650 text-2xl font-light">×</button>
            </div>

            <form onSubmit={handleCreateLetter} className="space-y-5">
              {/* مساعد غيث الذكي */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="text-sm font-bold text-blue-805 mb-2 flex items-center gap-1.5">🤖 صياغة ذكية سريعة بالاستعانة بمساعدك غيث:</h4>
                <textarea
                  className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  placeholder="اكتب أفكارك البسيطة هنا ليتولى غيث صياغتها، مثلاً: طلب إجازة طارئة لظروف عائلية من يوم الأحد القادم..."
                  value={aiPrompt}
                  onChangeText={() => {}} // لتفادي مشاكل React Native السابقة
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAiGeneration}
                  disabled={aiLoading}
                  className="mt-3 bg-blue-600 hover:bg-blue-750 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {aiLoading ? 'جاري الصياغة...' : 'اسأل غيث صياغة النص 🪄'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">عنوان الخطاب الرئيسي:</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: خطاب تكليف بمهمة ميدانية"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">نوع الخطاب:</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value as LetterType)}
                >
                  <option value="administrative">إداري</option>
                  <option value="assignment">تكليف بمهمة</option>
                  <option value="leave_request">طلب إجازة</option>
                  <option value="resignation">استقالة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">المستلمين (أدخل الـ UUIDs مفصولة بفاصلة):</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-left"
                  placeholder="UUID-1, UUID-2, UUID-3"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">نص ومحتوى الخطاب النهائي:</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="محتوى الخطاب الصافي والمعد للصياغة والتوثيق..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال وتوثيق الخطاب 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
