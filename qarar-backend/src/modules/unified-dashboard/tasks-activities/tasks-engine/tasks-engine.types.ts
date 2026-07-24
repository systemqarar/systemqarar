export type CreationSource = 'manual' | 'ai_chat' | 'ai_meeting' | 'annual_plan';
export type ActivityStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskActionType = 'standard' | 'form_filling' | 'file_upload';
export type AssignmentType = 'direct' | 'open_announcement';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type AssignmentStatus = 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'completed' | 'excused' | 'rejected';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  unit_id?: number;
  created_by: string;
  creation_source: CreationSource;
  status: ActivityStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface ActivityCommittee {
  id: string;
  activity_id: string;
  name: string;
  leader_id?: string;
  description?: string;
  created_at: string;
}

export interface Task {
  id: string;
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  created_by: string;
  creation_source: CreationSource;
  action_type: TaskActionType;
  target_form_id?: string;
  assignment_type: AssignmentType;
  max_volunteers: number;
  priority: TaskPriority;
  status: TaskStatus;
  start_time?: string;
  due_time: string;
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  volunteer_id: string;
  assigned_by?: string;
  assignment_mode: 'direct' | 'self_applied';
  status: AssignmentStatus;
  excuse_reason?: string;
  submission_data?: Record<string, any>;
  assigned_at: string;
  completed_at?: string;
}

export interface CreateTaskDTO {
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

export interface CreateActivityDTO {
  title: string;
  description?: string;
  unit_id?: number;
  start_date?: string;
  end_date?: string;
  creation_source?: CreationSource;
  committees?: {
    name: string;
    leader_id?: string;
    description?: string;
  }[];
}
