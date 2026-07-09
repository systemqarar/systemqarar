import React, { useState } from 'react';

interface SearchVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deskLabel: string;
  availableVolunteers: any[];
  onSelectVolunteer: (volunteer: any) => void;
}

export const SearchVolunteerModal: React.FC<SearchVolunteerModalProps> = ({
  isOpen,
  onClose,
  deskLabel,
  availableVolunteers,
  onSelectVolunteer,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-[#1C2541] border border-gray-700/70 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* رأس النافذة */}
        <div className="p-5 border-b border-gray-700/60 flex justify-between items-center bg-[#151D35]">
          <div>
            <h3 className="text-base font-bold text-gray-100">تسكين منصب قيادي</h3>
            <p className="text-xs text-blue-400 mt-1">المنصب المستهدف: {deskLabel}</p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery('');
              onClose();
            }}
            className="text-gray-400 hover:text-white text-xs bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all"
          >
            إلغاء وإغلاق
          </button>
        </div>

        {/* حقل البحث الذكي الفوري */}
        <div className="p-4 bg-[#151D35]/30 border-b border-gray-700/40">
          <input
            type="text"
            placeholder="🔍 ابحث بالاسم الكامل أو رقم المتطوع (Volunteer Number)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B132B] border border-gray-600/70 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-right"
            autoFocus
          />
        </div>

        {/* قائمة نتائج الفلترة */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[45vh]">
          {availableVolunteers.filter(vol => {
            const query = searchQuery.toLowerCase().trim();
            return (
              vol.full_name.toLowerCase().includes(query) || 
              vol.volunteer_number.toLowerCase().includes(query)
            );
          }).length > 0 ? (
            availableVolunteers
              .filter(vol => {
                const query = searchQuery.toLowerCase().trim();
                return (
                  vol.full_name.toLowerCase().includes(query) || 
                  vol.volunteer_number.toLowerCase().includes(query)
                );
              })
              .map(vol => (
                <div 
                  key={vol.volunteer_number} 
                  className="flex items-center justify-between bg-[#0B132B]/60 p-3 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div>
                    <p className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{vol.full_name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">رقم المتطوع: {vol.volunteer_number}</p>
                  </div>
                  <button
                    onClick={() => onSelectVolunteer(vol)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                  >
                    اختيار
                  </button>
                </div>
              ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">
              🚫 عذراً، لا يوجد متطوع مطابق لبيانات البحث الحالية.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
