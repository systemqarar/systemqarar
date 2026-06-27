import { ComponentType } from 'react';

// كتالوج أزرار التنقل الرئيسية في السيستم كله
export interface NavigationItem {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
}
