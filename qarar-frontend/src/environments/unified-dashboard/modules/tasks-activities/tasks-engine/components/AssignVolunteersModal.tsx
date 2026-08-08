import React, { useState, useEffect } from 'react';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { Task } from '../types/tasks-engine.types';

export interface VolunteerOption {
  id: string;
  full_name: string;
  volunteer_number: string;
  avatar_url?: string;
}

interface AssignVolunteersModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignVolunteersModal: React.FC<AssignVolunteersModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const engine = useTasksEngine() || {};
  const { searchVolunteers, assignVolunteers, loading } = engine;

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VolunteerOption[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<VolunteerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // حساب المقاعد المتبقية
  const maxAllowed = task?.max_volunteers || 1;
  const currentAssignedCount = task?.assigned_count ?? task?.assignments?.length ?? 0;
  const remainingSlots = Math.max(0, maxAllowed - currentAssignedCount);

  // البحث الفوري مع Debounce
  useEffect(() => {
    if (!query.trim() || !searchVolunteers) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchVolunteers(query.trim());
        setSearchResults(results || []);
      } catch (err) {
        console.error("خطأ أثناء البحث عن المتطوعين:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchVolunteers]);

  if (!isOpen || !task) return null;

  // إضافة متطوع للقائمة المحددة
  const handleSelect = (volunteer: VolunteerOption) => {
    if (selectedVolunteers.some((v) => v.id === volunteer.id)) return;
    if (selectedVolunteers.length >= remainingSlots) return;

    setSelectedVolunteers([...selectedVolunteers, volunteer]);
  };

  // إزالة متطوع من القائمة المحددة
  const handleRemove = (volunteerId: string) => {
    setSelectedVolunteers(selectedVolunteers.filter((v) => v.id !== volunteerId));
  };

  // حفظ الإسناد الجماعي
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVolunteers.length === 0 || !assignVolunteers) return;

    const volunteerIds = selectedVolunteers.map((v) => v.id);
    const success = await assignVolunteers(task.id, volunteerIds);

    if (success) {
      handleClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleClose = () => {
    setSelectedVolunteers([]);
    setQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        
        {/* الهيدر */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">إسناد وتنسيق المتطوعين</h3>
            <p className="text-xs text-slate-400 mt-1">
              المهمة: <span className="font-bold text-emerald-400">{task.title}</span> | 
              المقاعد المتاحة: <span className="font-bold text-emerald-400">{remainingSlots - selectedVolunteers.length}</span> من <span className="font-bold">{maxAllowed}</span>
            </p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* حقل البحث */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ابحث عن المتطوع بالاسم أو بالرقم التعريفي *
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                disabled={selectedVolunteers.length >= remainingSlots}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  selectedVolunteers.length >= remainingSlots
                    ? "وصلت للحد الأقصى المتاح لهذه المهمة"
                    : "اكتب الاسم أو الرقم..."
                }
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-slate-800/40 disabled:cursor-not-allowed placeholder-slate-500"
              />
              {isSearching && (
                <div className="absolute left-3 top-3.5 text-xs text-emerald-400 font-bold animate-pulse">
                  جاري البحث...
                </div>
              )}
            </div>

            {/* قائمة نتائج البحث (Card Layout المطابق للصورة) */}
            {searchResults.length > 0 && (
              <div className="bg-slate-800/95 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto mt-2 p-2 space-y-2 divide-y divide-slate-700/50">
                {searchResults.map((vol) => {
                  const isAlreadySelected = selectedVolunteers.some((v) => v.id === vol.id);
                  return (
                    <div
                      key={vol.id}
                      className={`pt-2 first:pt-0 flex justify-between items-center p-2.5 rounded-lg transition-colors ${
                        isAlreadySelected
                          ? 'bg-slate-800 opacity-50'
                          : 'hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* الصورة الشخصية أو الأيقونة الافتراضية */}
                        {vol.avatar_url ? (
                          <img
                            src={vol.avatar_url}
                            alt={vol.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-600"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                            {vol.full_name?.slice(0, 2) || '👤'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xs text-white">{vol.full_name}</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            رقم المتطوع: <span className="font-mono text-emerald-400">{vol.volunteer_number}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAlreadySelected || selectedVolunteers.length >= remainingSlots}
                        onClick={() => handleSelect(vol)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isAlreadySelected
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {isAlreadySelected ? 'تم الاختيار' : 'اختيار'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {query.trim() && !isSearching && searchResults.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-lg mt-2 text-xs text-center text-slate-400">
                لا يوجد متطوع بهذا الاسم أو الرقم "{query}"
              </div>
            )}
          </div>

          {/* المتطوعون المختارون */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              المتطوعون المختارون للإسناد ({selectedVolunteers.length}):
            </label>
            {selectedVolunteers.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-800/50 rounded-xl border border-slate-700">
                {selectedVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center gap-2 bg-emerald-950/80 text-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-800"
                  >
                    <span>{vol.full_name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({vol.volunteer_number})</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(vol.id)}
                      className="text-rose-400 hover:text-rose-300 mr-1 font-extrabold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-xs text-slate-500">
                لم يتم اختيار أي متطوع بعد. ابحث أعلاه للبدء.
              </div>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors"
            >
              إلغاء وإغلاق
            </button>
            <button
              type="submit"
              disabled={loading || selectedVolunteers.length === 0}
              className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? 'جاري الإسناد...' : `إسناد (${selectedVolunteers.length}) متطوعين`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
