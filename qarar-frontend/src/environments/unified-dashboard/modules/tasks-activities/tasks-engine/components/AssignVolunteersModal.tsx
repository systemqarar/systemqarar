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

  // حساب المقاعد المتبقية بشكل مؤسسي بدون استخدام (as any)
  const maxAllowed = task?.max_volunteers || 1;
  const currentAssignedCount = task?.assigned_count ?? task?.assignments?.length ?? 0;
  const remainingSlots = Math.max(0, maxAllowed - currentAssignedCount);

  // البحث الفوري مع التوقف المؤقت (Debounce 300ms)
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
    setQuery('');
    setSearchResults([]);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        
        {/* الهيدر */}
        <div className="border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">إسناد متطوعين للمهمة</h3>
          <p className="text-xs text-gray-500 mt-1">
            المهمة: <span className="font-bold text-emerald-700">{task.title}</span> | 
            المقاعد المتاحة: <span className="font-bold text-emerald-600">{remainingSlots - selectedVolunteers.length}</span> من أصل <span className="font-bold">{maxAllowed}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* حقل البحث */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ابحث عن المتطوع بالاسم أو بالرقم التعريفي (مثل SRCS-...) *
            </label>
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
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {isSearching && (
              <div className="absolute left-3 top-9 text-xs text-emerald-600 font-bold">جاري البحث...</div>
            )}

            {/* قائمة نتائج البحث (Dropdown) */}
            {searchResults.length > 0 && (
              <ul className="absolute z-30 right-0 left-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto mt-1 divide-y">
                {searchResults.map((vol) => {
                  const isAlreadySelected = selectedVolunteers.some((v) => v.id === vol.id);
                  return (
                    <li
                      key={vol.id}
                      onClick={() => !isAlreadySelected && handleSelect(vol)}
                      className={`p-3 text-xs flex justify-between items-center transition-colors ${
                        isAlreadySelected
                          ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'hover:bg-emerald-50 cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gray-800">{vol.full_name}</div>
                        <div className="text-gray-400 text-[10px]">{vol.volunteer_number}</div>
                      </div>
                      {isAlreadySelected ? (
                        <span className="text-emerald-600 font-bold">تم اختياره</span>
                      ) : (
                        <span className="text-gray-400 font-bold">+ إضافة</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {query.trim() && !isSearching && searchResults.length === 0 && (
              <div className="absolute z-30 right-0 left-0 bg-white border p-3 rounded-xl shadow-lg mt-1 text-xs text-center text-gray-500">
                لا توجد نتائج مطابقة لـ "{query}"
              </div>
            )}
          </div>

          {/* المتطوعون المحددون (Selected Chips) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              المتطوعون المختارون للإسناد ({selectedVolunteers.length}):
            </label>
            {selectedVolunteers.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border">
                {selectedVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-300"
                  >
                    <span>{vol.full_name}</span>
                    <span className="text-[10px] opacity-75">({vol.volunteer_number})</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(vol.id)}
                      className="text-rose-600 hover:text-rose-800 mr-1 font-extrabold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-xs text-gray-400">
                لم يتم اختيار أي متطوع بعد. ابحث أعلاه لاختيار المتطوعين.
              </div>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || selectedVolunteers.length === 0}
              className="px-5 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'جاري الإسناد...' : `إسناد (${selectedVolunteers.length}) متطوعين`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
