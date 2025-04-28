import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import messageReducer from './slices/messageSlice';
import billingReducer from './slices/billingSlice';
import themeReducer from './slices/themeSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    appointments: appointmentReducer,
    messages: messageReducer,
    billing: billingReducer,
    theme: themeReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializability checks
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'patients/createPatient/fulfilled',
          'patients/updatePatient/fulfilled',
          'appointments/createAppointment/fulfilled',
          'appointments/updateAppointment/fulfilled',
          'billing/createInvoice/fulfilled',
          'billing/updateInvoice/fulfilled',
          'ai/createChatSession/fulfilled',
          'ai/sendChatMessage/fulfilled'
        ],
        // Ignore these field paths for serializability checks
        ignoredPaths: [
          'auth.user',
          'patients.currentPatient',
          'appointments.currentAppointment',
          'billing.currentInvoice',
          'ai.currentSession',
          'ai.messages'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
