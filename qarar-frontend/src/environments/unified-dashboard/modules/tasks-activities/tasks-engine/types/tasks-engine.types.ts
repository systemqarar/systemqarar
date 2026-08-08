// =============================================================================
// Tasks & Activities Engine Module Types - System Qarar
// =============================================================================

// --- 1. Union Types & Enums ---
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type AssignmentStatus = 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'completed' | 'excused' | 'rejected';
export type ActivityStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CreationSource = 'manual' | 'ai_chat' | 'ai_meeting' | 'annual_plan';
export type ActionType = 'standard' | 'form_filling' | 'file_upload';
export type AssignmentType = 'direct' | 'open_announcement'; // متوافق مع جدول tasks.assignment_type ('direct' / 'open')

// --- 2. Task Assignments ---
// مطابق تماماً لجدول task_assignments في قاعدة البيانات
export interface TaskAssignment {
  id: string; // المعرف الفرعي uuid لجدول task_assignments
  task_id: string; // ربط uuid بجدول tasks
  volunteer_id: string; // ربط uuid بجدول users / volunteer_profiles
  assigned_by?: string | null; // uuid يقبل فارغ
  assignment_mode: 'direct' | 'self_applied'; // character varying بقيمة افتراضية 'direct'
  status: AssignmentStatus; // character varying بقيمة افتراضية 'assigned'
  excuse_reason?: string | null; // text يقبل فارغ
  submission_data?: Record<string, any>; // jsonb بقيمة افتراضية '{}'
  assigned_at: string; // timestamp with time zone بقيمة افتراضية now()
  completed_at?: string | null; // timestamp with time zone يقبل فارغ
  // بيانات المتطوع المدمجة من جدول volunteer_profiles وجدول users عند عمل Join
  volunteer_profile?: {
    full_name: string;
    volunteer_number: string | null;
    photo_url: string | null;
  };
}

// --- 3. Main Task Entity ---
// مطابق تماماً لجدول tasks في قاعدة البيانات
export interface Task {
  id: string; // uuid بقيمة افتراضية gen_random_uuid()
  activity_id?: string | null; // uuid يقبل فارغ
  committee_id?: string | null; // uuid يقبل فارغ
  title: string; // character varying
  description?: string | null; // text يقبل فارغ
  created_by: string; // uuid لا يقبل فارغ
  creator_name?: string; // للعرض في الواجهة (اسم المنشئ)
  creation_source: CreationSource; // character varying بقيمة افتراضية 'manual'
  action_type: ActionType; // character varying بقيمة افتراضية 'standard'
  target_form_id?: string | null; // character varying يقبل فارغ
  assignment_type: AssignmentType; // character varying بقيمة افتراضية 'direct'
  max_volunteers: number; // integer بقيمة افتراضية 1
  priority: TaskPriority; // character varying بقيمة افتراضية 'normal'
  status: TaskStatus; // character varying بقيمة افتراضية 'open'
  start_time?: string | null; // timestamp with time zone يقبل فارغ
  due_time: string; // timestamp with time zone لا يقبل فارغ
  created_at: string; // timestamp with time zone بقيمة افتراضية now()
  assignments?: TaskAssignment[]; // الربط الهيكلي مع جدول التعيينات
}

// --- 4. Activity Committees ---
// مطابق تماماً لجدول activity_committees في قاعدة البيانات
export interface ActivityCommittee {
  id: string; // uuid بقيمة افتراضية gen_random_uuid()
  activity_id: string; // uuid لا يقبل فارغ
  name: string; // character varying لا يقبل فارغ (اسم اللجنة الفعلي بالداتابيز)
  committee_name?: string; // توافق مرن مع أشكال المخرجات المختلفة بالواجهة
  leader_id?: string | null; // uuid يقبل فارغ لربطه بقائد اللجنة
  description?: string | null; // text يقبل فارغ
  created_at: string; // timestamp with time zone بقيمة افتراضية now()
}

// --- 5. Main Activity Entity ---
// مطابق تماماً لجدول activities في قاعدة البيانات
export interface Activity {
  id: string; // uuid بقيمة افتراضية gen_random_uuid()
  title: string; // character varying لا يقبل فارغ
  description?: string | null; // text يقبل فارغ
  icon?: string; // حقل إضافي للواجهة الرسومية
  unit_id?: number | null; // integer يقبل فارغ لربطه بالوحدة التابع لها
  created_by: string; // uuid لا يقبل فارغ
  creation_source: CreationSource; // character varying بقيمة افتراضية 'manual'
  status: ActivityStatus; // character varying بقيمة افتراضية 'planned'
  start_date?: string | null; // timestamp with time zone يقبل فارغ
  end_date?: string | null; // timestamp with time zone يقبل فارغ
  created_at: string; // timestamp with time zone بقيمة افتراضية now()
  committees?: ActivityCommittee[]; // ربط هرمي للجان التابعة للنشاط
  tasks?: Task[]; // ربط هرمي مباشر للمهام التابعة للنشاط
}

// --- 6. Input Payload Interfaces (DTOs) ---

/** مدخلات إنشاء المهمة */
export interface CreateTaskInput {
  activity_id?: string | null;
  committee_id?: string | null;
  title: string;
  description?: string;
  creation_source?: CreationSource;
  action_type?: ActionType;
  target_form_id?: string;
  assignment_type?: AssignmentType;
  max_volunteers?: number;
  priority?: TaskPriority;
  start_time?: string | null;
  due_time: string;
  assignee_ids?: string[]; // مصفوفة الـ user_id للمتطوعين المحددين في التعيين المباشر الفوري
}

/** مدخلات تحديث المهمة */
export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id?: string;
  status?: TaskStatus;
}

/** مدخلات إنشاء لجنة فرعية داخل نشاط */
export interface CreateCommitteeInput {
  name: string; // الحقل الأساسي المقابل لـ name بالداتابيز
  committee_name?: string;
  description?: string;
  leader_id?: string | null;
}

/** مدخلات إنشاء نشاط برامجي جديد */
export interface CreateActivityInput {
  title: string;
  description?: string;
  icon?: string;
  unit_id?: number | null;
  status?: ActivityStatus;
  start_date?: string | null;
  end_date?: string | null;
  creation_source?: CreationSource;
  committees?: CreateCommitteeInput[];
}

/** مدخلات تحديث النشاط البرامجي */
export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  id?: string;
}

// --- 7. Task Filters & Search Parameters ---
export interface TaskFilterOptions {
  activity_id?: string;
  committee_id?: string;
  volunteer_id?: string;
  volunteer_number?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignment_type?: AssignmentType;
}
