import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppointmentState, CreateAppointmentRequest, UpdateAppointmentRequest, CancelAppointmentRequest, FilterAppointmentsRequest, CheckInAppointmentRequest, CompleteAppointmentRequest, RescheduleAppointmentRequest } from '@shared/types';
import apiService from '@/lib/api';

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  totalAppointments: 0,
  page: 1,
  limit: 10
};

// Fetch appointments with pagination and filters
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (filters: FilterAppointmentsRequest = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaginated('/appointments', filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch appointments');
    }
  }
);

// Fetch today's appointments
export const fetchTodayAppointments = createAsyncThunk(
  'appointments/fetchTodayAppointments',
  async (providerId?: number, { rejectWithValue }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const filters: FilterAppointmentsRequest = {
        startDate: today,
        endDate: tomorrow,
        providerId
      };
      
      const response = await apiService.getPaginated('/appointments', filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch today\'s appointments');
    }
  }
);

// Fetch a single appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id: number, { rejectWithValue }) => {
    try {
      const appointment = await apiService.get(`/appointments/${id}`);
      return appointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch appointment');
    }
  }
);

// Create a new appointment
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: CreateAppointmentRequest, { rejectWithValue }) => {
    try {
      const newAppointment = await apiService.post('/appointments', appointmentData);
      return newAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create appointment');
    }
  }
);

// Update an existing appointment
export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async (appointmentData: UpdateAppointmentRequest, { rejectWithValue }) => {
    try {
      const updatedAppointment = await apiService.put(`/appointments/${appointmentData.id}`, appointmentData);
      return updatedAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update appointment');
    }
  }
);

// Cancel an appointment
export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (cancelData: CancelAppointmentRequest, { rejectWithValue }) => {
    try {
      const cancelledAppointment = await apiService.post(`/appointments/${cancelData.id}/cancel`, {
        cancelReason: cancelData.cancelReason
      });
      return cancelledAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel appointment');
    }
  }
);

// Check in a patient for an appointment
export const checkInAppointment = createAsyncThunk(
  'appointments/checkInAppointment',
  async (data: CheckInAppointmentRequest, { rejectWithValue }) => {
    try {
      const checkedInAppointment = await apiService.post(`/appointments/${data.id}/check-in`, {});
      return checkedInAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check in appointment');
    }
  }
);

// Mark an appointment as completed
export const completeAppointment = createAsyncThunk(
  'appointments/completeAppointment',
  async (data: CompleteAppointmentRequest, { rejectWithValue }) => {
    try {
      const completedAppointment = await apiService.post(`/appointments/${data.id}/complete`, {
        notes: data.notes
      });
      return completedAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete appointment');
    }
  }
);

// Reschedule an appointment
export const rescheduleAppointment = createAsyncThunk(
  'appointments/rescheduleAppointment',
  async (data: RescheduleAppointmentRequest, { rejectWithValue }) => {
    try {
      const rescheduledAppointment = await apiService.post(`/appointments/${data.id}/reschedule`, {
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason
      });
      return rescheduledAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reschedule appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.items;
        state.totalAppointments = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Today's Appointments
      .addCase(fetchTodayAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.items;
        state.totalAppointments = action.payload.total;
      })
      .addCase(fetchTodayAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Appointment By ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.payload);
        state.totalAppointments += 1;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in appointments array
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        
        // Update current appointment if it's the one being edited
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in appointments array
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        
        // Update current appointment if it's the one being cancelled
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check-in Appointment
      .addCase(checkInAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInAppointment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in appointments array
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        
        // Update current appointment if it's the one being checked in
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(checkInAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete Appointment
      .addCase(completeAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in appointments array
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        
        // Update current appointment if it's the one being completed
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in appointments array
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        
        // Update current appointment if it's the one being rescheduled
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentAppointment, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
