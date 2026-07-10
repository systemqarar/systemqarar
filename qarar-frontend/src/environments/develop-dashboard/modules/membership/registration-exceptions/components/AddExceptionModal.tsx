import React, { useState } from 'react';

interface AddExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { volunteer_number: string; full_name: string; photo_url: string | null; unit_name: string; notes: string }) => Promise<void>;
  isActionLoading: boolean;
}

export const AddExceptionModal: React.FC<AddExceptionModalProps> = ({ isOpen, onClose, onConfirm, isActionLoading }) => {
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewMember, setPreviewMember] = useState<any | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  if (!isOpen) return null;

  const handleSearchInHasr = async () => {
    if (!searchNumber.trim()) return;
    try {
      setSearchLoading(true);
      setSearchError(null);
      setPreviewMember(null);

      const res = await fetch(`/api/developer-zone/membership/exceptions/search/${searchNumber.trim()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'هذا الرقم غير مسجل بنظام الحصر');
      }
      const data = await res.json();
      setPreviewMember(data);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!previewMember) return;
    await onConfirm({
      volunteer_number: previewMember.volunteer_number,
      full_name: previewMember.full_name,
      photo_url: previewMember.photo_url,
      unit_name: previewMember.unit_name,
      notes: noteText
    });
    // تصفير الخانات بعد النجاح
    setSearchNumber('');
    setPreviewMember(null);
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" dir="rtl">
      <div className="bg-[#1C2541] border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-[#0B132B]/50">
          <h2 className="text-base font-bold text-white">إضافة عضو مستثنى من الحصر</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اكتب رقم المتطوع هنا وضغط فحص..."
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="flex-1 bg-[#0B132B] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleSearchInHasr} disabled={searchLoading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold text-white">
              {searchLoading ? 'جاري الفحص...' : '🔍 فحص الحصر'}
            </button>
          </div>

          {searchError && <p className="text-xs text-red-400 bg-red-950/30 p-2.5 border border-red-900/30 rounded-xl">⚠️ {searchError}</p>}

          {previewMember && (
            <div className="space-y-4 border-t border-gray-700/60 pt-4">
              <p className="text-xs text-amber-400 font-bold">👀 هل تريد إضافة هذا المتطوع فعلاً؟</p>
              <div className="flex items-center gap-4 bg-[#0B132B] p-4 rounded-xl border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-600 flex items-center justify-center shrink-0">
                  {previewMember.photo_url ? <img src={previewMember.photo_url} alt={previewMember.full_name} className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400 font-bold">Q</span>}
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white">{previewMember.full_name}</h4>
                  <p className="text-xs text-gray-400 mt-1">رقم المتطوع: {previewMember.volunteer_number}</p>
                  <p className="text-xs text-blue-400 mt-0.5">الوحدة: {previewMember.unit_name}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">📌 ملاحظة سبب الاستثناء (تظهر لك مستقبلاً):</label>
                <textarea
                  placeholder="اكتب هنا سبب الاستثناء..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0B132B] border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#0B132B]/50 border-t border-gray-700 flex justify-end gap-2.5">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-xs text-white px-4 py-2.5 rounded-xl">إلغاء</button>
          <button
            disabled={!previewMember || isActionLoading}
            onClick={handleFinalSubmit}
            className={`text-xs text-white font-bold px-5 py-2.5 rounded-xl ${previewMember && !isActionLoading ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 opacity-40 cursor-not-allowed'}`}
          >
            {isActionLoading ? 'جاري الحفظ...' : '✅ تأكيد وإضافة رسمي'}
          </button>
        </div>

      </div>
    </div>
  );
};
