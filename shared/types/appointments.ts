export interface Appointment {
  id: number;
  patientId: number;
  providerId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'check-in' | 'completed' | 'cancelled' | 'no-show';
  appointmentType: 'in-person' | 'telehealth';
  reason?: string;
  notes?: string;
  isFollowUp: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelledBy?: number;
  cancelReason?: string;
  
  // Expanded properties (not stored in DB)
  patient?: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  totalAppointments: number;
  page: number;
  limit: number;
}

export interface CreateAppointmentRequest {
  patientId: number;
  providerId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status?: 'scheduled' | 'confirmed' | 'check-in' | 'completed' | 'cancelled' | 'no-show';
  appointmentType: 'in-person' | 'telehealth';
  reason?: string;
  notes?: string;
  isFollowUp?: boolean;
  isRecurring?: boolean;
  recurringPattern?: string;
  location?: string;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  id: number;
}

export interface CancelAppointmentRequest {
  id: number;
  cancelReason?: string;
}

export interface FilterAppointmentsRequest {
  providerId?: number;
  patientId?: number;
  status?: 'scheduled' | 'confirmed' | 'check-in' | 'completed' | 'cancelled' | 'no-show';
  appointmentType?: 'in-person' | 'telehealth';
  startDate?: Date;
  endDate?: Date;
  isFollowUp?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CheckInAppointmentRequest {
  id: number;
}

export interface CompleteAppointmentRequest {
  id: number;
  notes?: string;
}

export interface RescheduleAppointmentRequest {
  id: number;
  startTime: Date;
  endTime: Date;
  reason?: string;
}

export interface AppointmentStats {
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  providerId: number;
}
