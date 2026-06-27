import { useState } from 'react';

export const useDashboard = () => {
  // الصفحة الشغالة حالياً في السيستم (الافتراضية: الأوفر فيو)
  const [activeTab, setActiveTab] = useState('overview');
  
  // حالة القائمة الجانبية (مفتوحة ولا مقفولة)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
  };
};
