// 1. القائمة الرسمية للمناصب الـ 16 الرسمية المعتمدة
export type AdminPosition =
  // 👥 مناصب المكتب التنفيذي للوحدة (14 منصب)
  | 'unit_head' | 'deputy_unit_head' 
  | 'unit_secretary' | 'deputy_unit_secretary'
  | 'financial_secretary' | 'deputy_financial_secretary'
  | 'media_secretary' | 'deputy_media_secretary'
  | 'social_secretary' | 'deputy_social_secretary'
  | 'training_youth_secretary' | 'deputy_training_youth_secretary'
  | 'women_secretary' | 'deputy_women_secretary' 
  // 🏛️ مناصب الإشراف والتدريب التابعة للمحلية (منصبين)
  | 'locality_training_director' | 'supervisory_office';

// 2. واجهة بيانات العضو المشغول بمنصب حالياً في الهيكل الإداري
export interface IBoardMember {
  user_id: string;
  volunteer_number: string;
  role: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  photo_url: string | null;
  admin_position: AdminPosition;
}

// 3. واجهة بيانات المتطوع المتاح للتعيين (بنك الخيارات)
export interface IAvailableVolunteer {
  user_id: string;
  volunteer_number: string;
  full_name: string;
  phone: string;
}

// 4. هيكلة مصفوفة الإعدادات لتسهيل الفرز البصري في الشاشات
export interface IPositionConfig {
  key: AdminPosition;
  label: string;
  category: 'unit' | 'locality'; // تصنيف المنصب لفرزه في الواجهة
}

// 5. الخريطة المعتمدة للمناصب بأسمائها العربية وتصنيفاتها الميدانية
export const ADMIN_POSITIONS_CONFIG: IPositionConfig[] = [
  // 👥 مكاتب الوحدة التنفيذية
  { key: 'unit_head', label: 'رئيس الوحدة', category: 'unit' },
  { key: 'deputy_unit_head', label: 'نائب رئيس الوحدة', category: 'unit' },
  { key: 'unit_secretary', label: 'أمين أمانة التنسيق والمتابعة والسرية', category: 'unit' },
  { key: 'deputy_unit_secretary', label: 'مساعد أمين أمانة التنسيق والمتابعة', category: 'unit' },
  { key: 'financial_secretary', label: 'أمين الأمانة المالية', category: 'unit' },
  { key: 'deputy_financial_secretary', label: 'مساعد أمين الأمانة المالية', category: 'unit' },
  { key: 'media_secretary', label: 'أمين أمانة الإعلام والتوثيق الإلكتروني', category: 'unit' },
  { key: 'deputy_media_secretary', label: 'مساعد أمين أمانة الإعلام والتوثيق', category: 'unit' },
  { key: 'social_secretary', label: 'أمين أمانة البرامج والعمل الاجتماعي', category: 'unit' },
  { key: 'deputy_social_secretary', label: 'مساعد أمين أمانة البرامج والعمل الاجتماعي', category: 'unit' },
  { key: 'training_youth_secretary', label: 'أمين أمانة التدريب وتنمية القدرات الشبابية', category: 'unit' },
  { key: 'deputy_training_youth_secretary', label: 'مساعد أمين أمانة التدريب وتنمية القدرات', category: 'unit' },
  { key: 'women_secretary', label: 'أمين أمانة شؤون المرأة المتطوعة', category: 'unit' },
  { key: 'deputy_women_secretary', label: 'مساعد أمين أمانة شؤون المرأة المتطوعة', category: 'unit' },

  // 🏛️ مكاتب وإشراف المحلية
  { key: 'locality_training_director', label: 'مدير مكتب تدريب الإسعافات الأولية بالمحلية', category: 'locality' },
  { key: 'supervisory_office', label: 'المكتب الإشرافي للوحدة', category: 'locality' }
];
