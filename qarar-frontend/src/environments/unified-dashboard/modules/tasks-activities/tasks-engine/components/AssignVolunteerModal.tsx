import React, { useState, useEffect } from 'react';
import { useTasksEngine, VolunteerSearchOption } from '../hooks/useTasksEngine';
import { Task } from '../types/tasks-engine.types';

interface AssignVolunteerModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignVolunteerModal: React.FC<AssignVolunteerModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const engine = useTasksEngine() || {};
  const { searchVolunteers, assignVolunteer, loading } = engine;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VolunteerSearchOption[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerSearchOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // بحث فوري (Debounced Search)
  useEffect(() => {
    if (!query.trim() || !searchVolunteers) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchVolunteers(query);
      setResults(res || []);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchVolunteers]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer || !assignVolunteer) return;

    const success = await assignVolunteer(task.id, selectedVolunteer.id);
    if (success) {
      handleClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleClose = () => {
    setSelectedVolunteer(null);
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl dir-rtl" dir="rtl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">إسناد متطوع للمهمة</h3>
        <p className="text-xs text-gray-500 mb-4">
          المهمة: <span className="font-bold text-emerald-700">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ابحث عن المتطوع بالاسم أو الرقم *
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedVolunteer) setSelectedVolunteer(null);
              }}
              placeholder="اكتب الاسم أو رقم المتطوع..."
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {isSearching && (
              <span className="text-xs text-gray-400 mt-1 block">جاري البحث...</span>
            )}

            {/* القائمة المنسدلة للنتائج */}
            {results.length > 0 && !selectedVolunteer && (
              <ul className="absolute z-10 right-0 left-0 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 divide-y">
                {results.map((vol) => (
                  <li
                    key={vol.id}
                    onClick={() => {
                      setSelectedVolunteer(vol);
                      setQuery(vol.full_name);
                      setResults([]);
                    }}
                    className="p-2.5 text-xs hover:bg-emerald-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-bold text-gray-800">{vol.full_name}</span>
                    <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      #{vol.volunteer_number}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* المتطوع المختار */}
          {selectedVolunteer && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 block">{selectedVolunteer.full_name}</span>
                <span className="text-emerald-700">رقم المتطوع: #{selectedVolunteer.volunteer_number}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedVolunteer(null);
                  setQuery('');
                }}
                className="text-rose-600 hover:underline font-bold"
              >
                تغيير
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !selectedVolunteer}
              className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'جاري الإسناد...' : 'إسناد المتطوع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
