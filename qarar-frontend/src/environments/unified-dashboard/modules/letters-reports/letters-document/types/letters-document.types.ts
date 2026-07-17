export type LetterType = 'administrative' | 'assignment' | 'leave_request' | 'resignation';
export type LetterStatus = 'draft' | 'pending' | 'approved' | 'archived';
export type LetterPriority = 'normal' | 'medium' | 'urgent';

// واجهة البيانات المطلوبة لإنشاء خطاب جديد من واجهة المستخدم
export interface ICreateLetterInput {
  letter_type: LetterType;
  title: string;
  content: string;
  attachments?: string[]; // مصفوفة روابط كلاودنري الجاهزة
  priority?: LetterPriority;
  recipient_ids: string[]; // مصفوفة المعرفات (UUIDs) للأعضاء المستلمين
  expires_at?: string | null;
}

// واجهة البيانات الكاملة للخطاب كما ترجع من الباكيند لقراءتها وعرضها في الواجهات
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
  expires_at: string | null;
  created_at: string;
  
  // حقول إضافية مرنة تأتي من عمليات الـ JOIN في قاعدة البيانات
  recipients?: Array<{ recipient_id: string; is_read: boolean }>;
  sender_name?: string;
  sender_position?: string;
  is_read?: boolean;
  read_at?: string | null;
}
