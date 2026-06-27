export interface VolunteerProfileInput {
  volunteerId: string;
  fullName: string;
  nationalId: string;
  gender?: string;
  birthDate?: string;
  bloodType?: string;
  maritalStatus?: string;
  email?: string;
  education?: string;
  occupation?: string;
  address?: string;
  preferredOffice?: string;
  isNiqabi?: boolean;
  profileImageUrl?: string;
}
