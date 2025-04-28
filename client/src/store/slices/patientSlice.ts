import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PatientState, CreatePatientRequest, UpdatePatientRequest, FilterPatientsRequest, CreateClinicalNoteRequest, UpdateClinicalNoteRequest, SignClinicalNoteRequest } from '@shared/types';
import apiService from '@/lib/api';
import { generatePatientId } from '@/lib/utils';

const initialState: PatientState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  totalPatients: 0,
  page: 1,
  limit: 10
};

// Fetch all patients with pagination and filters
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (filters: FilterPatientsRequest = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaginated('/patients', filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patients');
    }
  }
);

// Fetch a single patient by ID
export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const patient = await apiService.get(`/patients/${id}`);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch patient');
    }
  }
);

// Create a new patient
export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData: CreatePatientRequest, { rejectWithValue }) => {
    try {
      // Generate patient ID if not provided
      const patientId = generatePatientId();
      
      const newPatient = await apiService.post('/patients', {
        ...patientData,
        patientId
      });
      
      return newPatient;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create patient');
    }
  }
);

// Update an existing patient
export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async (patientData: UpdatePatientRequest, { rejectWithValue }) => {
    try {
      const updatedPatient = await apiService.put(`/patients/${patientData.id}`, patientData);
      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update patient');
    }
  }
);

// Delete a patient (archive instead of hard delete for HIPAA compliance)
export const archivePatient = createAsyncThunk(
  'patients/archivePatient',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/patients/${id}/archive`, {});
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to archive patient');
    }
  }
);

// Fetch clinical notes for a patient
export const fetchClinicalNotes = createAsyncThunk(
  'patients/fetchClinicalNotes',
  async (patientId: number, { rejectWithValue }) => {
    try {
      const notes = await apiService.get(`/patients/${patientId}/clinical-notes`);
      return { patientId, notes };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch clinical notes');
    }
  }
);

// Create a clinical note
export const createClinicalNote = createAsyncThunk(
  'patients/createClinicalNote',
  async (noteData: CreateClinicalNoteRequest, { rejectWithValue }) => {
    try {
      const newNote = await apiService.post(`/patients/${noteData.patientId}/clinical-notes`, noteData);
      return newNote;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create clinical note');
    }
  }
);

// Update a clinical note
export const updateClinicalNote = createAsyncThunk(
  'patients/updateClinicalNote',
  async (noteData: UpdateClinicalNoteRequest, { rejectWithValue }) => {
    try {
      const updatedNote = await apiService.put(`/clinical-notes/${noteData.id}`, noteData);
      return updatedNote;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update clinical note');
    }
  }
);

// Sign a clinical note
export const signClinicalNote = createAsyncThunk(
  'patients/signClinicalNote',
  async (noteData: SignClinicalNoteRequest, { rejectWithValue }) => {
    try {
      const signedNote = await apiService.post(`/clinical-notes/${noteData.id}/sign`, {});
      return signedNote;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign clinical note');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.items;
        state.totalPatients = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Patient By ID
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Patient
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.payload);
        state.totalPatients += 1;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Patient
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in patients array
        const index = state.patients.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        
        // Update current patient if it's the one being edited
        if (state.currentPatient && state.currentPatient.id === action.payload.id) {
          state.currentPatient = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Archive Patient
      .addCase(archivePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archivePatient.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update patient status in list
        const index = state.patients.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        
        // Update current patient if it's the one being archived
        if (state.currentPatient && state.currentPatient.id === action.payload.id) {
          state.currentPatient = action.payload;
        }
      })
      .addCase(archivePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentPatient, clearError } = patientSlice.actions;
export default patientSlice.reducer;
