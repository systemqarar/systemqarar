export interface FixedData {
  fullName: string;
  volunteerId: string;
  nationalId: string;
}

export interface EditableProfileData {
  gender: string;
  birthDate: string;
  bloodType: string;
  maritalStatus: string;
  email: string;
  education: string;
  occupation: string;
  address: string;
  preferredOffice: string;
  isNiqabi: boolean;
  profileImageUrl: string | null;
}

export interface ProfileFetchResponse {
  success: boolean;
  data: FixedData & EditableProfileData & { isProfileCompleted: boolean };
}
