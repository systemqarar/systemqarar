export interface ExceptionMember {
  id: string;
  volunteer_number: string;
  full_name: string;
  photo_url: string | null;
  unit_name: string;
  notes: string | null;
  has_registered: boolean;
  created_at: string;
}
