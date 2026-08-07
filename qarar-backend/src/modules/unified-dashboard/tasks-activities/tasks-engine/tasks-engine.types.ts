export type CreationSource = 'manual' | 'ai_chat' | 'ai_meeting' | 'annual_plan' | 'executive_admin' | 'ai_assistant';
export type ActivityStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskActionType = 'standard' | 'form_filling' | 'file_upload';
export type AssignmentType = 'direct' | 'open_announcement';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type AssignmentStatus = 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'completed' | 'excused' | 'rejected';

// --- إسنادات المتطوعين ---
export interface TaskAssignment {
  id?: string;
  assignment_id?: string;
  task_id?: string;
  volunteer_id: string;
  volunteer_name?: string;
  assigned_by?: string;
  assignment_mode?: 'direct' | 'self_applied';
  status: AssignmentStatus;
  excuse_reason?: string;
  submission_data?: Record<string, any>;
  assigned_at: string;
  completed_at?: string;
}

// --- المهمة (تأتي مفردة أو داخل شجرة النشاط/اللجنة) ---
export interface Task {
  id: string;
  activity_id?: string | null;
  committee_id?: string | null;
  title: string;
  description?: string;
  created_by: string;
  creator_name?: string;
  creation_source?: CreationSource;
  action_type: TaskActionType;
  target_form_id?: string;
  assignment_type: AssignmentType;
  max_volunteers: number;
  priority: TaskPriority;
  status: TaskStatus;
  start_time?: string;
  due_time: string;
  created_at: string;
  assignments?: TaskAssignment[];
}

// --- لجنة النشاط البرامجي ---
export interface ActivityCommittee {
  id: string;
  activity_id: string;
  name: string;
  leader_id?: string;
  leader_name?: string;
  description?: string;
  created_at?: string;
  tasks?: Task[];
}

// --- النشاط البرامجي (الهيكل الشجري الكامل) ---
export interface Activity {
  id: string;
  title: string;
  description?: string;
  unit_id?: number;
  created_by: string;
  creator_name?: string;
  creation_source: CreationSource;
  status: ActivityStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  committees?: ActivityCommittee[];
  direct_tasks?: Task[];
  total_tasks?: number;
}

// --- DTOs / Inputs للإنشاء والتعديل ---

export interface CreateCommitteeInput {
  name: string;
  leader_id?: string;
  description?: string;
}

export interface CreateActivityInput {
  title: string;
  description?: string;
  unit_id?: number;
  start_date?: string;
  end_date?: string;
  creation_source?: CreationSource;
  committees?: CreateCommitteeInput[];
}

export interface CreateTaskInput {
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  action_type?: TaskActionType;
  target_form_id?: string;
  assignment_type?: AssignmentType;
  max_volunteers?: number;
  priority?: TaskPriority;
  start_time?: string;
  due_time: string;
  assignee_ids?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  max_volunteers?: number;
  priority?: TaskPriority;
  due_time?: string;
  status?: TaskStatus;
}

export interface UpdateCommitteeInput {
  name?: string;
  leader_id?: string;
  description?: string;
}

// أسماء مستعارة لتطابق المسمى القديم مع الجديد
export type CreateActivityDTO = CreateActivityInput;
export type CreateTaskDTO = CreateTaskInput;
