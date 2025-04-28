export * from './auth';
export * from './patients';
export * from './appointments';
export * from './messages';
export * from './billing';
export * from './ai';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  category: string;
  icon?: string;
  userId: number;
  userName?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: 'view' | 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: 'small' | 'medium' | 'large';
}
