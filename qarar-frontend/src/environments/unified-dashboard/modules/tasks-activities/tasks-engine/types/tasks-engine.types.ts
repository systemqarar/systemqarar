export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type AssignmentStatus = 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'completed' | 'excused' | 'rejected';

export interface TaskAssignment {
  assignment_id: string;
  volunteer_id: string;
  status: AssignmentStatus;
  assigned_at: string;
}

export interface Task {
  id: string;
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  creator_name?: string;
  action_type: 'standard' | 'form_filling' | 'file_upload';
  assignment_type: 'direct' | 'open_announcement';
  max_volunteers: number;
  priority: TaskPriority;
  status: TaskStatus;
  due_time: string;
  assignments?: TaskAssignment[];
}

export interface ActivityCommittee {
  id: string;
  name: string;
  leader_id?: string;
  description?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: string;
  committees: ActivityCommittee[];
}

export interface CreateTaskInput {
  activity_id?: string;
  committee_id?: string;
  title: string;
  description?: string;
  action_type?: 'standard' | 'form_filling' | 'file_upload';
  assignment_type?: 'direct' | 'open_announcement';
  max_volunteers?: number;
  priority?: TaskPriority;
  due_time: string;
  assignee_ids?: string[];
}
