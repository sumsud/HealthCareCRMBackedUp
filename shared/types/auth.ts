export interface Auth {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profile?: UserProfile;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isTwoFactorEnabled: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
  clinicName?: string;
  npiNumber?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiration?: Date;
}

export type UserRole = 'admin' | 'physician' | 'nurse' | 'frontdesk' | 'billing' | 'user';

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  clinicName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  title?: string;
  specialty?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bio?: string;
  clinicName?: string;
  npiNumber?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiration?: Date;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetupResponse {
  qrCodeUrl: string;
  secret: string;
}

export interface EnableTwoFactorRequest {
  token: string;
  secret: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorLoginRequest {
  email: string;
  token: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
