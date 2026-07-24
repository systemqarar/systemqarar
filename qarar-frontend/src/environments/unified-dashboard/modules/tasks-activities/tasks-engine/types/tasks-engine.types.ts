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
export type AssignmentType = 'direct' | 'open_announcement';

// --- 2. Task Assignments ---
export interface TaskAssignment {
  assignment_id: string;
  volunteer_id: string;
  assigned_by?: string;
  assignment_mode?: 'direct' | 'self_applied';
  status: AssignmentStatus;
  excuse_reason?: string;
  submission_data?: Record<string, any>;
  assigned_at: string;
  completed_at?: string;
}

// --- 3. Main Task Entity ---
export interface Task {
  id: string;
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  creator_name?: string;
  created_by?: string;
  creation_source?: CreationSource;
  action_type: ActionType;
  target_form_id?: string;
  assignment_type: AssignmentType;
  max_volunteers: number;
  priority: TaskPriority;
  status: TaskStatus;
  start_time?: string;
  due_time: string;
  created_at?: string;
  assignments?: TaskAssignment[];
}

// --- 4. Activity Committees ---
export interface ActivityCommittee {
  id: string;
  activity_id?: string;
  name: string;
  leader_id?: string;
  description?: string;
  created_at?: string;
}

// --- 5. Main Activity Entity ---
export interface Activity {
  id: string;
  title: string;
  description?: string;
  unit_id?: number;
  created_by?: string;
  creation_source?: CreationSource;
  status: ActivityStatus;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  committees: ActivityCommittee[];
}

// --- 6. Input Payload Interfaces (DTOs) ---

/** مدخلات إنشاء المهمة */
export interface CreateTaskInput {
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  creation_source?: CreationSource;
  action_type?: ActionType;
  target_form_id?: string;
  assignment_type?: AssignmentType;
  max_volunteers?: number;
  priority?: TaskPriority;
  due_time: string;
  start_time?: string;
  assignee_ids?: string[];
}

/** مدخلات إنشاء لجنة فرعية داخل نشاط */
export interface CreateCommitteeInput {
  name: string;
  description?: string;
  leader_id?: string;
}

/** مدخلات إنشاء نشاط برامجي جديد */
export interface CreateActivityInput {
  title: string;
  description?: string;
  unit_id?: number;
  status?: ActivityStatus;
  start_date?: string;
  end_date?: string;
  creation_source?: CreationSource;
  committees?: CreateCommitteeInput[];
}
