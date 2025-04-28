import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Auth, LoginRequest, RegisterRequest, UpdateProfileRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@shared/types';
import apiService from '@/lib/api';
import { supabase, signInWithEmail, signUpWithEmail, signOut, resetPassword, updatePassword } from '@/lib/supabase';

const initialState: Auth = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

// Check if user is already authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      // Get user details from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }
      
      // Get additional user info from our API
      const userProfile = await apiService.get(`/auth/profile`);
      
      return {
        id: user.id,
        email: user.email,
        ...userProfile
      };
    } catch (error) {
      return rejectWithValue('Authentication check failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const { data, error } = await signInWithEmail(credentials.email, credentials.password);
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      // Get additional user info from our API after successful auth
      if (data?.user) {
        const userProfile = await apiService.get(`/auth/profile`);
        
        return {
          id: data.user.id,
          email: data.user.email,
          ...userProfile
        };
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      // First, create the user in Supabase
      const { data, error } = await signUpWithEmail(userData.email, userData.password, {
        username: userData.username,
        role: userData.role
      });
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      if (!data.user) {
        return rejectWithValue('Registration failed');
      }
      
      // Then, create user profile in our database
      await apiService.post('/auth/register', {
        supabaseId: data.user.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        title: userData.title,
        specialty: userData.specialty,
        clinicName: userData.clinicName
      });
      
      return {
        id: data.user.id,
        email: data.user.email,
        username: userData.username,
        role: userData.role
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await signOut();
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const updatedProfile = await apiService.put('/auth/profile', profileData);
      return updatedProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Request password reset
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send password reset email');
    }
  }
);

// Reset password with token
export const resetPasswordWithToken = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      // This uses the token automatically from the URL in Supabase
      const { error } = await updatePassword(data.password);
      
      if (error) {
        return rejectWithValue(error.message);
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          profile: {
            ...state.user?.profile,
            ...action.payload
          }
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
