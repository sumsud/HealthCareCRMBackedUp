export interface Patient {
  id: number;
  patientId: string; // e.g., P-12345
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insurance?: string;
  insuranceMemberId?: string;
  insuranceGroupId?: string;
  primaryCarePhysician?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  status: 'active' | 'inactive' | 'archived';
  consentToTreat: boolean;
  consentToShare: boolean;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  lastVisitDate?: Date;
}

export interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  totalPatients: number;
  page: number;
  limit: number;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insurance?: string;
  insuranceMemberId?: string;
  insuranceGroupId?: string;
  primaryCarePhysician?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  status?: 'active' | 'inactive' | 'archived';
  consentToTreat?: boolean;
  consentToShare?: boolean;
  preferredLanguage?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: number;
}

export interface FilterPatientsRequest {
  search?: string;
  status?: 'active' | 'inactive' | 'archived';
  sortBy?: 'firstName' | 'lastName' | 'lastVisitDate' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClinicalNote {
  id: number;
  patientId: number;
  providerId: number;
  appointmentId?: number;
  noteType: string;
  title: string;
  content: string;
  isSigned: boolean;
  isLocked: boolean;
  signedAt?: Date;
  signedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateClinicalNoteRequest {
  patientId: number;
  appointmentId?: number;
  noteType: string;
  title: string;
  content: string;
}

export interface UpdateClinicalNoteRequest {
  id: number;
  title?: string;
  content?: string;
}

export interface SignClinicalNoteRequest {
  id: number;
}
