export type LetterType = 'administrative' | 'assignment' | 'leave_request' | 'resignation';
export type LetterStatus = 'draft' | 'pending' | 'approved' | 'archived';
export type LetterPriority = 'normal' | 'medium' | 'urgent';

// واجهة البيانات القادمة من الفرونتد عند إنشاء خطاب جديد
export interface ICreateLetterInput {
  letter_type: LetterType;
  title: string;
  content: string;
  attachments?: string[]; // روابط كلاودنري الجاهزة
  priority?: LetterPriority;
  recipient_ids: string[]; // مصفوفة تحتوي على الـ UUIDs للمستلمين المحددين
  expires_at?: string | null;
}

// واجهة الخطاب الكامل المسترجع من قاعدة البيانات
export interface ILetter {
  id: string;
  serial_number: string;
  sender_id: string;
  letter_type: LetterType;
  title: string;
  content: string;
  attachments: string[];
  status: LetterStatus;
  priority: LetterPriority;
  expires_at: Date | null;
  created_at: Date;
}
